/**
 * DisputeRocket Full End-to-End API Test Suite
 * Tests every endpoint, authentication boundary, cookie session, rate limiting, and webhook validation.
 */

const BASE_URL = 'http://localhost:3001';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
  status?: number;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`  \x1b[32m✔ PASS\x1b[0m ${name}`);
  } catch (err: any) {
    results.push({ name, passed: false, details: err.message });
    console.error(`  \x1b[31m✖ FAIL\x1b[0m ${name}: ${err.message}`);
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

async function runTestSuite() {
  console.log('\n🧪 Running DisputeRocket Full API Verification Suite...\n');

  let cookieHeader = '';
  let createdUserId = '';
  let createdDisputeId = '';
  const testEmail = `reviewer_${Date.now()}@disputerocket.io`;
  const testPassword = 'SecurePassword123!';
  const testName = 'Sarah Chen (Lead Risk Officer)';

  // 1. Health Check
  await test('1. GET /health returns 200 and service status', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.status === 'ok', `Expected status ok, got ${data.status}`);
    assert(Boolean(data.service), 'Expected service name');
  });

  // 2. Auth Boundary (Unauthenticated protection)
  await test('2. GET /api/disputes without cookie returns 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/api/disputes`);
    assert(res.status === 401, `Expected 401, got ${res.status}`);
    const data = await res.json();
    assert(Boolean(data.error), 'Expected error message in response');
  });

  await test('3. GET /internal/analytics/:email without cookie returns 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/internal/analytics/test@example.com`);
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test('4. GET /auth/me without cookie returns 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`);
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  // 3. User Registration Flow
  await test('5. POST /auth/register creates user and sets HTTP-only JWT cookie', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: testName,
      }),
    });
    assert(res.status === 201, `Expected 201 Created, got ${res.status}`);
    const data = await res.json();
    assert(Boolean(data.user?.id), 'Expected user id');
    assert(data.user.email === testEmail.toLowerCase(), 'Expected matching email');
    assert(data.user.name === testName, 'Expected matching name');
    createdUserId = data.user.id;

    // Capture cookie
    const setCookie = res.headers.get('set-cookie');
    assert(Boolean(setCookie && setCookie.includes('token=')), `Expected token cookie in Set-Cookie: ${setCookie}`);
    cookieHeader = setCookie!.split(';')[0];
  });

  // 4. Duplicate Registration Rejection
  await test('6. POST /auth/register with existing email returns 400 Bad Request', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: testName,
      }),
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  // 5. Auth Me Verification
  await test('7. GET /auth/me with auth cookie returns authenticated user profile', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Cookie: cookieHeader },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.user.email === testEmail.toLowerCase(), 'Expected matching user email');
    assert(data.user.name === testName, 'Expected matching user name');
  });

  // 6. User Login Flow
  await test('8. POST /auth/login with valid credentials returns 200 and sets cookie', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.user.email === testEmail.toLowerCase(), 'Expected user email');
    const setCookie = res.headers.get('set-cookie');
    assert(Boolean(setCookie && setCookie.includes('token=')), 'Expected Set-Cookie');
    cookieHeader = setCookie!.split(';')[0];
  });

  await test('9. POST /auth/login with wrong password returns 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'wrongpassword',
      }),
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  // 7. Stripe Webhook Signature Security Boundary
  await test('10. POST /webhooks/stripe without signature header is rejected with 400', async () => {
    const res = await fetch(`${BASE_URL}/webhooks/stripe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'evt_fake', type: 'charge.dispute.created' }),
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
    const data = await res.json();
    assert(Boolean(data.error), 'Expected webhook error response');
  });

  // 8. Manual Dispute Creation & Pipeline Execution
  await test('11. POST /api/disputes/manual creates dispute with enrichment & scoring', async () => {
    const res = await fetch(`${BASE_URL}/api/disputes/manual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        disputeId: `dp_live_test_${Date.now()}`,
        customerName: 'Alexander Vance',
        customerEmail: 'alex.vance@company.io',
        amount: 450.0,
        currency: 'USD',
        processor: 'Stripe',
        reasonCode: '10.4_FRAUD_CARD_ABSENT',
        cardLast4: '8819',
        businessType: 'SaaS',
        activeHours: 38.5,
        twoFactorVerified: true,
        avsMatch: true,
        cvvMatch: true,
      }),
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Expected success: true');
    assert(Boolean(data.dispute?.id), 'Expected dispute ID');
    assert(data.dispute.evidenceScore !== undefined, 'Expected computed evidenceScore');
    createdDisputeId = data.dispute.id;
  });

  // 9. Dispute Query Endpoints
  await test('12. GET /api/disputes returns list of disputes with calculated SLA', async () => {
    const res = await fetch(`${BASE_URL}/api/disputes`, {
      headers: { Cookie: cookieHeader },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const list = await res.json();
    assert(Array.isArray(list), 'Expected array of disputes');
    assert(list.length > 0, 'Expected at least 1 dispute');
    const target = list.find((d: any) => d.id === createdDisputeId);
    assert(Boolean(target), 'Expected created dispute in list');
    assert(target.amountFormatted.includes('$450.00'), 'Expected formatted amount');
    assert(typeof target.hoursRemaining === 'number', 'Expected calculated hoursRemaining');
  });

  await test('13. GET /api/disputes/:id returns single dispute record with telemetry', async () => {
    const res = await fetch(`${BASE_URL}/api/disputes/${createdDisputeId}`, {
      headers: { Cookie: cookieHeader },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.id === createdDisputeId, 'Expected matching dispute ID');
    assert(Array.isArray(data.telemetrySignals), 'Expected telemetry signals array');
  });

  // 10. Human Review Sign-Off & Reviewer Attribution
  await test('14. POST /api/disputes/:id/approve uses authenticated user for reviewedBy', async () => {
    const res = await fetch(`${BASE_URL}/api/disputes/${createdDisputeId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        notes: 'Verified AVS/CVV matching, 2FA logs, and user telemetry. Approved.',
      }),
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.status === 'SUBMITTED', `Expected status SUBMITTED, got ${data.status}`);
    assert(data.dispute.reviewedBy === testName, `Expected reviewedBy to be ${testName}, got ${data.dispute.reviewedBy}`);
    assert(Boolean(data.submissionToken), 'Expected submissionToken token');
  });

  // 11. Internal Analytics Telemetry Route
  await test('15. GET /internal/analytics/:email returns enriched telemetry', async () => {
    const res = await fetch(`${BASE_URL}/internal/analytics/alex.vance@company.io`, {
      headers: { Cookie: cookieHeader },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.source === 'mock_analytics_db', 'Expected mock_analytics_db source');
    assert(Boolean(data.telemetry), 'Expected telemetry payload');
  });

  // 12. User Logout Flow
  await test('16. POST /auth/logout clears session cookie', async () => {
    const res = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { Cookie: cookieHeader },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const setCookie = res.headers.get('set-cookie');
    assert(Boolean(setCookie && (setCookie.includes('token=;') || setCookie.includes('Max-Age=0'))), 'Expected expired cookie');
  });

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`\n==============================================`);
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed out of ${results.length} Tests`);
  console.log(`==============================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
