import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
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
          isAvatarLocked: false,
        },
      });
    }

    const reg = db.registrations.find((r) => normalizeEmail(r.email) === cleanEmail);
    if (reg?.status === 'pending' || reg?.status === 'rejected') {
      return NextResponse.json({
        status: reg.status,
        role: 'guest',
        user: {
          name: reg.name,
          email: reg.email,
          avatar: reg.avatar || '',
          isAvatarLocked: reg.isAvatarLocked || Boolean(reg.avatar),
        },
      });
    }

    const isApproved =
      reg?.status === 'approved' ||
      (Array.isArray(db.approvedEmails) &&
        db.approvedEmails.some((approvedEmail) => normalizeEmail(approvedEmail) === cleanEmail));
    if (isApproved) {
      return NextResponse.json({
        status: 'approved',
        role: 'member',
        user: reg 
          ? { name: reg.name, email: reg.email, avatar: reg.avatar || '', isAvatarLocked: false } 
          : { name: cleanEmail.split('@')[0], email: cleanEmail, avatar: '', isAvatarLocked: false },
      });
    }

    // Check registrations queue
    if (reg) {
      return NextResponse.json({
        status: reg.status,
        role: reg.status === 'approved' ? 'member' : 'guest',
        user: { 
          name: reg.name, 
          email: reg.email, 
          avatar: reg.avatar || '', 
          isAvatarLocked: reg.isAvatarLocked || Boolean(reg.avatar) 
        },
      });
    }

    return NextResponse.json({ status: 'not_found' });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }
}
