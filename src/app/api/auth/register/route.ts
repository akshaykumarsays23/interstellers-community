import { NextResponse } from 'next/server';
import { getDb, saveDb, DbRegistration } from '@/lib/db';
import { normalizeEmail, isAdminEmail } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = normalizeEmail(email);
    const cleanName = (name || cleanEmail.split('@')[0]).trim();
    const db = getDb();

    // Check if host Akshay
    if (isAdminEmail(cleanEmail)) {
      if (Array.isArray(db.approvedEmails) && !db.approvedEmails.includes(cleanEmail)) {
        db.approvedEmails.push(cleanEmail);
        saveDb(db);
      }
      return NextResponse.json({
        status: 'approved',
        user: { name: 'Akshay Kumar', email: cleanEmail, role: 'Host Admin' },
      });
    }

    // Check if already approved
    if (Array.isArray(db.approvedEmails) && db.approvedEmails.includes(cleanEmail)) {
      const existing = db.registrations.find((r) => r.email.toLowerCase() === cleanEmail);
      return NextResponse.json({
        status: 'approved',
        user: { name: existing?.name || cleanName, email: cleanEmail },
      });
    }

    // Check if already in registrations queue
    const existing = db.registrations.find((r) => r.email.toLowerCase() === cleanEmail);
    if (existing) {
      return NextResponse.json({
        status: existing.status,
        user: { name: existing.name, email: existing.email },
      });
    }

    // Create new pending registration
    const newReg: DbRegistration = {
      id: 'reg_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      name: cleanName,
      email: cleanEmail,
      avatar: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
    };

    db.registrations.unshift(newReg);
    saveDb(db);

    return NextResponse.json({
      status: 'pending',
      user: { name: newReg.name, email: newReg.email },
      message: 'Registration held. Awaiting approval from Akshay.',
    });
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json({ error: 'Failed to process registration' }, { status: 500 });
  }
}
