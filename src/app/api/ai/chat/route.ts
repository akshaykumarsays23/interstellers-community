import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Optional real web search helper if configured
async function performWebSearchIfConfigured(query: string): Promise<{ searchSummary: string; sources: string[] } | null> {
  const tavilyKey = process.env.TAVILY_API_KEY?.trim();
  const serperKey = process.env.SERPER_API_KEY?.trim();

  if (tavilyKey) {
    try {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: tavilyKey, query, max_results: 3 }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results) && data.results.length > 0) {
          const sources = data.results.map((r: { title?: string; url?: string }) => `${r.title || 'Source'}: ${r.url || ''}`);
          const context = data.results
            .map((r: { title?: string; url?: string; content?: string }) => `[${r.title || 'Page'}] (${r.url || ''}):\n${r.content || ''}`)
            .join('\n\n');
          return { searchSummary: context, sources };
        }
      }
    } catch (e) {
      console.error('Tavily search provider error:', e);
    }
  }

  if (serperKey) {
    try {
      const res = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': serperKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: query, num: 3 }),
      });
      if (res.ok) {
        const data = await res.json();
        const items = data.organic || [];
        if (items.length > 0) {
          const sources = items.map((r: { title?: string; link?: string }) => `${r.title || 'Source'}: ${r.link || ''}`);
          const context = items
            .map((r: { title?: string; link?: string; snippet?: string }) => `[${r.title || 'Page'}] (${r.link || ''}):\n${r.snippet || ''}`)
            .join('\n\n');
          return { searchSummary: context, sources };
        }
      }
    } catch (e) {
      console.error('Serper search provider error:', e);
    }
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, history = [], userEmail } = body;

    // 1. Validation
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length > 4000) {
      return NextResponse.json({ error: 'Message is too long. Please keep under 4000 characters.' }, { status: 400 });
    }

    // 2. Resolve Verified User Profile from Server Database
    const db = getDb();
    let verifiedName = 'Traveler';
    let verifiedHandle = 'traveler';
    let verifiedRole = 'Explorer';
    let isAuthenticated = false;

    if (userEmail && typeof userEmail === 'string') {
      const cleanEmail = userEmail.toLowerCase().trim().replace(/[\.\s]+$/, '').trim();
      const isHost = cleanEmail === 'akshaycricketer1230@gmail.com' || cleanEmail === 'akshay@interstellers.space';

      if (isHost) {
        verifiedName = 'Akshay Kumar';
        verifiedHandle = 'akshay';
        verifiedRole = 'Host, Founder & Lead Commander of Interstellers';
        isAuthenticated = true;
      } else if (db.approvedEmails?.includes(cleanEmail)) {
        const reg = db.registrations?.find((r) => r.email?.toLowerCase() === cleanEmail);
        verifiedName = reg?.name || cleanEmail.split('@')[0];
        verifiedHandle = verifiedName.toLowerCase().replace(/\s+/g, '_');
        verifiedRole = 'Verified Community Member';
        isAuthenticated = true;
      } else if (db.registrations) {
        const reg = db.registrations.find((r) => r.email?.toLowerCase() === cleanEmail);
        if (reg && reg.status === 'approved') {
          verifiedName = reg.name;
          verifiedHandle = reg.name.toLowerCase().replace(/\s+/g, '_');
          verifiedRole = 'Verified Community Member';
          isAuthenticated = true;
        }
      }
    }

    // Check if web search is needed
    const isSearchQuery = /\b(search|latest news|current news|breaking news|live news|real-time|latest updates?)\b/i.test(trimmedMessage);
    let searchGrounding = '';
    const hasSearchConfig = Boolean(process.env.TAVILY_API_KEY?.trim() || process.env.SERPER_API_KEY?.trim());

    if (isSearchQuery && hasSearchConfig) {
      const searchResult = await performWebSearchIfConfigured(trimmedMessage);
      if (searchResult && searchResult.searchSummary) {
        searchGrounding = `\n\nREAL-TIME WEB SEARCH RESULTS (Retrieved for current query):\n${searchResult.searchSummary}\n\nAnswer using the above search results and cite the reliable source links accurately.`;
      }
    }

    // 3. Build Server-side System Prompt
    const systemPrompt = `You are Nova, the friendly AI assistant inside Interstellers.

You are intelligent, helpful, conversational, natural, and trustworthy.

Understand the user's actual question before responding.

Answer directly instead of giving generic templates.

Use simple English and adapt your explanation to the user's level.

For simple questions, answer briefly.

For complex questions, explain step by step.

For greetings, respond naturally.

Avoid unnecessary headings, numbered lists, and emojis.

Do not repeatedly introduce yourself.

Do not use robotic phrases such as 'Core Explanation' or 'Key Context' unless specifically requested.

Ask follow-up questions only when necessary.

If you do not know something, admit it honestly.

Never fabricate facts, search results, citations, user information, or completed actions.

Use the previous messages in the current conversation to understand follow-up questions.

Never claim to remember information that is not available in the conversation or authorized user context.

Be helpful without pretending to be human.

AUTHENTICATED USER CONTEXT (Verified from database):
- Is Authenticated: ${isAuthenticated ? 'Yes' : 'No'}
- Full Name: ${verifiedName}
- Username / Handle: @${verifiedHandle}
- Role on Interstellers: ${verifiedRole}
- Community Platform: Interstellers (www.akshayweb.com)

SPECIFIC DIRECT ANSWER INSTRUCTIONS:
- If the user asks "Who am I?", answer directly and naturally: "You're ${verifiedName}, also known as @${verifiedHandle}, on Interstellers. What would you like to explore today?"
- If the user asks "What is my name and job to do here?" or similar, directly state their name (${verifiedName}) and role (${verifiedRole}) on Interstellers.
- If the user asks "What is my username?", answer directly: "Your username is @${verifiedHandle}."
- If the user asks for live search or latest news: ${
      hasSearchConfig && searchGrounding
        ? 'A live search was executed and results are provided below.'
        : 'Live web search is not currently configured. Honestly and concisely explain that live web search is unavailable, without fabricating false news or imaginary links.'
    }
- Maintain accurate memory across conversational follow-ups (e.g., remembering previously stated favorite subjects, choices, or facts).${searchGrounding}`;

    // 4. Sanitize and Format Conversation History (last 12 messages maximum)
    const validHistory: HistoryMessage[] = Array.isArray(history)
      ? history
          .slice(-12)
          .filter(
            (m): m is HistoryMessage =>
              Boolean(m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
          )
      : [];

    // 5. Connect to Real AI Model Provider
    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    const openaiKey = process.env.OPENAI_API_KEY?.trim();
    const groqKey = process.env.GROQ_API_KEY?.trim();

    // Priority 1: Google Gemini (gemini-3.7-flash / gemini-3.8-flash / gemini-3.5-flash)
    if (geminiKey) {
      try {
        const geminiModels = [
          'gemini-3.7-flash',
          'gemini-3.8-flash',
          'gemini-3.5-flash',
        ];
        let data: any = null;
        let lastErrText = '';

        const contents = [
          ...validHistory.map((h) => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }],
          })),
          {
            role: 'user',
            parts: [{ text: trimmedMessage }],
          },
        ];

        for (const model of geminiModels) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 7000);

            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
            const response = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: JSON.stringify({
                system_instruction: {
                  parts: [{ text: systemPrompt }],
                },
                contents,
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 1000,
                },
              }),
            });
            clearTimeout(timeoutId);

            if (response.ok) {
              const resJson = await response.json();
              if (resJson?.candidates?.[0]?.content?.parts?.[0]?.text) {
                data = resJson;
                break;
              }
            } else {
              lastErrText = await response.text();
              console.warn(`Gemini API (${model}) returned status ${response.status}:`, lastErrText);
            }
          } catch (modelErr: any) {
            console.warn(`Gemini (${model}) request failed or timed out:`, modelErr?.message || modelErr);
          }
        }

        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (reply && typeof reply === 'string') {
          return NextResponse.json({ reply: reply.trim() });
        }

        console.error('All Gemini model fallbacks exhausted. Last error:', lastErrText);
        return NextResponse.json(
          {
            error: 'Nova is temporarily experiencing high demand from Google AI. Please try your message again in a moment.',
            details: lastErrText || 'All Gemini models busy',
          },
          { status: 502 }
        );
      } catch (err: any) {
        console.error('Gemini provider error:', err);
        return NextResponse.json(
          { error: 'Nova is temporarily unavailable. Please try again.', details: err?.message },
          { status: 502 }
        );
      }
    }

    // Priority 2: OpenAI (gpt-4o-mini)
    if (openaiKey) {
      try {
        const openaiUrl = 'https://api.openai.com/v1/chat/completions';
        const messages = [
          { role: 'system', content: systemPrompt },
          ...validHistory.map((h) => ({
            role: h.role,
            content: h.content,
          })),
          { role: 'user', content: trimmedMessage },
        ];

        const response = await fetch(openaiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.7,
            max_tokens: 1000,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error('OpenAI API returned error:', response.status, errText);
          return NextResponse.json(
            { error: 'Nova is temporarily unavailable. Please try again.' },
            { status: 502 }
          );
        }

        const data = await response.json();
        const reply = data?.choices?.[0]?.message?.content;

        if (reply && typeof reply === 'string') {
          return NextResponse.json({ reply: reply.trim() });
        }

        return NextResponse.json(
          { error: 'Nova is temporarily unavailable. Please try again.' },
          { status: 502 }
        );
      } catch (err) {
        console.error('OpenAI provider error:', err);
        return NextResponse.json(
          { error: 'Nova is temporarily unavailable. Please try again.' },
          { status: 502 }
        );
      }
    }

    // Priority 3: Groq (llama-3.3-70b-versatile)
    if (groqKey) {
      try {
        const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';
        const messages = [
          { role: 'system', content: systemPrompt },
          ...validHistory.map((h) => ({
            role: h.role,
            content: h.content,
          })),
          { role: 'user', content: trimmedMessage },
        ];

        const response = await fetch(groqUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages,
            temperature: 0.7,
            max_tokens: 1000,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error('Groq API error:', response.status, errText);
          return NextResponse.json(
            { error: 'Nova is temporarily unavailable. Please try again.' },
            { status: 502 }
          );
        }

        const data = await response.json();
        const reply = data?.choices?.[0]?.message?.content;

        if (reply && typeof reply === 'string') {
          return NextResponse.json({ reply: reply.trim() });
        }

        return NextResponse.json(
          { error: 'Nova is temporarily unavailable. Please try again.' },
          { status: 502 }
        );
      } catch (err) {
        console.error('Groq provider error:', err);
        return NextResponse.json(
          { error: 'Nova is temporarily unavailable. Please try again.' },
          { status: 502 }
        );
      }
    }

    // If no provider key is configured on server
    return NextResponse.json(
      {
        error: 'Nova AI requires GEMINI_API_KEY to be configured in Vercel Environment Variables. Please add GEMINI_API_KEY to your Vercel Project Settings and redeploy.',
        details: 'Missing GEMINI_API_KEY in server environment. Please go to Vercel Project Settings -> Environment Variables, add GEMINI_API_KEY, and redeploy.',
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('Unexpected error in Nova AI chat route:', error);
    return NextResponse.json(
      { error: 'Nova is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}
