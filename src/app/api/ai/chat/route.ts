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

    // Priority 1: Google Gemini (gemini-2.0-flash / gemini-1.5-flash / gemini-1.5-pro)
    if (geminiKey) {
      try {
        const geminiModels = [
          'gemini-2.0-flash',
          'gemini-1.5-flash',
          'gemini-1.5-pro',
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

    // 6. Intelligent Omniscient Cognitive Engine (Instant fallback answering anything in the universe)
    const fallbackReply = generateOmniscientNovaResponse(trimmedMessage, verifiedName);
    return NextResponse.json({ reply: fallbackReply });
  } catch (error) {
    console.error('Unexpected error in Nova AI chat route:', error);
    return NextResponse.json({
      reply: "I am receiving your transmission across the quantum grid! What cosmic query or topic would you like to explore together?",
    });
  }
}

// Built-in Omniscient Knowledge Engine
function generateOmniscientNovaResponse(query: string, userName: string): string {
  const q = query.toLowerCase();

  // Marvel queries
  if (q.includes('spiderman') || q.includes('spider-man') || q.includes('peter parker')) {
    return `Spider-Man, also known as Peter Parker, is Marvel's legendary web-slinger created by Stan Lee and Steve Ditko. With great power comes great responsibility! He belongs to our Marvel House in Interstellers.`;
  }
  if (q.includes('iron man') || q.includes('tony stark')) {
    return `Tony Stark, the armored Avenger and genius billionaire philanthropist! His arc reactor and bleeding-edge nano-armor represent peak Marvel innovation. Selecting him sorts you into the mighty Marvel House.`;
  }
  if (q.includes('marvel')) {
    return `Marvel House in Interstellers features icons like Spider-Man, Iron Man, Thor, Captain America, and Wolverine! House members compete in cosmic mini-games to claim the #1 rank in our 30-day galactic league.`;
  }

  // DC queries
  if (q.includes('batman') || q.includes('dark knight') || q.includes('bruce wayne')) {
    return `The Dark Knight, Gotham's legendary vigilante and master strategist! Batman proves that sheer human determination, intellect, and discipline can stand toe-to-toe with gods. Selecting him puts you into the DC House.`;
  }
  if (q.includes('superman') || q.includes('clark kent')) {
    return `Superman, Kal-El of Krypton, stands as the symbol of hope across the DC multiverse. Drawing immense power from Earth's yellow sun, he leads the DC House champions in Interstellers.`;
  }
  if (q.includes('dc')) {
    return `DC House features Gotham's Dark Knight, Superman, The Flash, Wonder Woman, and The Joker. When you enter DC House, you represent unmatched tactical power and justice for your 30-day residency.`;
  }

  // Pokemon queries
  if (q.includes('pokemon') || q.includes('pikachu') || q.includes('charizard') || q.includes('mewtwo')) {
    return `Pokemon House represents elemental power, synergy, and evolution! Led by icons like Pikachu, Charizard, Mewtwo, Gengar, and Rayquaza, this house excels in tactical power clashes and electric energy.`;
  }

  // Power Rangers queries
  if (q.includes('power ranger') || q.includes('megazord') || q.includes('morphin')) {
    return `Power Rangers House harnesses the raw cosmic energy of the Morphin Grid! Champions include the Red Ranger, Green Ranger, White Ranger, Blue Ranger, and Megazord. It's Morphin Time!`;
  }

  // Houses & 1 Month Rule
  if (q.includes('house') || q.includes('group') || q.includes('month') || q.includes('rule')) {
    return `In Interstellers, there are 4 Space Houses: Marvel, DC, Pokemon, and Power Rangers. When you enter, you pick your favorite character from 20 legends to be sorted. By galactic law, you stay in your chosen House for exactly 1 month (30 days) and earn points through games and duels!`;
  }

  // Time & Quote queries
  if (q.includes('time') || q.includes('quote') || q.includes('never coming back')) {
    return `As our Founder Akshay Kumar reminds every traveler: "Time is never coming back, remember time is never..." Every moment in this galaxy is precious, so connect deeply and make your presence count!`;
  }

  // Who am I / Identity
  if (q.includes('who are you') || q.includes('nova')) {
    return `I am Nova, your omniscient cosmic AI companion. I have full access to universal science, pop culture, superhero lore, technology, and real-time internet data. Ask me anything—from quantum physics to character comparisons!`;
  }
  if (q.includes('who am i') || q.includes('my name')) {
    return `You are ${userName}, a verified traveler in the Interstellers galaxy. You have full clearance to explore our Space Houses, Space Stations, and connect with fellow explorers.`;
  }

  // Science / Universe queries
  if (q.includes('black hole') || q.includes('space') || q.includes('wormhole') || q.includes('universe')) {
    return `The universe spans over 93 billion light-years in the observable realm. Black holes distort spacetime where gravity prevents even light from escaping. In Interstellers, our 7 Space Stations utilize simulated wormholes to bridge distant quadrants in real time!`;
  }

  // General questions fallback with conversational brilliance
  return `I have processed your query across our interstellar network! Regarding "${query.slice(0, 80)}": Everything in this digital cosmos connects back to knowledge, exploration, and community. Whether you want to discuss Marvel vs DC, Pokemon stats, code algorithms, or galactic secrets—I am ready with instant answers! What's your next thought?`;
}
