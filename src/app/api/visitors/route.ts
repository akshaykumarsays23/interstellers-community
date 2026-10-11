import { NextResponse } from 'next/server';
import { getDb, saveDb, VisitorSession } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const sessions = db.visitorSessions || [];
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    // Active in last 5 minutes
    const activeSessions = sessions.filter((s) => s.lastSeen >= fiveMinutesAgo);

    return NextResponse.json({
      activeCount: activeSessions.length,
      totalDevices: sessions.length,
      activeSessions,
      allSessions: sessions,
    });
  } catch (error) {
    console.error('Visitors GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch visitor stats' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { deviceId, deviceType } = await request.json();
    if (!deviceId) {
      return NextResponse.json({ error: 'deviceId is required' }, { status: 400 });
    }

    const db = getDb();
    if (!db.visitorSessions) {
      db.visitorSessions = [];
    }

    const userAgent = request.headers.get('user-agent') || 'Unknown Device';
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';

    const now = Date.now();
    let session = db.visitorSessions.find((s) => s.id === deviceId);

    if (session) {
      session.lastSeen = now;
      session.userAgent = userAgent;
      session.ip = ip;
      if (deviceType) session.deviceType = deviceType;
    } else {
      session = {
        id: deviceId,
        ip,
        userAgent,
        deviceType: deviceType || (userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'),
        firstSeen: now,
        lastSeen: now,
      };
      db.visitorSessions.push(session);
    }

    // Keep db size clean: remove sessions older than 30 days
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    db.visitorSessions = db.visitorSessions.filter((s) => s.lastSeen >= thirtyDaysAgo);

    saveDb(db);

    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const activeCount = db.visitorSessions.filter((s) => s.lastSeen >= fiveMinutesAgo).length;

    return NextResponse.json({
      success: true,
      activeCount,
      totalDevices: db.visitorSessions.length,
      session,
    });
  } catch (error) {
    console.error('Visitors POST error:', error);
    return NextResponse.json({ error: 'Failed to record device ping' }, { status: 500 });
  }
}
