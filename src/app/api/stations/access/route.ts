import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const COOKIE_NAME = 'interstellers_stations_access';
const ACCESS_DURATION_MS = 12 * 60 * 60 * 1000;

function createAccessSignature(expiresAt: number, pin: string): string {
  return createHmac('sha256', pin)
    .update(`stations-access:${expiresAt}`)
    .digest('hex');
}

function hasValidAccessCookie(cookie: string | undefined, pin: string): boolean {
  if (!cookie) return false;

  const [expiresAtText, signature, ...extraParts] = cookie.split('.');
  if (!expiresAtText || !signature || extraParts.length > 0) return false;

  const expiresAt = Number(expiresAtText);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now()) return false;

  const expectedSignature = createAccessSignature(expiresAt, pin);
  const supplied = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

function getPin(): string | null {
  const pin = process.env.STATIONS_PIN_CODE;
  return pin && pin.length > 0 ? pin : null;
}

export async function GET(request: Request) {
  const pin = getPin();
  if (!pin) {
    return NextResponse.json(
      { error: 'Space Stations PIN is not configured on the server' },
      { status: 503 }
    );
  }

  const cookieHeader = request.headers.get('cookie') || '';
  const cookie = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`)
  )?.[1];

  return NextResponse.json({
    unlocked: hasValidAccessCookie(cookie, pin),
  });
}

export async function POST(request: Request) {
  const pin = getPin();
  if (!pin) {
    return NextResponse.json(
      { error: 'Space Stations PIN is not configured on the server' },
      { status: 503 }
    );
  }

  let submittedPin: unknown;
  try {
    const body: unknown = await request.json();
    submittedPin =
      typeof body === 'object' && body !== null && 'pin' in body
        ? body.pin
        : undefined;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (typeof submittedPin !== 'string') {
    return NextResponse.json({ error: 'Enter the Space Stations PIN' }, { status: 400 });
  }

  const supplied = Buffer.from(submittedPin);
  const expected = Buffer.from(pin);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });
  }

  const expiresAt = Date.now() + ACCESS_DURATION_MS;
  const token = `${expiresAt}.${createAccessSignature(expiresAt, pin)}`;
  const response = NextResponse.json({ unlocked: true });
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: new Date(expiresAt),
  });
  return response;
}
