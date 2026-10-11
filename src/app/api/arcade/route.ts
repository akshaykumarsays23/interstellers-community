import { NextResponse } from 'next/server';
import { GameScoreRecord, LeaderboardEntry } from '@/lib/types';
import { INITIAL_GLOBAL_LEADERBOARD } from '@/lib/arcadeData';

export const dynamic = 'force-dynamic';

// Server-side in-memory score storage for active session ranking & anti-cheat
let globalScores: GameScoreRecord[] = [];
let leaderboardStore: LeaderboardEntry[] = [...INITIAL_GLOBAL_LEADERBOARD];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'leaderboard';

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
