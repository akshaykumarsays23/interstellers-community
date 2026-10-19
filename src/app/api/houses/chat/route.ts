import { NextResponse } from 'next/server';
import {
  awardHousePoints,
  ensureCommunitySchema,
  ensureHouseAssignment,
  getCommunitySql,
  getCommunityUser,
} from '@/lib/community';

export const dynamic = 'force-dynamic';
const MAX_MESSAGES = 100;

export async function GET(request: Request) {
  const user = getCommunityUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const sql = getCommunitySql();
    await ensureCommunitySchema(sql);
    const assignment = await ensureHouseAssignment(sql, user);
    if (!assignment.house) {
      return NextResponse.json({ error: 'Choose a House to access its chat.' }, { status: 403 });
    }
    const url = new URL(request.url);
    const before = url.searchParams.get('before');
    const rows = before
      ? await sql`
          SELECT data, created_at
          FROM interstellers_house_chat
          WHERE house = ${assignment.house} AND created_at < ${before}::timestamptz
          ORDER BY created_at DESC
          LIMIT ${MAX_MESSAGES}
        `
      : await sql`
          SELECT data, created_at
          FROM interstellers_house_chat
          WHERE house = ${assignment.house}
          ORDER BY created_at DESC
          LIMIT ${MAX_MESSAGES}
        `;
    return NextResponse.json({
      messages: rows.reverse().map((row) => row.data),
      hasMore: rows.length === MAX_MESSAGES,
    });
  } catch (error) {
    console.error('House chat fetch failed:', error);
    return NextResponse.json({ error: 'House chat is temporarily unavailable.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = getCommunityUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const body = await request.json();
    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    if (!text || text.length > 1000) {
      return NextResponse.json({ error: 'Messages must contain 1–1000 characters.' }, { status: 400 });
    }
    if (typeof body.id !== 'string' || !/^[a-zA-Z0-9_-]{8,100}$/.test(body.id)) {
      return NextResponse.json({ error: 'A valid message ID is required.' }, { status: 400 });
    }

    const sql = getCommunitySql();
    await ensureCommunitySchema(sql);
    const assignment = await ensureHouseAssignment(sql, user);
    if (!assignment.house) {
      return NextResponse.json({ error: 'Choose a House before sending a message.' }, { status: 403 });
    }

    const createdAt = new Date().toISOString();
    const message = {
      id: body.id,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      house: assignment.house,
      text,
      timestamp: createdAt,
    };
    const inserted = await sql`
      INSERT INTO interstellers_house_chat (id, user_id, house, data, created_at)
      VALUES (${body.id}, ${user.id}, ${assignment.house}, ${JSON.stringify(message)}::jsonb, ${createdAt}::timestamptz)
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `;
    if (inserted.length === 0) {
      const existing = await sql`
        SELECT user_id, data
        FROM interstellers_house_chat
        WHERE id = ${body.id}
      `;
      if (
        existing[0]?.user_id !== user.id ||
        (existing[0]?.data as { text?: string } | undefined)?.text !== text
      ) {
        return NextResponse.json({ error: 'This message ID is already in use.' }, { status: 409 });
      }
    }

    await awardHousePoints(sql, user, assignment.house, 'house_chat_message', body.id, 2);
    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('House chat send failed:', error);
    return NextResponse.json({ error: 'Message could not be saved. Please try again.' }, { status: 500 });
  }
}
