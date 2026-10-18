import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { verifySessionToken, isAdminEmail, normalizeEmail } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const authHeader = request.headers.get('authorization');
    const token =
      getCookieValue(cookieHeader, 'interstellers_session') ||
      (authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null);

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const verification = verifySessionToken(token);
    if (!verification.valid || !verification.user) {
      const response = NextResponse.json({ authenticated: false, error: verification.error });
      response.cookies.set({
        name: 'interstellers_session',
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
      return response;
    }

    const cleanEmail = normalizeEmail(verification.user.email);
    const db = getDb();
    const isHost = isAdminEmail(cleanEmail);

    if (isHost) {
      const reg = db.registrations.find((r) => r.email.toLowerCase() === cleanEmail);
      return NextResponse.json({
        authenticated: true,
        user: {
          id: 'user_host',
          name: 'Akshay Kumar',
          email: cleanEmail,
          handle: 'akshay',
          role: 'Host Admin',
          profileRole: reg?.role || 'Community Host & Admin',
          avatar: reg?.avatar || '/avatar.png',
          bio: reg?.bio ?? "Founder & Community Host at Interstellers. 'Time is never coming back, remember time is never...'",
          house: reg?.house,
          houseAssignedAt: reg?.houseAssignedAt,
          status: 'online',
          isVerified: true,
        },
      });
    }

    let reg = db.registrations.find((r) => normalizeEmail(r.email) === cleanEmail);
    if (!reg) {
      reg = {
        id: 'reg_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        name: verification.user.name,
        email: cleanEmail,
        avatar: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'approved',
      };
      db.registrations.unshift(reg);
    }
    reg.status = 'approved';
    if (!db.approvedEmails.some((approvedEmail) => normalizeEmail(approvedEmail) === cleanEmail)) {
      db.approvedEmails.push(cleanEmail);
    }
    saveDb(db);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: reg.id,
        name: reg.name || verification.user.name,
        email: cleanEmail,
        handle: (reg.name || verification.user.name).toLowerCase().replace(/\s+/g, '_'),
        role: 'Community Member',
        profileRole: reg.role || 'Community Member',
        avatar: reg.avatar || '',
        bio: reg.bio || '',
        house: reg.house,
        houseAssignedAt: reg.houseAssignedAt,
        status: 'online',
        isVerified: true,
      },
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false, error: 'Internal server error' }, { status: 500 });
  }
}
