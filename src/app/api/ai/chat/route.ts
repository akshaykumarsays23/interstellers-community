import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' },
  });
}

function normalizeHistory(history: unknown): HistoryMessage[] {
  if (!Array.isArray(history)) return [];

  const sanitized = history
    .slice(-12)
    .filter(
      (message): message is HistoryMessage =>
        Boolean(
          message &&
            (message.role === 'user' || message.role === 'assistant') &&
            typeof message.content === 'string' &&
            message.content.trim()
        )
    )
    .map((message) => ({ ...message, content: message.content.trim() }));

  // The initial greeting and any unanswered user turn are not part of a completed exchange.
  while (sanitized[0]?.role === 'assistant') sanitized.shift();
  if (sanitized[sanitized.length - 1]?.role === 'user') sanitized.pop();

  return sanitized.reduce<HistoryMessage[]>((turns, message) => {
    const previous = turns[turns.length - 1];
    if (previous?.role === message.role) {
      previous.content = `${previous.content}\n${message.content}`;
    } else {
      turns.push(message);
    }
    return turns;
  }, []);
}

// Optional real web search helper if configured
async function performWebSearchIfConfigured(query: string): Promise<{ searchSummary: string; sources: string[] } | null> {
  const tavilyKey = process.env.TAVILY_API_KEY?.trim();
  const serperKey = process.env.SERPER_API_KEY?.trim();

  if (tavilyKey) {
    try {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        cache: 'no-store',
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
        cache: 'no-store',
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
      return jsonResponse({ error: 'Message cannot be empty.' }, 400);
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length > 4000) {
      return jsonResponse({ error: 'Message is too long. Please keep under 4000 characters.' }, 400);
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

    // 3. Build Server-side System Prompt for Omniscient Nova AI
    const systemPrompt = `You are Nova, the omniscient, super-intelligent cosmic AI assistant of Interstellers.
You have comprehensive, encyclopedic knowledge of everything across the cosmos and Earth:
- Pop culture, superheroes, lore: Marvel (Spider-Man, Iron Man, Thor, Cap, Wolverine, MCU), DC (The Dark Knight/Batman, Superman, Flash, Wonder Woman, Joker), Pokemon (Pikachu, Charizard, Mewtwo, types, evolutions), Power Rangers (Red Ranger, Green Ranger, Megazord), anime, cinema, and literature.
- Science & Cosmos: Quantum mechanics, space exploration, astronomy, black holes, time dilation, astrophysics.
- Computer science, coding, technology, web architectures, AI, internet culture.
- History, world knowledge, languages, and philosophies.
- The Interstellers Galaxy: Founded by Akshay Kumar ("Time is never coming back, remember time is never..."), featuring 4 Space Houses (Marvel, DC, Pokemon, Power Rangers with 1-month residency rule), 15 Questions Fellow Matching, and living Space Stations.

CRITICAL INSTRUCTIONS:
- You speak like an omniscient, brilliantly helpful, high-speed cosmic intelligence.
- Never say "I don't know, I'm just in Interstellers" or give generic apologies. You know the answers across all fields.
- Answer user questions directly, intelligently, accurately, and with engaging cosmic warmth.
- For simple or voice questions, give crisp, punchy, conversational replies suitable for spoken voice.
- For complex questions, explain step by step.

AUTHENTICATED USER CONTEXT:
- Is Authenticated: ${isAuthenticated ? 'Yes' : 'No'}
- Full Name: ${verifiedName}
- Username / Handle: @${verifiedHandle}
- Role on Interstellers: ${verifiedRole}
- Community Platform: Interstellers (Official Vercel Network)${searchGrounding}`;

    // 4. Sanitize and Format Conversation History (last 12 messages maximum)
    const validHistory = normalizeHistory(history);

    // 5. Connect to Real AI Model Provider
    const openaiKey = process.env.OPENAI_API_KEY?.trim();
    const openaiModel = process.env.OPENAI_MODEL?.trim();

    if (!openaiKey) {
      return jsonResponse({ error: 'OpenAI is not configured. Set OPENAI_API_KEY on the server.' }, 503);
    }

    if (!openaiModel) {
      return jsonResponse({ error: 'OpenAI is not configured. Set OPENAI_MODEL on the server.' }, 503);
    }

    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    const groqKey = process.env.GROQ_API_KEY?.trim();

    // Priority 1: Google Gemini
    if (geminiKey && !openaiKey) {
      try {
        const geminiModels = [
          'gemini-flash-latest',
          'gemini-2.5-flash',
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
            const timeoutId = setTimeout(() => controller.abort(), 12000);

            let response: Response;
            try {
              response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-goog-api-key': geminiKey,
                },
                cache: 'no-store',
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
            } finally {
              clearTimeout(timeoutId);
            }

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
          return jsonResponse({ reply: reply.trim() });
        }

        console.warn('All Gemini models attempted, falling through to secondary providers. Last error:', lastErrText);
      } catch (err: any) {
        console.warn('Gemini provider error, falling through to secondary providers:', err?.message || err);
      }
    }

    // Priority 2: OpenAI
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
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: openaiModel,
            messages,
            temperature: 0.7,
            max_tokens: 1000,
          }),
        });

        if (!response.ok) {
          console.error('OpenAI API returned status:', response.status);
          if ([400, 404, 422].includes(response.status)) {
            return jsonResponse(
              { error: 'The configured OpenAI model is invalid or unavailable. Check OPENAI_MODEL and your OpenAI access.' },
              502
            );
          }
          return jsonResponse({ error: 'Nova is temporarily unavailable. Please try again.' }, 502);
        }

        const data = await response.json();
        const reply = data?.choices?.[0]?.message?.content;

        if (reply && typeof reply === 'string') {
          return jsonResponse({ reply: reply.trim() });
        }

        return jsonResponse({ error: 'Nova is temporarily unavailable. Please try again.' }, 502);
      } catch (err) {
        console.error('OpenAI provider request failed:', err);
        return jsonResponse({ error: 'Nova is temporarily unavailable. Please try again.' }, 502);
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
          cache: 'no-store',
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
          return jsonResponse({ error: 'Nova is temporarily unavailable. Please try again.' }, 502);
        }

        const data = await response.json();
        const reply = data?.choices?.[0]?.message?.content;

        if (reply && typeof reply === 'string') {
          return jsonResponse({ reply: reply.trim() });
        }

        return jsonResponse({ error: 'Nova is temporarily unavailable. Please try again.' }, 502);
      } catch (err) {
        console.error('Groq provider error:', err);
        return jsonResponse({ error: 'Nova is temporarily unavailable. Please try again.' }, 502);
      }
    }

    if (!geminiKey) {
      return jsonResponse(
        { error: 'No AI provider is configured. Set GEMINI_API_KEY in the Vercel project environment, then redeploy.' },
        503
      );
    }

    return jsonResponse(
      { error: 'Gemini could not complete this request. Check the server logs and Gemini API configuration.' },
      502
    );
  } catch (error) {
    console.error('Unexpected error in Nova AI chat route:', error);
    return jsonResponse({ error: 'Nova is temporarily unavailable. Please try again.' }, 500);
  }
}
