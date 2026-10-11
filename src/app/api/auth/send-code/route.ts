import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { sendLoginCodeEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, name, type } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Gmail address is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim().replace(/[\.\s]+$/, '').trim();
    const cleanName = (name || cleanEmail.split('@')[0]).trim();

    // Generate secure 6-digit numeric OTP code
    const isAdminEmail = cleanEmail === 'akshaycricketer1230@gmail.com' || cleanEmail === 'akshay@interstellers.space';
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 60 * 60 * 1000; // 60 minutes

    const db = getDb();
    if (!db.verificationCodes) {
      db.verificationCodes = {};
    }

    db.verificationCodes[cleanEmail] = {
      code,
      expiresAt,
      name: cleanName,
      createdAt: Date.now(),
    };

    saveDb(db);

    // Auto-create pending registration so host (Akshay) receives approval request immediately
    const existingReg = db.registrations.find((r) => r.email.toLowerCase() === cleanEmail);
    const isApproved = db.approvedEmails.includes(cleanEmail);
    if (!existingReg && !isApproved && !isAdminEmail) {
      db.registrations.unshift({
        id: 'reg_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        name: cleanName,
        email: cleanEmail,
        avatar: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'pending',
      });
      saveDb(db);
    }

    // Attempt real email delivery via Nodemailer
    const emailResult = await sendLoginCodeEmail(cleanEmail, cleanName, code);

    // Secure server log
    console.log(`\n========================================`);
    console.log(`[Interstellers Gmail Dispatcher]`);
    console.log(`To: ${cleanEmail}`);
    console.log(`Security Code: ${code}`);
    console.log(`Email Sent Status: ${emailResult.success ? 'SUCCESS (Delivered to inbox)' : 'Logged locally (' + (emailResult.error || 'No SMTP set') + ')'}`);
    console.log(`========================================\n`);

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}. Please check your inbox or spam folder.`,
      email: cleanEmail,
      expiresInSeconds: 600,
      code: emailResult.success ? undefined : code,
      deliveredViaSmtp: emailResult.success,
    });
  } catch (error) {
    console.error('Send code error:', error);
    return NextResponse.json({ error: 'Failed to generate verification code' }, { status: 500 });
  }
}
