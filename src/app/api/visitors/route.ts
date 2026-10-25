import { NextResponse } from 'next/server';
import { getDb, saveDb, VisitorSession } from '@/lib/db';
import { AuthConfigurationError, isAdminEmail, normalizeEmail, verifySessionToken } from '@/lib/auth';

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
      activeSessions: activeSessions.map(({ userId: _userId, ...session }) => session),
      allSessions: sessions.map(({ userId: _userId, ...session }) => session),
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
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionCookie = cookieHeader
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith('interstellers_session='));
    const token = sessionCookie?.slice('interstellers_session='.length);
    const verifiedSession = verifySessionToken(token);

    const now = Date.now();
    let userId: string | undefined;
    if (verifiedSession.valid && verifiedSession.user) {
      const email = normalizeEmail(verifiedSession.user.email);
      const registration = db.registrations.find(
        (candidate) => normalizeEmail(candidate.email) === email
      );
      const approved =
        isAdminEmail(email) ||
        registration?.status === 'approved' ||
        ((!registration || (registration.status !== 'pending' && registration.status !== 'rejected')) &&
          db.approvedEmails.some((approvedEmail) => normalizeEmail(approvedEmail) === email));

      if (approved) {
        userId = isAdminEmail(email)
          ? 'user_host'
          : registration?.id || `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
      }
    }

    let session = db.visitorSessions.find((s) => s.id === deviceId);

    if (session) {
      session.lastSeen = now;
      session.userAgent = userAgent;
      session.ip = ip;
      session.userId = userId;
      if (deviceType) session.deviceType = deviceType;
    } else {
      session = {
        id: deviceId,
        userId,
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
    if (error instanceof AuthConfigurationError) {
      return NextResponse.json(
        { error: 'Authentication is not configured on the server.' },
        { status: 503 }
      );
    }
    console.error('Visitors POST error:', error);
    return NextResponse.json({ error: 'Failed to record device ping' }, { status: 500 });
  }
}
