import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
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
          avatar: reg?.avatar || '/avatar.png',
          status: 'online',
          isVerified: true,
        },
      });
    }

    // Check if user is still in approved list
    const reg = db.registrations.find((r) => normalizeEmail(r.email) === cleanEmail);
    const isApproved =
      reg?.status === 'approved' ||
      ((!reg || (reg.status !== 'pending' && reg.status !== 'rejected')) &&
        Array.isArray(db.approvedEmails) &&
        db.approvedEmails.some((approvedEmail) => normalizeEmail(approvedEmail) === cleanEmail));

    if (isApproved) {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: reg?.id || 'user_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_'),
          name: reg?.name || verification.user.name,
          email: cleanEmail,
          handle: (reg?.name || verification.user.name).toLowerCase().replace(/\s+/g, '_'),
          role: reg?.status === 'approved' ? 'Community Member' : 'Guest',
          avatar: reg?.avatar || '',
          status: 'online',
          isVerified: true,
        },
      });
    }

    // If revoked, kicked, or still pending
    const response = NextResponse.json({
      authenticated: false,
      status: reg?.status || 'pending',
      requiresApproval: true,
    });

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
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false, error: 'Internal server error' }, { status: 500 });
  }
}
