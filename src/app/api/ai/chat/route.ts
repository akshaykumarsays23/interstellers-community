import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

interface HistoryMessage { role: 'user' | 'assistant'; content: string; }

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' } });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeHistory(history: unknown): HistoryMessage[] {
  if (!Array.isArray(history)) return [];
  const messages = history.slice(-12).filter((item): item is HistoryMessage =>
    isRecord(item) && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string' && item.content.trim().length > 0
  ).map((item) => ({ role: item.role, content: item.content.trim().slice(0, 4000) }));
  while (messages[0]?.role === 'assistant') messages.shift();
  if (messages.at(-1)?.role === 'user') messages.pop();
  return messages;
}

async function requestGemini(apiKey: string, model: string, systemPrompt: string, history: HistoryMessage[], message: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST', cache: 'no-store', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [...history.map((item) => ({ role: item.role === 'assistant' ? 'model' : 'user', parts: [{ text: item.content }] })), { role: 'user', parts: [{ text: message }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
      }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.warn(`Gemini request failed (HTTP ${response.status}): ${detail.slice(0, 400)}`);
      if (response.status === 400 || response.status === 404) throw new Error('Gemini model is unavailable. Set GEMINI_MODEL to a model enabled for this API key.');
      if (response.status === 401 || response.status === 403) throw new Error('Gemini rejected the server API key. Check GEMINI_API_KEY and its permissions.');
      if (response.status === 429) throw new Error('Gemini is temporarily rate limiting requests. Please try again shortly.');
      throw new Error('Gemini is temporarily unavailable. Please try again.');
    }
    const data: unknown = await response.json();
    const candidate = isRecord(data) && Array.isArray(data.candidates) ? data.candidates[0] : null;
    const content = isRecord(candidate) && isRecord(candidate.content) ? candidate.content : null;
    const firstPart = content && Array.isArray(content.parts) ? content.parts[0] : null;
    if (!isRecord(firstPart) || typeof firstPart.text !== 'string' || !firstPart.text.trim()) throw new Error('Gemini returned no response. Please try again.');
    return firstPart.text.trim();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('Gemini took too long to respond. Please try again.');
    if (error instanceof TypeError) throw new Error('Anant could not reach Gemini. Check the server network connection and try again.');
    throw error;
  } finally { clearTimeout(timeout); }
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return jsonResponse({ error: 'Request body must contain valid JSON.' }, 400); }
  if (!isRecord(body)) return jsonResponse({ error: 'Request body must be a JSON object.' }, 400);
  const { message, history = [], userEmail } = body;
  if (typeof message !== 'string' || !message.trim()) return jsonResponse({ error: 'Message cannot be empty.' }, 400);
  const prompt = message.trim();
  if (prompt.length > 4000) return jsonResponse({ error: 'Message is too long. Please keep under 4000 characters.' }, 400);
  if (!Array.isArray(history)) return jsonResponse({ error: 'Conversation history must be an array.' }, 400);

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return jsonResponse({ error: 'Anant is not configured. Add GEMINI_API_KEY to the server environment and redeploy.' }, 503);

  let name = 'Traveler'; let handle = 'traveler'; let role = 'Explorer';
  if (typeof userEmail === 'string') {
    const email = userEmail.toLowerCase().trim().replace(/[.\s]+$/, '');
    const db = getDb();
    const registration = db.registrations?.find((item) => item.email?.toLowerCase() === email);
    if (email === 'akshaycricketer1230@gmail.com' || email === 'akshay@interstellers.space') { name = 'Akshay Kumar'; handle = 'akshay'; role = 'Host and Founder'; }
    else if (db.approvedEmails?.includes(email) || registration?.status === 'approved') { name = registration?.name || email.split('@')[0]; handle = name.toLowerCase().replace(/\s+/g, '_'); role = 'Verified Community Member'; }
  }

  const systemPrompt = `You are Anant, the helpful AI assistant for Interstellers. Be warm, clear, concise, and accurate. Answer directly; explain complex topics step by step. Do not claim live web access or knowledge beyond your training. Interstellers is a community platform founded by Akshay Kumar, with Marvel, DC, Pokemon, and Power Rangers Space Houses, fellow matching, and Space Stations.\n\nUSER CONTEXT:\n- Name: ${name}\n- Handle: @${handle}\n- Role: ${role}`;
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';
  try {
    const reply = await requestGemini(apiKey, model, systemPrompt, normalizeHistory(history), prompt);
    return jsonResponse({ reply });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Anant is temporarily unavailable. Please try again.';
    console.error('Anant chat request failed:', errorMessage);
    return jsonResponse({ error: errorMessage }, 502);
  }
}
