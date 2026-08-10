import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
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
    const target = db.registrations.find((r) => r.id === requestId);

    if (!target) {
      return NextResponse.json({ error: 'Registration request not found' }, { status: 404 });
    }

    if (action === 'approve') {
      target.status = 'approved';
      if (!db.approvedEmails.includes(target.email.toLowerCase())) {
        db.approvedEmails.push(target.email.toLowerCase());
      }
    } else if (action === 'reject') {
      target.status = 'rejected';
      db.approvedEmails = db.approvedEmails.filter((e) => e !== target.email.toLowerCase());
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
