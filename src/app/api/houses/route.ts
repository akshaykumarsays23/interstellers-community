import { NextResponse } from 'next/server';
import {
  awardHousePoints,
  ensureCommunitySchema,
  ensureHouseAssignment,
  getCommunitySql,
  getCommunityUser,
  getHouseMemberCounts,
  getHouseScores,
  type HouseId,
} from '@/lib/community';

export const dynamic = 'force-dynamic';

const HOUSE_IDS: HouseId[] = ['marvel', 'dc', 'pokemon', 'power_rangers'];

export async function GET(request: Request) {
  const user = getCommunityUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const sql = getCommunitySql();
    await ensureCommunitySchema(sql);
    const [assignment, scores, memberCounts] = await Promise.all([
      ensureHouseAssignment(sql, user),
      getHouseScores(sql),
      getHouseMemberCounts(sql),
    ]);
    return NextResponse.json({ assignment, scores, memberCounts });
  } catch (error) {
    console.error('House data fetch failed:', error);
    return NextResponse.json({ error: 'House data is temporarily unavailable.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = getCommunityUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'A House activity is required.' }, { status: 400 });
    }
    const sql = getCommunitySql();
    await ensureCommunitySchema(sql);
    const assignment = await ensureHouseAssignment(sql, user);
    if (!assignment.house || !HOUSE_IDS.includes(assignment.house)) {
      return NextResponse.json({ error: 'Choose a House before earning House points.' }, { status: 403 });
    }

    const today = new Date().toISOString().slice(0, 10);
    let activityType: string;
    let relatedId: string;
    let points: number;
    let result: Record<string, unknown> = {};

    if (body.activity === 'reactor_tap') {
      if (typeof body.activityId !== 'string' || !/^[a-zA-Z0-9_-]{8,100}$/.test(body.activityId)) {
        return NextResponse.json({ error: 'A valid reactor activity ID is required.' }, { status: 400 });
      }
      const daily = await sql`
        SELECT COUNT(*)::int AS total
        FROM interstellers_point_transactions
        WHERE user_id = ${user.id}
          AND activity_type = 'reactor_tap'
          AND created_at >= CURRENT_DATE
      `;
      if (Number(daily[0]?.total ?? 0) >= 300) {
        return NextResponse.json({ error: 'Daily reactor point limit reached.' }, { status: 429 });
      }
      activityType = 'reactor_tap';
      relatedId = body.activityId;
      points = 5;
    } else if (body.activity === 'arena_duel') {
      activityType = 'arena_duel';
      relatedId = today;
      const roll = Math.floor(Math.random() * 100) + 1;
      points = roll > 40 ? 50 : 10;
      result = { roll };
    } else {
      return NextResponse.json({ error: 'Unsupported House activity.' }, { status: 400 });
    }

    const awarded = await awardHousePoints(sql, user, assignment.house, activityType, relatedId, points);
    const scores = await getHouseScores(sql);
    return NextResponse.json({
      awarded,
      points: awarded ? points : 0,
      scores,
      ...result,
    });
  } catch (error) {
    console.error('House point award failed:', error);
    return NextResponse.json({ error: 'House points could not be saved.' }, { status: 500 });
  }
}
