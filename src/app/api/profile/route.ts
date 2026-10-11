import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, name, bio, role, avatar, isAvatarLocked } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const db = getDb();

    // Host admin accounts that share profile sync
    const isHostAdmin = cleanEmail === 'akshaycricketer1230@gmail.com' || cleanEmail === 'akshay@interstellers.space';

    const targets = isHostAdmin
      ? ['akshaycricketer1230@gmail.com', 'akshay@interstellers.space']
      : [cleanEmail];

    targets.forEach((targetEmail) => {
      let reg = db.registrations.find((r) => r.email.toLowerCase() === targetEmail);
      if (reg) {
        if (name) reg.name = name;
        if (avatar !== undefined) {
          reg.avatar = avatar;
          reg.isAvatarLocked = false;
        }
      } else {
        db.registrations.unshift({
          id: 'user_profile_' + Math.random().toString(36).substring(2, 7),
          name: name || cleanEmail.split('@')[0],
          email: targetEmail,
          avatar: avatar || '',
          isAvatarLocked: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'approved',
        });
      }
    });

    saveDb(db);

    return NextResponse.json({ success: true, message: 'Profile updated and saved to server DB' });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}


