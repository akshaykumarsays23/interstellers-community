import nodemailer from 'nodemailer';

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return value.replace(/[&<>"']/g, (character) => entities[character]);
}

export async function sendLoginCodeEmail(toEmail: string, name: string, code: string): Promise<{ success: boolean }> {
  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '');

  if (!gmailUser || !gmailPass) {
    console.error('[Email Dispatcher] Missing required email configuration: GMAIL_USER and/or GMAIL_APP_PASSWORD.');
    return { success: false };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
      auth: { user: gmailUser, pass: gmailPass },
    });

    const cleanName = name.trim() || toEmail.split('@')[0];
    const safeName = escapeHtml(cleanName);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #080918; color: #ffffff; padding: 24px; margin: 0; }
          .card { max-width: 540px; margin: 0 auto; background: #0d0f26; border: 1px solid #8b5cf640; border-radius: 24px; padding: 40px 32px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.6); }
          .title { font-size: 26px; font-weight: 800; letter-spacing: 3px; color: #ffffff; margin-bottom: 6px; }
          .quote { font-size: 15px; font-style: italic; color: #c084fc; margin-bottom: 24px; line-height: 1.5; font-weight: 500; }
          .divider { width: 60px; height: 3px; background: #a855f7; margin: 0 auto 24px auto; border-radius: 99px; }
          .greeting { font-size: 15px; color: #e2e8f0; margin-bottom: 20px; line-height: 1.6; text-align: left; }
          .code-box { background: #17193b; border: 2px dashed #a855f7; border-radius: 16px; padding: 20px 28px; margin: 24px auto; display: inline-block; }
          .code { font-family: monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #ffffff; text-shadow: 0 0 20px rgba(168,85,247,0.8); }
          .notice { font-size: 13px; color: #94a3b8; line-height: 1.6; margin-top: 24px; border-top: 1px solid #33415560; padding-top: 20px; text-align: left; }
          .notice ul { padding-left: 18px; margin: 8px 0; }
          .notice li { margin-bottom: 6px; }
          .highlight { color: #c084fc; font-weight: 600; }
          .footer { font-size: 11px; color: #64748b; margin-top: 24px; border-top: 1px solid #1e293b; padding-top: 16px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="title">INTERSTELLERS</div>
          <div class="quote">&ldquo;Time is never coming back, remember time is never...&rdquo;</div>
          <div class="divider"></div>
          
          <div class="greeting">
            Hello <strong>${safeName}</strong>,<br><br>
            Use the 6-digit verification code below to complete your registration:
          </div>
          
          <div class="code-box">
            <div class="code">${code}</div>
          </div>
          
          <div class="notice">
            <ul>
              <li>• This verification code expires in <strong>10 minutes</strong>.</li>
              <li>• After entering this code on the website, you can access the platform immediately.</li>
            </ul>
          </div>

          <div class="footer">
            — Interstellers Cosmic Network<br>
            &copy; 2026 Interstellers. Professional Networking.
          </div>
        </div>
      </body>
      </html>
    `;

    const plainTextMessage = `Welcome to Interstellers!\n\n"Time is never coming back, remember time is never..."\n\nHello ${cleanName},\n\nUse the 6-digit verification code below to complete your registration:\n\n====================\n    ${code}\n====================\n\nThis verification code expires in 10 minutes.\n\nInterstellers Cosmic Network`;

    await transporter.sendMail({
      from: `"Interstellers Community" <${gmailUser}>`,
      to: toEmail,
      subject: `Your Interstellers Login Code: ${code}`,
      text: plainTextMessage,
      html: htmlContent,
    });

    console.info('[Email Dispatcher] Verification email accepted by Gmail SMTP.');
    return { success: true };
  } catch (error: unknown) {
    const smtpError = error as {
      code?: unknown;
      command?: unknown;
      responseCode?: unknown;
    };
    const safeCommands = new Set([
      'CONNECT',
      'EHLO',
      'AUTH PLAIN',
      'AUTH LOGIN',
      'STARTTLS',
      'MAIL FROM',
      'RCPT TO',
      'DATA',
      'QUIT',
    ]);
    console.error('[Email Dispatcher] Gmail SMTP delivery failed.', {
      code: typeof smtpError.code === 'string' && /^[A-Z0-9_]+$/.test(smtpError.code)
        ? smtpError.code
        : 'UNKNOWN',
      command: typeof smtpError.command === 'string' && safeCommands.has(smtpError.command)
        ? smtpError.command
        : 'OTHER',
      responseCode: typeof smtpError.responseCode === 'number' &&
        smtpError.responseCode >= 100 &&
        smtpError.responseCode <= 599
        ? smtpError.responseCode
        : undefined,
    });
    return { success: false };
  }
}
