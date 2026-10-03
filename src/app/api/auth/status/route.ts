import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const db = getDb();

    // Check if host Akshay
    if (cleanEmail.includes('akshay') || cleanEmail === 'akshaycricketer1230@gmail.com' || cleanEmail === 'akshay@interstellers.space') {
      const reg = db.registrations.find((r) => r.email.toLowerCase().includes('akshay') && r.avatar);
      return NextResponse.json({
        status: 'approved',
        role: 'admin',
        user: {
          name: 'Akshay Kumar',
          email: cleanEmail,
          avatar: reg?.avatar || '/avatar.png',
          isAvatarLocked: reg?.isAvatarLocked || Boolean(reg?.avatar && reg.avatar !== '/avatar.png'),
        },
      });
    }

    // Check approved list
    if (db.approvedEmails.includes(cleanEmail)) {
      const reg = db.registrations.find((r) => r.email.toLowerCase() === cleanEmail);
      return NextResponse.json({
        status: 'approved',
        user: reg 
          ? { name: reg.name, email: reg.email, avatar: reg.avatar || '/avatar.png', isAvatarLocked: reg.isAvatarLocked || Boolean(reg.avatar && reg.avatar !== '/avatar.png') } 
          : { name: cleanEmail.split('@')[0], email: cleanEmail, avatar: '/avatar.png', isAvatarLocked: false },
      });
    }

    // Check registrations
    const reg = db.registrations.find((r) => r.email.toLowerCase() === cleanEmail);
    if (reg) {
      return NextResponse.json({
        status: reg.status,
        user: { 
          name: reg.name, 
          email: reg.email, 
          avatar: reg.avatar || '/avatar.png', 
          isAvatarLocked: reg.isAvatarLocked || Boolean(reg.avatar && reg.avatar !== '/avatar.png') 
        },
      });
    }

    return NextResponse.json({ status: 'not_found' });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }
}
