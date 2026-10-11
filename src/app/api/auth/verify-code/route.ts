import { NextResponse } from 'next/server';
import { getDb, saveDb, DbRegistration } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, code, name } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim().replace(/[\.\s]+$/, '').trim();
    const cleanCode = code.toString().trim();
    const cleanName = (name || cleanEmail.split('@')[0]).trim();

    const db = getDb();
    const entry = db.verificationCodes?.[cleanEmail] || db.verificationCodes?.[email.toLowerCase().trim()];

    const isHostEmail = cleanEmail === 'akshaycricketer1230@gmail.com' || cleanEmail === 'akshay@interstellers.space';
    const isCodeValid = entry && entry.code === cleanCode && Date.now() < entry.expiresAt;

    if (!isCodeValid) {
      return NextResponse.json(
        { error: 'Invalid or expired 6-digit verification code. Please check your code or request a new one.' },
        { status: 400 }
      );
    }

    // Clear used code
    if (db.verificationCodes?.[cleanEmail]) {
      delete db.verificationCodes[cleanEmail];
    }

    // 1. Check if Host Akshay
    if (isHostEmail) {
      if (!db.approvedEmails.includes(cleanEmail)) {
        db.approvedEmails.push(cleanEmail);
      }
      saveDb(db);
      return NextResponse.json({
        status: 'approved',
        user: { name: 'Akshay Kumar', email: cleanEmail, role: 'Host Admin' },
        message: 'Welcome back Host Admin Akshay!',
      });
    }

    // 2. Check if already approved by Akshay earlier
    if (db.approvedEmails.includes(cleanEmail)) {
      const reg = db.registrations.find((r) => r.email.toLowerCase() === cleanEmail);
      saveDb(db);
      return NextResponse.json({
        status: 'approved',
        user: reg ? { name: reg.name, email: reg.email } : { name: cleanName, email: cleanEmail },
        message: 'Code verified. Welcome to Interstellers!',
      });
    }

    // 3. New User Registration -> Hold in pending approval queue for Akshay
    let reg = db.registrations.find((r) => r.email.toLowerCase() === cleanEmail);
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
    }

    saveDb(db);

    return NextResponse.json({
      status: 'pending',
      user: { name: reg.name, email: reg.email },
      message: 'Code verified successfully! Your account is now waiting for Akshay to approve access.',
    });
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 });
  }
}
