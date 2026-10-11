import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();

    // Auto-sync any code requests into pending registrations
    let dbChanged = false;
    if (db.verificationCodes) {
      Object.entries(db.verificationCodes).forEach(([email, entry]) => {
        const cleanEmail = email.toLowerCase().trim();
        const isAdmin = cleanEmail === 'akshaycricketer1230@gmail.com' || cleanEmail === 'akshay@interstellers.space';
        const isApproved = db.approvedEmails.includes(cleanEmail);
        const existing = db.registrations.find((r) => r.email.toLowerCase() === cleanEmail);
        if (!existing && !isApproved && !isAdmin) {
          db.registrations.unshift({
            id: 'reg_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
            name: entry.name || cleanEmail.split('@')[0],
            email: cleanEmail,
            avatar: '',
            timestamp: new Date(entry.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'pending',
          });
          dbChanged = true;
        }
      });
    }
    if (dbChanged) {
      saveDb(db);
    }

    return NextResponse.json({
      registrations: db.registrations,
      pendingCount: db.registrations.filter((r) => r.status === 'pending').length,
    });
  } catch (error) {
    console.error('Approvals GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { requestId, action } = await request.json();
    if (!requestId || !action) {
      return NextResponse.json({ error: 'requestId and action are required' }, { status: 400 });
    }

    const db = getDb();
    const target = db.registrations.find(
      (r) => r.id === requestId || (r.email && r.email.toLowerCase() === (requestId || '').toLowerCase()) || r.name.toLowerCase().replace(/\s+/g, '_') === requestId
    );

    if (!target && action !== 'kick') {
      return NextResponse.json({ error: 'Registration request not found' }, { status: 404 });
    }

    if (action === 'approve') {
      if (target) {
        target.status = 'approved';
        if (!db.approvedEmails.includes(target.email.toLowerCase())) {
          db.approvedEmails.push(target.email.toLowerCase());
        }
      }
    } else if (action === 'reject') {
      if (target) {
        target.status = 'rejected';
        db.approvedEmails = db.approvedEmails.filter((e) => e.toLowerCase() !== target.email.toLowerCase());
      }
    } else if (action === 'kick') {
      if (target) {
        target.status = 'pending';
        db.approvedEmails = db.approvedEmails.filter((e) => e.toLowerCase() !== target.email.toLowerCase());
      } else {
        // Find by matching name or handle if reg entry wasn't matched directly
        const matched = db.registrations.find((r) => r.name.toLowerCase() === (requestId || '').toLowerCase());
        if (matched) {
          matched.status = 'pending';
          db.approvedEmails = db.approvedEmails.filter((e) => e.toLowerCase() !== matched.email.toLowerCase());
        }
      }
    }

    saveDb(db);

    return NextResponse.json({
      success: true,
      registrations: db.registrations,
      updatedUser: target,
    });
  } catch (error) {
    console.error('Approvals POST error:', error);
    return NextResponse.json({ error: 'Failed to update approval' }, { status: 500 });
  }
}
