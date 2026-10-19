import { NextResponse } from 'next/server';
import { GameScoreRecord, LeaderboardEntry } from '@/lib/types';
import { INITIAL_GLOBAL_LEADERBOARD } from '@/lib/arcadeData';
import {
  ensureCommunitySchema,
  getCommunitySql,
  getCommunityUser,
  type HouseId,
} from '@/lib/community';

export const dynamic = 'force-dynamic';

// Server-side in-memory score storage for active session ranking & anti-cheat
let globalScores: GameScoreRecord[] = [];
let leaderboardStore: LeaderboardEntry[] = [...INITIAL_GLOBAL_LEADERBOARD];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'leaderboard';

  if (type === 'community_leaderboard') {
    const user = getCommunityUser(req);
    if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

    const board = searchParams.get('board') || 'all_time';
    const allowedBoards = ['all_time', 'houses', 'weekly', 'singers', 'dancers', 'challenge'];
    if (!allowedBoards.includes(board)) {
      return NextResponse.json({ error: 'Invalid leaderboard.' }, { status: 400 });
    }

    try {
      const sql = getCommunitySql();
      await ensureCommunitySchema(sql);
      let rows;
      if (board === 'houses' || board === 'challenge') {
        const activity = board === 'challenge' ? 'house_challenge_attempt' : null;
        rows = activity
          ? await sql`
              WITH points AS (
                SELECT house, SUM(points)::float8 AS score
                FROM interstellers_point_transactions
                WHERE house IS NOT NULL AND activity_type = ${activity}
                GROUP BY house
              ),
              members AS (
                SELECT house, COUNT(*)::int AS member_count
                FROM interstellers_house_assignments
                WHERE house IS NOT NULL
                GROUP BY house
              )
              SELECT houses.house, COALESCE(points.score, 0)::float8 AS score,
                COALESCE(members.member_count, 0)::int AS member_count
              FROM (VALUES ('marvel'), ('dc'), ('pokemon'), ('power_rangers')) AS houses(house)
              LEFT JOIN points ON points.house = houses.house
              LEFT JOIN members ON members.house = houses.house
              ORDER BY score DESC, houses.house
            `
          : await sql`
              WITH points AS (
                SELECT house, SUM(points)::float8 AS score
                FROM interstellers_point_transactions
                WHERE house IS NOT NULL
                GROUP BY house
              ),
              members AS (
                SELECT house, COUNT(*)::int AS member_count
                FROM interstellers_house_assignments
                WHERE house IS NOT NULL
                GROUP BY house
              )
              SELECT houses.house, COALESCE(points.score, 0)::float8 AS score,
                COALESCE(members.member_count, 0)::int AS member_count
              FROM (VALUES ('marvel'), ('dc'), ('pokemon'), ('power_rangers')) AS houses(house)
              LEFT JOIN points ON points.house = houses.house
              LEFT JOIN members ON members.house = houses.house
              ORDER BY score DESC, houses.house
            `;
      } else if (board === 'singers' || board === 'dancers') {
        const category = board === 'singers' ? 'singing' : 'dancing';
        rows = await sql`
          SELECT t.user_id, (array_agg(t.user_data ORDER BY t.created_at DESC))[1] AS user_data,
            assignments.house, SUM(t.points)::float8 AS score,
            MIN(t.user_data->>'name') AS sort_name,
            BOOL_OR(t.user_id = ${user.id}) AS is_current
          FROM interstellers_point_transactions t
          JOIN interstellers_posts p ON p.id = t.related_id
          LEFT JOIN interstellers_house_assignments assignments ON assignments.user_id = t.user_id
          WHERE p.data->>'category' = ${category}
          GROUP BY t.user_id, assignments.house
          ORDER BY score DESC, sort_name ASC
          LIMIT 100
        `;
      } else {
        rows = board === 'weekly'
          ? await sql`
              SELECT t.user_id, (array_agg(t.user_data ORDER BY t.created_at DESC))[1] AS user_data,
                assignments.house, SUM(t.points)::float8 AS score,
                MIN(t.user_data->>'name') AS sort_name,
                BOOL_OR(t.user_id = ${user.id}) AS is_current
              FROM interstellers_point_transactions t
              LEFT JOIN interstellers_house_assignments assignments ON assignments.user_id = t.user_id
              WHERE t.created_at >= date_trunc('week', NOW() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'
              GROUP BY t.user_id, assignments.house
              ORDER BY score DESC, sort_name ASC
              LIMIT 100
            `
          : await sql`
              SELECT t.user_id, (array_agg(t.user_data ORDER BY t.created_at DESC))[1] AS user_data,
                assignments.house, SUM(t.points)::float8 AS score,
                MIN(t.user_data->>'name') AS sort_name,
                BOOL_OR(t.user_id = ${user.id}) AS is_current
              FROM interstellers_point_transactions t
              LEFT JOIN interstellers_house_assignments assignments ON assignments.user_id = t.user_id
              GROUP BY t.user_id, assignments.house
              ORDER BY score DESC, sort_name ASC
              LIMIT 100
            `;
      }

      const entries = rows.map((row: Record<string, unknown>, index: number) => {
        const house = typeof row.house === 'string' &&
          ['marvel', 'dc', 'pokemon', 'power_rangers'].includes(row.house)
          ? row.house as HouseId
          : null;
        if (board === 'houses' || board === 'challenge') {
          return {
            rank: index + 1,
            house,
            score: Number(row.score),
            memberCount: Number(row.member_count),
          };
        }
        const profile = row.user_data as Record<string, unknown> | undefined;
        return {
          rank: index + 1,
          name: typeof profile?.name === 'string' ? profile.name : 'Community member',
          handle: typeof profile?.handle === 'string' ? profile.handle : '',
          avatar: typeof profile?.avatar === 'string' ? profile.avatar : '',
          house,
          score: Number(row.score),
          isCurrent: row.is_current === true,
        };
      });
      return NextResponse.json({ success: true, board, entries }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
      console.error('Community leaderboard fetch failed:', error);
      return NextResponse.json({ error: 'Leaderboard is temporarily unavailable.' }, { status: 500 });
    }
  }

  if (type === 'leaderboard') {
    return NextResponse.json({
      success: true,
      leaderboard: leaderboardStore,
    });
  }

  if (type === 'scores') {
    return NextResponse.json({
      success: true,
      scores: globalScores.slice(-50).reverse(),
    });
  }

  return NextResponse.json({ success: true, message: 'Arcade API Operational' });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, scoreRecord } = body;

    if (action === 'submit_score' && scoreRecord) {
      const record = scoreRecord as GameScoreRecord;

      // Anti-cheat validation rules
      if (record.score < 0 || record.score > 500000) {
        return NextResponse.json(
          { success: false, error: 'Anti-cheat flag: Invalid game score detected' },
          { status: 400 }
        );
      }

      if (record.gameId === 'reaction_warp' && record.score < 50) {
        // Less than 50ms is superhuman / bot clicker
        return NextResponse.json(
          { success: false, error: 'Anti-cheat flag: Inhuman reaction speed detected (<50ms)' },
          { status: 400 }
        );
      }

      globalScores.push(record);

      // Update or insert into leaderboard
      const existingIdx = leaderboardStore.findIndex((l) => l.userId === record.userId);
      if (existingIdx >= 0) {
        leaderboardStore[existingIdx].score += record.score;
        leaderboardStore[existingIdx].starCredits += record.starCreditsEarned;
      } else {
        leaderboardStore.push({
          rank: leaderboardStore.length + 1,
          userId: record.userId,
          name: record.userName,
          handle: record.userId,
          avatar: record.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
          travelerLevel: 1,
          score: record.score,
          starCredits: record.starCreditsEarned,
          streak: 1,
          crewName: '🚀 Space Wolves',
        });
      }

      // Re-sort ranks
      leaderboardStore.sort((a, b) => b.score - a.score);
      leaderboardStore.forEach((entry, idx) => {
        entry.rank = idx + 1;
      });

      return NextResponse.json({
        success: true,
        message: 'Score verified & saved to Interstellers Arcade Telemetry',
        newLeaderboard: leaderboardStore,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
