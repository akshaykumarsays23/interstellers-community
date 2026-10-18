import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { User } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const onlineSince = Date.now() - 5 * 60 * 1000;
    const isUserOnline = (userId: string) =>
      db.visitorSessions?.some(
        (session) => session.userId === userId && session.lastSeen >= onlineSince
      ) || false;
    
    // Always include Host Akshay Kumar
    const hostUser: User = {
      id: 'user_host',
      name: 'Akshay Kumar',
      handle: 'akshay',
      avatar: '/avatar.png',
      bio: "Founder & Community Host at Interstellers. 'Time is never coming back, remember time is never...'",
      role: 'Host Admin',
      profileRole: 'Community Host & Admin',
      company: 'Interstellers',
      status: isUserOnline('user_host') ? 'online' : 'offline',
      customStatus: 'Building Interstellers 🚀',
      isVerified: true,
      mutualFriends: 5,
    };

    // Find host avatar from registration if available
    const hostReg = db.registrations.find(
      (r) => r.email.toLowerCase() === 'akshaycricketer1230@gmail.com' || r.email.toLowerCase() === 'akshay@interstellers.space'
    );
    if (hostReg && hostReg.avatar) {
      hostUser.avatar = hostReg.avatar;
    }
    if (hostReg) {
      hostUser.bio = hostReg.bio ?? hostUser.bio;
      hostUser.profileRole = hostReg.role ?? hostUser.profileRole;
      hostUser.house = hostReg.house;
      hostUser.houseAssignedAt = hostReg.houseAssignedAt;
    }

    const approvedList: User[] = [hostUser];
    const seenEmails = new Set(['akshaycricketer1230@gmail.com', 'akshay@interstellers.space']);

    // Add all approved registrations from db.json
    db.registrations.forEach((reg) => {
      const cleanEmail = reg.email.toLowerCase().trim();
      if (seenEmails.has(cleanEmail)) return;

      seenEmails.add(cleanEmail);
      const handle = reg.name.toLowerCase().replace(/\s+/g, '_');
      approvedList.push({
        id: reg.id,
        name: reg.name,
        email: reg.email,
        handle,
        avatar: reg.avatar || '',
        bio: reg.bio || '',
        role: 'Community Member',
        profileRole: reg.role || 'Community Member',
        company: 'Interstellers Galaxy',
        status: isUserOnline(reg.id) ? 'online' : 'offline',
        isVerified: true,
        mutualFriends: 1,
        house: reg.house,
        houseAssignedAt: reg.houseAssignedAt,
      });
    });

    return NextResponse.json({ users: approvedList });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
