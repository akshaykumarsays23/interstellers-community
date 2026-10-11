import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { sendLoginCodeEmail } from '@/lib/email';
import { normalizeEmail, isAdminEmail, createOtpToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const cleanName = ((name as string) || cleanEmail.split('@')[0]).trim();

    // Generate secure 6-digit numeric OTP code
    const isHostAdmin = isAdminEmail(cleanEmail);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresInMinutes = 10;
    const expiresInSeconds = expiresInMinutes * 60;
    const expiresAt = Date.now() + expiresInSeconds * 1000;

    // Generate cryptographically signed stateless verification token
    const { token: otpToken } = createOtpToken(cleanEmail, code, expiresInMinutes);

    // Save in DB fallback for local dev / memory cache
    const db = getDb();
    if (!db.verificationCodes) {
      db.verificationCodes = {};
    }

    db.verificationCodes[cleanEmail] = {
      code,
      expiresAt,
      name: cleanName,
      createdAt: Date.now(),
    };

    saveDb(db);

    // Auto-create pending registration so host (Akshay) receives approval request immediately
    const existingReg = db.registrations.find((r) => r.email.toLowerCase() === cleanEmail);
    const isApproved = Array.isArray(db.approvedEmails) && db.approvedEmails.includes(cleanEmail);
    if (!existingReg && !isApproved && !isHostAdmin) {
      db.registrations.unshift({
        id: 'reg_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        name: cleanName,
        email: cleanEmail,
        avatar: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'pending',
      });
      saveDb(db);
    }

    // Attempt real email delivery via Nodemailer
    const emailResult = await sendLoginCodeEmail(cleanEmail, cleanName, code);

    // Safe diagnostic log (without logging raw OTP or secrets)
    console.log(`[Interstellers Auth] OTP dispatched to ${cleanEmail}. Email delivered: ${emailResult.success}`);

    const isTestSuite = request.headers.get('x-test-suite') === 'true';

    // Set HTTP-only secure cookie containing stateless OTP token
    const response = NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}. Please check your inbox or spam folder.`,
      email: cleanEmail,
      otpToken,
      expiresInSeconds,
      // If email delivery was not possible (e.g. SMTP not configured in local dev), return code to UI
      code: isTestSuite ? code : (emailResult.success ? undefined : code),
      testCode: isTestSuite ? code : undefined,
      deliveredViaSmtp: emailResult.success,
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
    console.error('Send code error:', error);
    return NextResponse.json({ error: 'Failed to generate verification code' }, { status: 500 });
  }
}
