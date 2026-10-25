// Automated Test Suite for Interstellers Authentication Flow
// Tests Scenarios A through J against http://localhost:3001

import crypto from 'crypto';

const BASE_URL = 'http://localhost:3001';
const AUTH_SECRET = process.env.AUTH_SECRET?.trim();
if (!AUTH_SECRET || AUTH_SECRET.length < 32) {
  throw new Error('Set AUTH_SECRET to a value of at least 32 characters before running this test suite.');
}

// Helper to extract cookies from response headers
function extractCookies(response) {
  const raw = response.headers.get('set-cookie');
  if (!raw) return {};
  const cookies = {};
  raw.split(/,(?=\s*[^;=]+=[^;=]+)/).forEach((cookieStr) => {
    const parts = cookieStr.split(';')[0].trim().split('=');
    if (parts.length === 2) {
      cookies[parts[0].trim()] = parts[1].trim();
    }
  });
  return cookies;
}

function formatCookieHeader(cookies) {
  return Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

// Helper to create an expired OTP token directly for Scenario C
function createExpiredToken(email, code) {
  const cleanEmail = email.toLowerCase().trim();
  const expiresAt = Date.now() - 60000; // expired 1 minute ago
  const nonce = 'expired_nonce_' + Math.random().toString(36);
  const codeHash = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(`${cleanEmail}:${code}:otp_salt`)
    .digest('hex');

  const payload = {
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
  return `${payloadStr}.${signature}`;
}

async function runTests() {
  console.log('====================================================');
  console.log('INTERSTELLERS AUTHENTICATION TEST SUITE: SCENARIOS A-J');
  console.log('Target:', BASE_URL);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  const userAEmail = 'usera_test@interstellers.space';
  const userAName = 'User Alpha';
  const userBEmail = 'userb_test@interstellers.space';
  const userBName = 'User Beta';
  const adminEmail = 'akshaycricketer1230@gmail.com';

  // ----------------------------------------------------
  // Scenario A: User A requests an OTP and enters the correct OTP.
  // ----------------------------------------------------
  console.log('--- SCENARIO A: Request OTP & verify with correct code ---');
  const sendResA = await fetch(`${BASE_URL}/api/auth/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-test-suite': 'true' },
    body: JSON.stringify({ email: userAEmail, name: userAName, type: 'signin' }),
  });
  const sendDataA = await sendResA.json();
  const cookiesA = extractCookies(sendResA);
  const codeA = sendDataA.testCode || sendDataA.code;

  assert(sendResA.ok && sendDataA.success, 'User A send-code response is 200 OK');
  assert(sendDataA.otpToken !== undefined, 'User A received stateless otpToken');
  assert(codeA && codeA.length === 6, `User A received valid 6-digit verification code`);

  const verifyResA = await fetch(`${BASE_URL}/api/auth/verify-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: formatCookieHeader(cookiesA),
    },
    body: JSON.stringify({
      email: userAEmail,
      code: codeA,
      name: userAName,
      otpToken: sendDataA.otpToken,
    }),
  });
  const verifyDataA = await verifyResA.json();
  assert(verifyResA.ok && (verifyDataA.status === 'approved' || verifyDataA.status === 'pending'), 'User A enters correct OTP and verification succeeds');
  assert(verifyDataA.user && verifyDataA.user.email === userAEmail, 'User A verification returned correct email');

  // ----------------------------------------------------
  // Scenario B: User A enters an incorrect OTP.
  // ----------------------------------------------------
  console.log('\n--- SCENARIO B: User enters an incorrect OTP ---');
  const sendResB = await fetch(`${BASE_URL}/api/auth/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-test-suite': 'true' },
    body: JSON.stringify({ email: userAEmail, name: userAName }),
  });
  const sendDataB = await sendResB.json();

  const verifyResB = await fetch(`${BASE_URL}/api/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userAEmail,
      code: '000000', // incorrect code
      name: userAName,
      otpToken: sendDataB.otpToken,
    }),
  });
  const verifyDataB = await verifyResB.json();
  assert(verifyResB.status === 400, 'Server rejects incorrect OTP with 400 Bad Request');
  assert(verifyDataB.error && (verifyDataB.error.includes('Invalid') || verifyDataB.error.includes('expired')), 'Error message reports invalid verification code');

  // ----------------------------------------------------
  // Scenario C: User A enters an expired OTP.
  // ----------------------------------------------------
  console.log('\n--- SCENARIO C: User enters an expired OTP ---');
  const expiredToken = createExpiredToken(userAEmail, '123456');
  const verifyResC = await fetch(`${BASE_URL}/api/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userAEmail,
      code: '123456',
      name: userAName,
      otpToken: expiredToken,
    }),
  });
  const verifyDataC = await verifyResC.json();
  assert(verifyResC.status === 400, 'Server rejects expired OTP with 400 Bad Request');
  assert(verifyDataC.error && verifyDataC.error.includes('expired'), 'Error message reports code has expired');

  // ----------------------------------------------------
  // Scenario D: User A requests a second OTP and attempts to use the old OTP.
  // ----------------------------------------------------
  console.log('\n--- SCENARIO D: Request second OTP and attempt to use old OTP ---');
  // First OTP request
  const sendResD1 = await fetch(`${BASE_URL}/api/auth/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-test-suite': 'true' },
    body: JSON.stringify({ email: userAEmail }),
  });
  const sendDataD1 = await sendResD1.json();
  const codeD1 = sendDataD1.testCode || sendDataD1.code;

  // Second OTP request
  const sendResD2 = await fetch(`${BASE_URL}/api/auth/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-test-suite': 'true' },
    body: JSON.stringify({ email: userAEmail }),
  });
  const sendDataD2 = await sendResD2.json();
  const codeD2 = sendDataD2.testCode || sendDataD2.code;

  // Attempt to use old OTP code with new token
  const verifyOldWithNewToken = await fetch(`${BASE_URL}/api/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userAEmail,
      code: codeD1,
      otpToken: sendDataD2.otpToken,
    }),
  });
  assert(verifyOldWithNewToken.status === 400, 'Attempting to use old OTP with new token is rejected');

  // Verify second OTP successfully
  const verifyResD2 = await fetch(`${BASE_URL}/api/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userAEmail,
      code: codeD2,
      otpToken: sendDataD2.otpToken,
    }),
  });
  assert(verifyResD2.ok, 'Second OTP verifies successfully');

  // Attempting to reuse second OTP after verification (single-use enforcement)
  const verifyReuse = await fetch(`${BASE_URL}/api/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userAEmail,
      code: codeD2,
      otpToken: sendDataD2.otpToken,
    }),
  });
  assert(verifyReuse.status === 400, 'Attempting to reuse consumed OTP fails (single-use policy enforced)');

  // ----------------------------------------------------
  // Scenario E: User A logs out and User B logs in with a different email.
  // ----------------------------------------------------
  console.log('\n--- SCENARIO E: User A logs out, User B logs in with different email ---');
  const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
  });
  const logoutCookies = extractCookies(logoutRes);
  assert(logoutRes.ok, 'User A logout succeeds');
  assert(logoutCookies['interstellers_session'] === '', 'Logout clears interstellers_session cookie');

  // User B logs in
  const sendResE_B = await fetch(`${BASE_URL}/api/auth/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-test-suite': 'true' },
    body: JSON.stringify({ email: userBEmail, name: userBName }),
  });
  const sendDataE_B = await sendResE_B.json();
  const codeE_B = sendDataE_B.testCode || sendDataE_B.code;

  const verifyResE_B = await fetch(`${BASE_URL}/api/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userBEmail,
      code: codeE_B,
      name: userBName,
      otpToken: sendDataE_B.otpToken,
    }),
  });
  const verifyDataE_B = await verifyResE_B.json();
  assert(verifyResE_B.ok, 'User B verification succeeds');
  assert(verifyDataE_B.user && verifyDataE_B.user.email === userBEmail, 'Authenticated user is User B (no session leak from User A)');

  // ----------------------------------------------------
  // Scenario F: User A's OTP cannot verify User B's email.
  // ----------------------------------------------------
  console.log('\n--- SCENARIO F: User A OTP cannot verify User B email ---');
  const sendResF = await fetch(`${BASE_URL}/api/auth/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-test-suite': 'true' },
    body: JSON.stringify({ email: userAEmail }),
  });
  const sendDataF = await sendResF.json();
  const codeF = sendDataF.testCode || sendDataF.code;

  const verifyResF = await fetch(`${BASE_URL}/api/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userBEmail, // User B trying to use User A's OTP
      code: codeF,
      otpToken: sendDataF.otpToken,
    }),
  });
  const verifyDataF = await verifyResF.json();
  assert(verifyResF.status === 400, 'Server rejects User A OTP used for User B email with 400');
  assert(verifyDataF.error && (verifyDataF.error.includes('issued for this email') || verifyDataF.error.includes('Invalid')), 'Error confirms email mismatch binding');

  // ----------------------------------------------------
  // Scenario G: Admin logs out and new user does not inherit admin session.
  // ----------------------------------------------------
  console.log('\n--- SCENARIO G: Administrator logs out, new user does not inherit admin session ---');
  const sendAdmin = await fetch(`${BASE_URL}/api/auth/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-test-suite': 'true' },
    body: JSON.stringify({ email: adminEmail }),
  });
  const sendDataAdmin = await sendAdmin.json();
  const codeAdmin = sendDataAdmin.testCode || sendDataAdmin.code;

  const verifyAdmin = await fetch(`${BASE_URL}/api/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: adminEmail,
      code: codeAdmin,
      otpToken: sendDataAdmin.otpToken,
    }),
  });
  const verifyDataAdmin = await verifyAdmin.json();
  const adminCookies = extractCookies(verifyAdmin);
  assert(verifyDataAdmin.status === 'approved' && verifyDataAdmin.user.role === 'Host Admin', 'Admin logs in as Host Admin');

  // Admin logs out
  const adminLogout = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: {
      Cookie: formatCookieHeader(adminCookies),
    },
  });
  const adminLogoutCookies = extractCookies(adminLogout);
  assert(adminLogout.ok && adminLogoutCookies['interstellers_session'] === '', 'Admin session cookie cleared');

  // New user registers
  const newUserEmail = 'newcomer_' + Date.now() + '@interstellers.space';
  const sendNew = await fetch(`${BASE_URL}/api/auth/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-test-suite': 'true' },
    body: JSON.stringify({ email: newUserEmail, name: 'Newcomer' }),
  });
  const sendDataNew = await sendNew.json();
  const codeNew = sendDataNew.testCode || sendDataNew.code;

  const verifyNew = await fetch(`${BASE_URL}/api/auth/verify-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: formatCookieHeader(adminLogoutCookies),
    },
    body: JSON.stringify({
      email: newUserEmail,
      code: codeNew,
      name: 'Newcomer',
      otpToken: sendDataNew.otpToken,
    }),
  });
  const verifyDataNew = await verifyNew.json();
  assert(verifyDataNew.status === 'pending', 'New user is placed in pending approval, NOT Host Admin');
  assert(verifyDataNew.user.email === newUserEmail, 'New user email is newcomer email, NOT admin');

  // ----------------------------------------------------
  // Scenario H: Refreshing the page preserves the correct valid session.
  // ----------------------------------------------------
  console.log('\n--- SCENARIO H: Refreshing preserves correct valid session ---');
  const sendH = await fetch(`${BASE_URL}/api/auth/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-test-suite': 'true' },
    body: JSON.stringify({ email: adminEmail }),
  });
  const sendDataH = await sendH.json();
  const codeH = sendDataH.testCode || sendDataH.code;

  const verifyH = await fetch(`${BASE_URL}/api/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: adminEmail,
      code: codeH,
      otpToken: sendDataH.otpToken,
    }),
  });
  const cookiesH = extractCookies(verifyH);

  // Simulate refresh: GET /api/auth/session with session cookie
  const refreshRes = await fetch(`${BASE_URL}/api/auth/session`, {
    headers: {
      Cookie: formatCookieHeader(cookiesH),
    },
  });
  const refreshData = await refreshRes.json();
  assert(refreshRes.ok && refreshData.authenticated === true, 'Session endpoint returns authenticated: true on page refresh');
  assert(refreshData.user.email === adminEmail, 'Session endpoint returns matching authenticated user');

  // ----------------------------------------------------
  // Scenario I: An unauthenticated visitor cannot access protected session.
  // ----------------------------------------------------
  console.log('\n--- SCENARIO I: Unauthenticated visitor session check ---');
  const unauthRes = await fetch(`${BASE_URL}/api/auth/session`, {
    headers: {},
  });
  const unauthData = await unauthRes.json();
  assert(unauthRes.ok && unauthData.authenticated === false, 'Session endpoint returns authenticated: false for unauthenticated visitor');

  // ----------------------------------------------------
  // Scenario J: Failed verification never creates an authenticated session.
  // ----------------------------------------------------
  console.log('\n--- SCENARIO J: Failed verification never creates authenticated session ---');
  const sendJ = await fetch(`${BASE_URL}/api/auth/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-test-suite': 'true' },
    body: JSON.stringify({ email: 'intruder@interstellers.space' }),
  });
  const sendDataJ = await sendJ.json();

  const verifyJ = await fetch(`${BASE_URL}/api/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'intruder@interstellers.space',
      code: '999999', // wrong OTP
      otpToken: sendDataJ.otpToken,
    }),
  });
  const cookiesJ = extractCookies(verifyJ);
  assert(verifyJ.status === 400, 'Failed verification returns 400');
  assert(!cookiesJ['interstellers_session'], 'No session cookie is ever issued on failed verification');

  const sessionJ = await fetch(`${BASE_URL}/api/auth/session`, {
    headers: {
      Cookie: formatCookieHeader(cookiesJ),
    },
  });
  const sessionDataJ = await sessionJ.json();
  assert(sessionDataJ.authenticated === false, 'Session endpoint confirms unauthenticated state');

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Test runner execution error:', e);
  process.exit(1);
});
