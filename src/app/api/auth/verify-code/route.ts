import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { normalizeEmail, isAdminEmail, verifyOtpToken, createSessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, name, otpToken: bodyToken } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    const cleanEmail = normalizeEmail(email);
    const cleanCode = code.toString().trim();
    const cleanName = ((name as string) || cleanEmail.split('@')[0]).trim();

    // Check OTP token from request body OR cookie header
    const cookieHeader = request.headers.get('cookie');
    const cookieToken = getCookieValue(cookieHeader, 'interstellers_otp_token');
    const otpToken = bodyToken || cookieToken;

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

    // 2. Secondary fallback check: Local DB verification codes (for local dev / warm lambdas)
    const db = getDb();
    if (!isCodeValid && db.verificationCodes) {
      const entry = db.verificationCodes[cleanEmail];
      if (entry && entry.code === cleanCode && Date.now() < entry.expiresAt) {
        isCodeValid = true;
      }
    }

    if (!isCodeValid) {
      return NextResponse.json(
        { error: verificationError },
        { status: 400 }
      );
    }

    // Clear used code from DB
    if (db.verificationCodes?.[cleanEmail]) {
      delete db.verificationCodes[cleanEmail];
      saveDb(db);
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
        user: { name: 'Akshay Kumar', email: cleanEmail, role: 'Host Admin' },
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

    // 2. User already approved by Akshay earlier
    const isApproved =
      existingReg?.status === 'approved' ||
      (existingReg?.status !== 'pending' &&
        existingReg?.status !== 'rejected' &&
        db.approvedEmails.some((approvedEmail) => normalizeEmail(approvedEmail) === cleanEmail));
    if (isApproved) {
      const reg = existingReg;
      const verifiedName = reg ? reg.name : cleanName;

      const sessionToken = createSessionToken({
        email: cleanEmail,
        name: verifiedName,
        role: 'Community Member',
      });

      const response = NextResponse.json({
        status: 'approved',
        user: { name: verifiedName, email: cleanEmail },
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
    }

    // 3. New User Registration -> Hold in pending approval queue for Akshay
    let reg = existingReg;
    if (!reg) {
      reg = {
        id: 'reg_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        name: cleanName,
        email: cleanEmail,
        avatar: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'pending',
      };
      db.registrations.unshift(reg);
    } else if (reg.status === 'rejected') {
      // Re-apply sets back to pending for review
      reg.status = 'pending';
    }

    saveDb(db);

    const response = NextResponse.json({
      status: 'pending',
      user: { name: reg.name, email: reg.email },
      message: 'Code verified successfully! Your account is now waiting for Akshay to approve access.',
    });

    // Ensure unapproved users have NO active session cookie
    response.cookies.set({
      name: 'interstellers_session',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
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
    console.error('Verify code error:', error);
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 });
  }
}
