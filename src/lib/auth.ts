import crypto from 'crypto';

/**
 * Interstellers Serverless Cryptographic Authentication Utilities
 *
 * Provides stateless HMAC-SHA256 signed OTP verification tokens and
 * session tokens. These work reliably across Vercel serverless lambda
 * invocations without requiring a writable filesystem.
 */

// Secret used to sign OTP tokens and session cookies.
// Fallback key provided for seamless local development, but AUTH_SECRET can be set in Vercel.
const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  'interstellers-cosmic-secure-secret-key-2026-v1';

export const ADMIN_EMAILS = [
  'akshaycricketer1230@gmail.com',
  'akshay@interstellers.space',
];

/**
 * Normalizes email address uniformly across the entire platform.
 * Trims whitespace, converts to lowercase, and strips trailing punctuation.
 */
export function normalizeEmail(email: string | null | undefined): string {
  if (!email) return '';
  return email
    .toLowerCase()
    .trim()
    .replace(/[\.\s]+$/, '')
    .trim();
}

/**
 * Checks whether an email belongs to the Host Admin (Akshay).
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  const clean = normalizeEmail(email);
  return ADMIN_EMAILS.includes(clean);
}

// In-memory single-use nonce tracking cache for active container lifetime
const consumedNonces = new Set<string>();

// Periodic cleanup of consumed nonces (prevent memory leak)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    if (consumedNonces.size > 10000) {
      consumedNonces.clear();
    }
  }, 10 * 60 * 1000);
}

interface OtpPayload {
  email: string;
  codeHash: string;
  expiresAt: number;
  nonce: string;
}

/**
 * Generates an HMAC-SHA256 hash of email + code + salt
 */
function hashCode(cleanEmail: string, code: string): string {
  return crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(`${cleanEmail}:${code.trim()}:otp_salt`)
    .digest('hex');
}

/**
 * Generates a signed stateless OTP token encoding email, code hash, and expiry.
 */
export function createOtpToken(
  email: string,
  code: string,
  expiresInMinutes: number = 10
): { token: string; expiresAt: number } {
  const cleanEmail = normalizeEmail(email);
  const cleanCode = code.trim();
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
  const nonce = crypto.randomBytes(12).toString('hex');
  const codeHash = hashCode(cleanEmail, cleanCode);

  const payload: OtpPayload = {
    email: cleanEmail,
    codeHash,
    expiresAt,
    nonce,
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payloadStr)
    .digest('hex');

  const token = `${payloadStr}.${signature}`;
  return { token, expiresAt };
}

/**
 * Verifies a signed OTP token against the supplied email and code.
 * Ensures single-use, correct email binding, and unexpired validity.
 */
export function verifyOtpToken(
  token: string | null | undefined,
  email: string,
  code: string
): { valid: boolean; error?: string } {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Missing verification token' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Malformed verification token' };
  }

  const [payloadStr, signature] = parts;

  // 1. Verify cryptographic signature
  const expectedSignature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payloadStr)
    .digest('hex');

  const sigBuffer = Buffer.from(signature);
  const expectedSigBuffer = Buffer.from(expectedSignature);

  if (
    sigBuffer.length !== expectedSigBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)
  ) {
    return { valid: false, error: 'Invalid verification token signature' };
  }

  // 2. Parse payload
  let payload: OtpPayload;
  try {
    const jsonStr = Buffer.from(payloadStr, 'base64url').toString('utf-8');
    payload = JSON.parse(jsonStr);
  } catch {
    return { valid: false, error: 'Invalid token payload' };
  }

  const cleanEmail = normalizeEmail(email);
  const cleanCode = (code || '').toString().trim();

  // 3. Verify email binding
  if (payload.email !== cleanEmail) {
    return {
      valid: false,
      error: 'Verification code was not issued for this email address',
    };
  }

  // 4. Verify expiration
  if (Date.now() > payload.expiresAt) {
    return {
      valid: false,
      error: 'Verification code has expired. Please request a new one.',
    };
  }

  // 5. Check if already consumed (single-use)
  if (consumedNonces.has(payload.nonce)) {
    return {
      valid: false,
      error: 'Verification code has already been used. Please request a new code.',
    };
  }

  // 6. Verify code hash
  const expectedCodeHash = hashCode(cleanEmail, cleanCode);
  const codeHashBuffer = Buffer.from(payload.codeHash);
  const expectedCodeHashBuffer = Buffer.from(expectedCodeHash);

  if (
    codeHashBuffer.length !== expectedCodeHashBuffer.length ||
    !crypto.timingSafeEqual(codeHashBuffer, expectedCodeHashBuffer)
  ) {
    return {
      valid: false,
      error: 'Invalid 6-digit verification code. Please check your code or request a new one.',
    };
  }

  // Mark nonce as consumed
  consumedNonces.add(payload.nonce);

  return { valid: true };
}

/**
 * Invalidate a token explicitly (e.g. on new request)
 */
export function invalidateOtpNonce(nonce: string) {
  consumedNonces.add(nonce);
}

/* ========================================================
   SERVER-VERIFIED SESSION TOKENS & COOKIES
   ======================================================== */

export interface SessionPayload {
  email: string;
  name: string;
  role: string;
  issuedAt: number;
  expiresAt: number;
}

/**
 * Creates a signed server session token.
 */
export function createSessionToken(user: {
  email: string;
  name: string;
  role?: string;
}): string {
  const cleanEmail = normalizeEmail(user.email);
  const issuedAt = Date.now();
  const expiresAt = issuedAt + 7 * 24 * 60 * 60 * 1000; // 7 days

  const payload: SessionPayload = {
    email: cleanEmail,
    name: user.name.trim(),
    role: user.role || (isAdminEmail(cleanEmail) ? 'Host Admin' : 'Community Member'),
    issuedAt,
    expiresAt,
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payloadStr)
    .digest('hex');

  return `${payloadStr}.${signature}`;
}

/**
 * Verifies a server session token.
 */
export function verifySessionToken(token: string | null | undefined): {
  valid: boolean;
  user?: SessionPayload;
  error?: string;
} {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'No session token provided' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Malformed session token' };
  }

  const [payloadStr, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payloadStr)
    .digest('hex');

  const sigBuffer = Buffer.from(signature);
  const expectedSigBuffer = Buffer.from(expectedSignature);

  if (
    sigBuffer.length !== expectedSigBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)
  ) {
    return { valid: false, error: 'Invalid session signature' };
  }

  try {
    const jsonStr = Buffer.from(payloadStr, 'base64url').toString('utf-8');
    const payload: SessionPayload = JSON.parse(jsonStr);

    if (Date.now() > payload.expiresAt) {
      return { valid: false, error: 'Session has expired' };
    }

    return { valid: true, user: payload };
  } catch {
    return { valid: false, error: 'Invalid session payload' };
  }
}
