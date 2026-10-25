import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import {
  AuthConfigurationError,
  assertAuthSecretConfigured,
  normalizeEmail,
  isAdminEmail,
  verifyOtpToken,
  createSessionToken,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, name } = body;

    if (typeof email !== 'string' || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    assertAuthSecretConfigured();
    const cleanEmail = normalizeEmail(email);
    const cleanCode = code.toString().trim();
    const cleanName = (typeof name === 'string' ? name : cleanEmail.split('@')[0]).trim();

    const cookieHeader = request.headers.get('cookie');
    const otpToken = getCookieValue(cookieHeader, 'interstellers_otp_token');

    let isCodeValid = false;
    let verificationError = 'Invalid or expired 6-digit verification code. Please check your code or request a new one.';

    // 1. Primary check: Cryptographic stateless token verification (works 100% on Vercel)
    if (otpToken) {
      const tokenResult = verifyOtpToken(otpToken, cleanEmail, cleanCode);
      if (tokenResult.valid) {
        isCodeValid = true;
      } else if (tokenResult.error) {
        verificationError = tokenResult.error;
      }
    }

    const db = getDb();

    if (!isCodeValid) {
      return NextResponse.json(
        { error: verificationError },
        { status: 400 }
      );
    }

    const isHost = isAdminEmail(cleanEmail);

    // 1. Host Admin (Akshay)
    if (isHost) {
      if (!db.approvedEmails.includes(cleanEmail)) {
        db.approvedEmails.push(cleanEmail);
      }
      saveDb(db);

      const sessionToken = createSessionToken({
        email: cleanEmail,
        name: 'Akshay Kumar',
        role: 'Host Admin',
      });

      const response = NextResponse.json({
        status: 'approved',
        user: {
          name: 'Akshay Kumar',
          email: cleanEmail,
          role: 'Host Admin',
          profileRole:
            db.registrations.find((r) => normalizeEmail(r.email) === cleanEmail)?.role ||
            'Community Host & Admin',
          avatar: db.registrations.find((r) => normalizeEmail(r.email) === cleanEmail)?.avatar || '/avatar.png',
          bio: db.registrations.find((r) => normalizeEmail(r.email) === cleanEmail)?.bio ??
            "Founder & Community Host at Interstellers. 'Time is never coming back, remember time is never...'",
        },
        sessionToken,
        message: 'Welcome back Host Admin Akshay!',
      });

      // Set server session cookie
      response.cookies.set({
        name: 'interstellers_session',
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 3600,
      });

      // Clear OTP cookie
      response.cookies.set({
        name: 'interstellers_otp_token',
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });

      return response;
    }

    const existingReg = db.registrations.find((r) => normalizeEmail(r.email) === cleanEmail);

    let reg = existingReg;
    if (!reg) {
      reg = {
        id: 'reg_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        name: cleanName,
        email: cleanEmail,
        avatar: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'approved',
      };
      db.registrations.unshift(reg);
    } else {
      reg.status = 'approved';
      reg.name = reg.name || cleanName;
    }

    if (!db.approvedEmails.some((approvedEmail) => normalizeEmail(approvedEmail) === cleanEmail)) {
      db.approvedEmails.push(cleanEmail);
    }
    saveDb(db);

    const verifiedName = reg.name || cleanName;
    const sessionToken = createSessionToken({
      email: cleanEmail,
      name: verifiedName,
      role: 'Community Member',
    });

    const response = NextResponse.json({
      status: 'approved',
      user: {
        id: reg.id,
        name: verifiedName,
        email: cleanEmail,
        avatar: reg.avatar || '',
        bio: reg.bio || '',
        role: 'Community Member',
        profileRole: reg.role || 'Community Member',
        house: reg.house,
        houseAssignedAt: reg.houseAssignedAt,
      },
      sessionToken,
      message: 'Code verified. Welcome to Interstellers!',
    });

    response.cookies.set({
      name: 'interstellers_session',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600,
    });

    response.cookies.set({
      name: 'interstellers_otp_token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return NextResponse.json(
        { error: 'Authentication is not configured. Set AUTH_SECRET to a random value of at least 32 characters.' },
        { status: 503 }
      );
    }
    console.error('Verify code error:', error);
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 });
  }
}
