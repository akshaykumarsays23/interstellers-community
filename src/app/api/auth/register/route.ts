import { NextResponse } from 'next/server';
import { getDb, saveDb, DbRegistration } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = (name || cleanEmail.split('@')[0]).trim();
    const db = getDb();

    // Check if host Akshay
    if (cleanEmail === 'akshaycricketer1230@gmail.com' || cleanEmail === 'akshay@interstellers.space') {
      if (!db.approvedEmails.includes(cleanEmail)) {
        db.approvedEmails.push(cleanEmail);
        saveDb(db);
      }
      return NextResponse.json({
        status: 'approved',
        user: { name: 'Akshay Kumar', email: cleanEmail, role: 'Host Admin' },
      });
    }

    // Check if already registered
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
