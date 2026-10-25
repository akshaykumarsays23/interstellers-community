import { NextResponse } from 'next/server';
import { sendLoginCodeEmail } from '@/lib/email';
import { AuthConfigurationError, normalizeEmail, createOtpToken } from '@/lib/auth';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function clearOtpCookie(response: NextResponse): NextResponse {
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const cleanEmail = normalizeEmail(email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const cleanName = (typeof name === 'string' ? name : cleanEmail.split('@')[0]).trim();

    const code = crypto.randomInt(100000, 1_000_000).toString();
    const expiresInMinutes = 10;
    const expiresInSeconds = expiresInMinutes * 60;
    const { token: otpToken } = createOtpToken(cleanEmail, code, expiresInMinutes);

    const emailResult = await sendLoginCodeEmail(cleanEmail, cleanName, code);
    if (!emailResult.success) {
      return clearOtpCookie(
        NextResponse.json(
          { error: 'Unable to deliver the verification email. Please try again later.' },
          { status: 502 }
        )
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'A 6-digit verification code has been sent. Please check your inbox or spam folder.',
      email: cleanEmail,
      expiresInSeconds,
    });

    response.cookies.set({
      name: 'interstellers_otp_token',
      value: otpToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: expiresInSeconds,
    });

    return response;
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return NextResponse.json(
        { error: 'Authentication is not configured. Set AUTH_SECRET to a random value of at least 32 characters.' },
        { status: 503 }
      );
    }
    console.error('Send code error:', error);
    return NextResponse.json({ error: 'Failed to generate verification code' }, { status: 500 });
  }
}
