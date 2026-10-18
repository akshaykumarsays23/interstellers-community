import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
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
      const existing = db.registrations.find((r) => normalizeEmail(r.email) === cleanEmail);
      if (Array.isArray(db.approvedEmails) && !db.approvedEmails.includes(cleanEmail)) {
        db.approvedEmails.push(cleanEmail);
        saveDb(db);
      }
      return NextResponse.json({
        status: 'approved',
        user: {
          name: 'Akshay Kumar',
          email: cleanEmail,
          role: 'Host Admin',
          profileRole: existing?.role || 'Community Host & Admin',
          avatar: existing?.avatar || '/avatar.png',
          bio: existing?.bio ?? "Founder & Community Host at Interstellers. 'Time is never coming back, remember time is never...'",
          house: existing?.house,
          houseAssignedAt: existing?.houseAssignedAt,
        },
      });
    }

    const registration = db.registrations.find((r) => normalizeEmail(r.email) === cleanEmail);
    const isAlreadyRegistered =
      registration?.status === 'approved' ||
      (!registration &&
        Array.isArray(db.approvedEmails) &&
        db.approvedEmails.some((approvedEmail) => normalizeEmail(approvedEmail) === cleanEmail));
    if (!isAlreadyRegistered) {
      return NextResponse.json(
        { error: 'Verify your Gmail code to complete registration.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      status: 'approved',
      user: {
        id: registration?.id,
        name: registration?.name || cleanName,
        email: cleanEmail,
        avatar: registration?.avatar || '',
        bio: registration?.bio || '',
        role: 'Community Member',
        profileRole: registration?.role || 'Community Member',
        house: registration?.house,
        houseAssignedAt: registration?.houseAssignedAt,
      },
    });
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json({ error: 'Failed to process registration' }, { status: 500 });
  }
}
