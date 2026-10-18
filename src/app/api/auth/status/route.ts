import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { normalizeEmail, isAdminEmail } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = normalizeEmail(email);
    const db = getDb();

    // Check if host Akshay
    if (isAdminEmail(cleanEmail)) {
      const reg = db.registrations.find((r) => normalizeEmail(r.email) === cleanEmail);
      return NextResponse.json({
        status: 'approved',
        role: 'admin',
        user: {
          name: 'Akshay Kumar',
          email: cleanEmail,
          avatar: reg?.avatar || '/avatar.png',
          bio: reg?.bio ?? "Founder & Community Host at Interstellers. 'Time is never coming back, remember time is never...'",
          profileRole: reg?.role || 'Community Host & Admin',
          house: reg?.house,
          houseAssignedAt: reg?.houseAssignedAt,
          isAvatarLocked: false,
        },
      });
    }

    const reg = db.registrations.find((r) => normalizeEmail(r.email) === cleanEmail);
    const isApproved =
      reg?.status === 'approved' ||
      (Array.isArray(db.approvedEmails) &&
        db.approvedEmails.some((approvedEmail) => normalizeEmail(approvedEmail) === cleanEmail));
    if (isApproved) {
      if (reg && reg.status !== 'approved') {
        reg.status = 'approved';
        saveDb(db);
      }
      return NextResponse.json({
        status: 'approved',
        role: 'member',
        user: reg 
          ? {
              name: reg.name,
              email: reg.email,
              avatar: reg.avatar || '',
              bio: reg.bio || '',
              role: 'Community Member',
              profileRole: reg.role || 'Community Member',
              house: reg.house,
              houseAssignedAt: reg.houseAssignedAt,
              isAvatarLocked: false,
            }
          : {
              name: cleanEmail.split('@')[0],
              email: cleanEmail,
              avatar: '',
              bio: '',
              role: 'Community Member',
              profileRole: 'Community Member',
              isAvatarLocked: false,
            },
      });
    }

    if (reg) {
      reg.status = 'approved';
      if (!db.approvedEmails.some((approvedEmail) => normalizeEmail(approvedEmail) === cleanEmail)) {
        db.approvedEmails.push(cleanEmail);
      }
      saveDb(db);
      return NextResponse.json({
        status: 'approved',
        role: 'member',
        user: {
          name: reg.name,
          email: reg.email,
          avatar: reg.avatar || '',
          bio: reg.bio || '',
          role: 'Community Member',
          profileRole: reg.role || 'Community Member',
          house: reg.house,
          houseAssignedAt: reg.houseAssignedAt,
          isAvatarLocked: false,
        },
      });
    }

    return NextResponse.json({ status: 'not_found' });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }
}
