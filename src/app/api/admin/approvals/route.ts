import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { normalizeEmail, isAdminEmail } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();

    // Auto-sync any code requests into pending registrations
    let dbChanged = false;
    if (db.verificationCodes) {
      Object.entries(db.verificationCodes).forEach(([email, entry]) => {
        const cleanEmail = normalizeEmail(email);
        const isAdmin = isAdminEmail(cleanEmail);
        const isApproved = Array.isArray(db.approvedEmails) && db.approvedEmails.includes(cleanEmail);
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
    if (!Array.isArray(db.approvedEmails)) {
      db.approvedEmails = ['akshaycricketer1230@gmail.com', 'akshay@interstellers.space'];
    }

    const cleanReqId = (requestId || '').toString().toLowerCase().trim();
    const target = db.registrations.find(
      (r) =>
        r.id === requestId ||
        (r.email && r.email.toLowerCase() === cleanReqId) ||
        r.name.toLowerCase().replace(/\s+/g, '_') === cleanReqId
    );

    if (!target && action !== 'kick') {
      return NextResponse.json({ error: 'Registration request not found' }, { status: 404 });
    }

    if (action === 'approve') {
      if (target) {
        target.status = 'approved';
        const targetEmail = normalizeEmail(target.email);
        if (!db.approvedEmails.includes(targetEmail)) {
          db.approvedEmails.push(targetEmail);
        }
      }
    } else if (action === 'reject') {
      if (target) {
        target.status = 'rejected';
        const targetEmail = normalizeEmail(target.email);
        db.approvedEmails = db.approvedEmails.filter((e) => normalizeEmail(e) !== targetEmail);
      }
    } else if (action === 'kick') {
      if (target) {
        target.status = 'pending';
        const targetEmail = normalizeEmail(target.email);
        db.approvedEmails = db.approvedEmails.filter((e) => normalizeEmail(e) !== targetEmail);
      } else {
        const matched = db.registrations.find(
          (r) => r.name.toLowerCase() === cleanReqId
        );
        if (matched) {
          matched.status = 'pending';
          const matchedEmail = normalizeEmail(matched.email);
          db.approvedEmails = db.approvedEmails.filter((e) => normalizeEmail(e) !== matchedEmail);
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
