import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const rawUser = url.searchParams.get('user') || 'guest';
    const userKey = rawUser.trim().toLowerCase();

    const db = getDb();
    const stats = db.musicStats || { totalPlays: 24, userPlays: {} };
    const userPlays = (stats.userPlays && stats.userPlays[userKey]) || 0;

    return NextResponse.json({
      success: true,
      totalPlays: stats.totalPlays || 0,
      userPlays,
      user: userKey,
      lastPlayedAt: stats.lastPlayedAt || null,
    });
  } catch (error) {
    console.error('Music stats GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve music play statistics' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let rawUser = 'guest';
    try {
      const body = await request.json();
      if (body && typeof body.user === 'string' && body.user.trim()) {
        rawUser = body.user.trim();
      }
    } catch (_) {
      // Body empty or not JSON, fallback to guest
    }

    const userKey = rawUser.toLowerCase();
    const db = getDb();

    if (!db.musicStats) {
      db.musicStats = { totalPlays: 24, userPlays: {} };
    }
    if (typeof db.musicStats.totalPlays !== 'number') {
      db.musicStats.totalPlays = 24;
    }
    if (!db.musicStats.userPlays || typeof db.musicStats.userPlays !== 'object') {
      db.musicStats.userPlays = {};
    }

    // Increment global & user-specific play counts
    db.musicStats.totalPlays += 1;
    db.musicStats.userPlays[userKey] = (db.musicStats.userPlays[userKey] || 0) + 1;
    db.musicStats.lastPlayedAt = Date.now();

    saveDb(db);

    return NextResponse.json({
      success: true,
      totalPlays: db.musicStats.totalPlays,
      userPlays: db.musicStats.userPlays[userKey],
      user: userKey,
      lastPlayedAt: db.musicStats.lastPlayedAt,
    });
  } catch (error) {
    console.error('Music stats POST error:', error);
    return NextResponse.json(
      { error: 'Failed to record music play count' },
      { status: 500 }
    );
  }
}
