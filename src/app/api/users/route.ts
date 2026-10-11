import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { User } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    
    // Always include Host Akshay Kumar
    const hostUser: User = {
      id: 'user_host',
      name: 'Akshay Kumar',
      handle: 'akshay',
      avatar: '/avatar.png',
      bio: "Founder & Community Host at Interstellers. 'Time is never coming back, remember time is never...'",
      role: 'Community Host & Admin',
      company: 'Interstellers',
      status: 'online',
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

    const approvedList: User[] = [hostUser];
    const seenEmails = new Set(['akshaycricketer1230@gmail.com', 'akshay@interstellers.space']);

    // Add all approved registrations from db.json
    db.registrations.forEach((reg) => {
      const cleanEmail = reg.email.toLowerCase().trim();
      if (seenEmails.has(cleanEmail)) return;

      if (reg.status === 'approved' || db.approvedEmails.includes(cleanEmail)) {
        seenEmails.add(cleanEmail);
        const handle = reg.name.toLowerCase().replace(/\s+/g, '_');
        approvedList.push({
          id: `user_${reg.id}`,
          name: reg.name,
          handle,
          avatar: reg.avatar || '',
          bio: 'Verified Member at Interstellers.',
          role: 'Community Member',
          company: 'Interstellers Galaxy',
          status: 'online',
          isVerified: true,
          mutualFriends: 1,
        });
      }
    });

    return NextResponse.json({ users: approvedList });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
