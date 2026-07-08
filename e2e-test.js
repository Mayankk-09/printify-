// ============================================================
// Printify E2E Test Suite
// Tests all major API endpoints against the running dev server
// Usage: node e2e-test.js
// ============================================================

const BASE = 'http://localhost:4000';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Test tracking
let passed = 0;
let failed = 0;
const failures = [];

function pass(msg) {
  passed++;
  console.log(`  \u2713 PASS: ${msg}`);
}

function fail(msg, detail) {
  failed++;
  if (detail instanceof Object) detail = JSON.stringify(detail).substring(0, 300);
  const d = detail ? ` - ${String(detail).substring(0, 300)}` : '';
  console.log(`  \u2717 FAIL: ${msg}${d}`);
  failures.push({ msg, detail: String(detail).substring(0, 300) });
}

function assert(cond, msg, detail) {
  cond ? pass(msg) : fail(msg, detail);
}

function section(title) {
  console.log(`\n--- ${title} ---`);
}

// ---- Helper: Cookie Jar ----
class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  setFromResponse(res) {
    let cookieHeaders;
    if (typeof res.headers.getSetCookie === 'function') {
      cookieHeaders = res.headers.getSetCookie();
    } else {
      const val = res.headers.get('set-cookie');
      cookieHeaders = val ? [val] : [];
    }

    for (const h of cookieHeaders) {
      const csrfMatch = h.match(/(?:^|,\s*)authjs\.csrf-token=([^;]+)/);
      if (csrfMatch) this.cookies.set('authjs.csrf-token', csrfMatch[1]);

      const sessionMatch = h.match(/(?:^|,\s*)authjs\.session-token=([^;]+)/);
      if (sessionMatch) this.cookies.set('authjs.session-token', sessionMatch[1]);
    }
  }

  getHeader() {
    if (this.cookies.size === 0) return '';
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  clear() {
    this.cookies.clear();
  }
}

// ---- Helper: API Requests ----
async function api(method, path, opts = {}) {
  const url = `${BASE}${path}`;
  const headers = { ...(opts.headers || {}) };
  if (opts.jar) {
    headers['Cookie'] = opts.jar.getHeader();
  }

  const fetchOpts = {
    method,
    headers,
    redirect: 'manual',
  };

  if (opts.body) {
    if (typeof opts.body === 'object' && !(opts.body instanceof URLSearchParams)) {
      headers['Content-Type'] = 'application/json';
      fetchOpts.body = JSON.stringify(opts.body);
    } else {
      fetchOpts.body = opts.body;
    }
  }

  const res = await fetch(url, fetchOpts);

  // Try to parse JSON
  let data;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    data = text.length > 200 ? text.substring(0, 200) + '...' : text;
  }

  return { status: res.status, data, headers: res.headers, res };
}

// ---- Helper: Login ----
async function loginUser(email, password) {
  const jar = new CookieJar();

  // Step 1: CSRF
  const csrfRes = await api('GET', '/api/auth/csrf', { jar });
  jar.setFromResponse(csrfRes.res);
  const csrfToken = csrfRes.data && csrfRes.data.csrfToken;
  if (!csrfToken) throw new Error('Failed to get CSRF token');

  // Step 2: Login
  const body = new URLSearchParams({
    csrfToken,
    email,
    password,
    callbackUrl: BASE,
  });

  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: 'POST',
    redirect: 'manual',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': jar.getHeader(),
    },
    body,
  });

  jar.setFromResponse(loginRes);

  if (loginRes.status !== 302) {
    const txt = await loginRes.text();
    throw new Error(`Login expected 302, got ${loginRes.status}: ${txt.substring(0, 200)}`);
  }

  // Verify by hitting a protected endpoint
  const verifyRes = await fetch(`${BASE}/api/users/me`, {
    headers: { 'Cookie': jar.getHeader() },
  });

  if (!verifyRes.ok) {
    const txt = await verifyRes.text();
    throw new Error(`Login verification failed: ${verifyRes.status} ${txt.substring(0, 200)}`);
  }

  return jar;
}

// ---- Helper: Register User ----
const ts = Date.now();
const U = {
  student: {
    name: 'E2E Student',
    email: `e2e-student-${ts}@test.com`,
    password: 'TestPass123!',
    phone: '9999999901',
  },
  trial: {
    name: 'E2E Trial',
    email: `e2e-trial-${ts}@test.com`,
    password: 'TestPass123!',
    phone: '9999999902',
  },
  packUser: {
    name: 'E2E Pack',
    email: `e2e-pack-${ts}@test.com`,
    password: 'TestPass123!',
    phone: '9999999903',
  },
  noPack: {
    name: 'E2E NoPack',
    email: `e2e-nopack-${ts}@test.com`,
    password: 'TestPass123!',
    phone: '9999999904',
  },
};
const ADMIN = { email: 'admin@printify.com', password: 'admin123' };

// Store created resources for cleanup
const createdEmails = [];
function trackUser(email) { createdEmails.push(email); }

// ---- Store references ----
let addonsList = [];
let plansList = [];
let trialJar, studentJar, packJar, noPackJar, adminJar;
let orderBwId, orderColorId, orderTrialId, orderPackId, orderNoPackId;
let subscriptionId;

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('Printify E2E Test Suite');
  console.log(`Server: ${BASE}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  try {
    // ---- 1. REGISTRATION ----
    section('1. Registration');
    await testRegistration(U.student);
    await testRegistration(U.trial);
    await testRegistration(U.packUser);
    await testRegistration(U.noPack);
    await testDuplicateRegistration(U.student);

    // ---- 2. AUTHENTICATION ----
    section('2. Authentication');
    studentJar = await testLogin(U.student.email, U.student.password, 'Student');
    trialJar = await testLogin(U.trial.email, U.trial.password, 'Trial');
    packJar = await testLogin(U.packUser.email, U.packUser.password, 'PackUser');
    noPackJar = await testLogin(U.noPack.email, U.noPack.password, 'NoPack');
    adminJar = await testLogin(ADMIN.email, ADMIN.password, 'Admin');
    await testProtectedEndpoint();

    // ---- 3. ADDONS API ----
    section('3. Addons API');
    addonsList = await testAddonsList();

    // ---- 4. PLANS/PACKS API ----
    section('4. Plans API');
    plansList = await testPlansList();

    // ---- 5. TRIAL CLAIM ----
    section('5. Trial Claim');
    await testTrialClaim(trialJar);
    await testTrialDuplicateClaim(trialJar);

    // ---- 6. ORDER: BW (no addons, no pack) ----
    section('6. Order: BW, no addons, no pack');
    const bwOrder = await testCreateBwOrder(noPackJar);
    orderBwId = bwOrder.id;

    // ---- 7. ORDER: Color with addons ----
    section('7. Order: Color with addons');
    const colorOrder = await testCreateColorOrder(studentJar);
    orderColorId = colorOrder.id;

    // ---- 8. ORDER: Using trial ----
    section('8. Order: Using trial');
    const trialOrder = await testCreateTrialOrder(trialJar);
    orderTrialId = trialOrder.id;

    // ---- 9. SUBSCRIPTION ----
    section('9. Subscription API');
    const subResult = await testCreateSubscription(packJar, plansList[0].id);
    subscriptionId = subResult.id;
    await testSubscriptionsMine(packJar);

    // ---- 10. ORDER: Using pack subscription ----
    section('10. Order: Using pack subscription');
    const packOrder = await testCreatePackOrder(packJar);
    orderPackId = packOrder.id;

    // ---- 11. ORDER: No pack (pay-per-page) ----
    section('11. Order: No pack (pay-per-page)');
    const nopOrder = await testCreateNoPackOrder(studentJar);
    orderNoPackId = nopOrder.id;

    // ---- 12. PAYMENTS API ----
    section('12. Payments API');
    await testPaymentsApi(adminJar);

    // ---- 13. ORDERS MINE ----
    section('13. Orders Mine');
    await testOrdersMine(studentJar);
    // studentJar should NOT see packOrder (owned by packJar)
    await testOrdersMineIsolation(studentJar, orderPackId);

    // ---- 14. USERS ME ----
    section('14. Users Me');
    await testUsersMe(studentJar);

    // ---- 15. ADMIN ORDERS ----
    section('15. Admin Orders');
    await testAdminOrders(adminJar);

    // ---- 16. STATUS UPDATE ----
    section('16. Status Update');
    await testStatusTransitions(adminJar, orderBwId);

    // ---- 17. SUBSCRIPTIONS ADMIN ----
    section('17. Subscriptions Admin');
    await testSubscriptionsAdmin(adminJar);

  } catch (err) {
    console.error(`\nUNEXPECTED ERROR: ${err.message}`);
    console.error(err.stack);
    failed++;
    failures.push({ msg: 'UNEXPECTED_ERROR', detail: err.message });
  } finally {
    // ---- CLEANUP ----
    console.log('\n--- Cleanup ---');
    await cleanup();
    printSummary();
    await prisma.$disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

// ============================================================
// TEST FUNCTIONS
// ============================================================

// ---- 1. REGISTRATION ----
async function testRegistration(user) {
  try {
    const { status, data } = await api('POST', '/api/auth/register', {
      body: { name: user.name, email: user.email, phone: user.phone, password: user.password },
    });
    assert(status === 201 || status === 200, `Register ${user.email} returns ${status}`, data);
    if (status < 300) {
      trackUser(user.email);
      assert(data.user && data.user.email === user.email, `Register response has user with email`, data);
      assert(data.user && data.user.id, `Register response has user.id`, data);
    }
  } catch (e) {
    fail(`Register ${user.email} threw`, e.message);
  }
}

async function testDuplicateRegistration(user) {
  try {
    const { status, data } = await api('POST', '/api/auth/register', {
      body: { name: user.name, email: user.email, phone: user.phone, password: user.password },
    });
    assert(status === 400, `Duplicate register returns 400`, data);
    assert(data && data.error, `Duplicate register has error message`, data);
  } catch (e) {
    fail(`Duplicate register threw`, e.message);
  }
}

// ---- 2. AUTHENTICATION ----
async function testLogin(email, password, label) {
  try {
    const jar = await loginUser(email, password);
    pass(`Login as ${label} (${email})`);
    return jar;
  } catch (e) {
    fail(`Login as ${label}`, e.message);
    throw e;
  }
}

async function testProtectedEndpoint() {
  try {
    const { status } = await api('GET', '/api/orders/mine', {});
    assert(status === 401, `Protected endpoint returns 401 without auth`);
  } catch (e) {
    fail(`Protected endpoint test threw`, e.message);
  }
}

// ---- 3. ADDONS ----
async function testAddonsList() {
  try {
    const { status, data } = await api('GET', '/api/addons');
    assert(status === 200, `GET /api/addons returns 200`, status);
    assert(Array.isArray(data), `Addons is an array`);
    assert(data.length >= 5, `At least 5 addons`, `got ${data.length}`);

    // Check shape
    const a = data[0];
    assert(a.id && a.name && typeof a.price === 'number', `Addon has required fields`, Object.keys(a));

    pass(`Found ${data.length} addons`);
    return data;
  } catch (e) {
    fail(`GET /api/addons threw`, e.message);
    return [];
  }
}

// ---- 4. PLANS ----
async function testPlansList() {
  try {
    const { status, data } = await api('GET', '/api/plans');
    assert(status === 200, `GET /api/plans returns 200`, status);
    assert(Array.isArray(data), `Plans is an array`);
    assert(data.length >= 3, `At least 3 plans`, `got ${data.length}`);

    const p = data[0];
    assert(p.id && p.name && p.slug && typeof p.price === 'number' && typeof p.pages === 'number',
      `Plan has required fields`, Object.keys(p));

    pass(`Found ${data.length} plans`);
    return data;
  } catch (e) {
    fail(`GET /api/plans threw`, e.message);
    return [];
  }
}

// ---- 5. TRIAL CLAIM ----
async function testTrialClaim(jar) {
  try {
    const { status, data } = await api('POST', '/api/trials/claim', { jar });
    assert(status === 200, `POST /api/trials/claim returns 200`, data);
    assert(data.message && data.hasClaimedTrial === true, `Trial claim response ok`, data);
  } catch (e) {
    fail(`Trial claim threw`, e.message);
  }
}

async function testTrialDuplicateClaim(jar) {
  try {
    const { status, data } = await api('POST', '/api/trials/claim', { jar });
    assert(status === 400, `Duplicate trial claim returns 400`, data);
  } catch (e) {
    fail(`Duplicate trial claim threw`, e.message);
  }
}

// ---- 6. ORDER: BW no addons ----
async function testCreateBwOrder(jar) {
  try {
    const { status, data } = await api('POST', '/api/orders', {
      jar,
      body: {
        fileName: 'test-bw.pdf',
        filePath: '/uploads/test-bw.pdf',
        pages: 3,
        copies: 1,
        printMode: 'BW',
        printSide: 'SINGLE',
        paymentConfirmed: true,
      },
    });
    assert(status === 201, `BW order created (${status})`, data);
    assert(data.order && data.order.id, `BW order has id`);
    assert(data.order.printMode === 'BW', `BW order mode is BW`);
    assert(data.breakdown && data.breakdown.grandTotal > 0, `BW order has grandTotal > 0`);
    assert(data.chargeablePages > 0, `BW has chargeablePages`);
    pass(`BW order: ${data.order.id}`);
    return data.order;
  } catch (e) {
    fail(`BW order threw`, e.message);
    return {};
  }
}

// ---- 7. ORDER: Color with addons ----
async function testCreateColorOrder(jar) {
  try {
    const addonIds = addonsList.filter(a => a.price > 0).slice(0, 2).map(a => a.id);
    const { status, data } = await api('POST', '/api/orders', {
      jar,
      body: {
        fileName: 'test-color.pdf',
        filePath: '/uploads/test-color.pdf',
        pages: 5,
        copies: 2,
        printMode: 'COLOR',
        printSide: 'DOUBLE',
        addonIds,
        notes: 'Test color order with addons',
        paymentConfirmed: true,
      },
    });
    assert(status === 201, `Color order created (${status})`, data);
    assert(data.order && data.order.id, `Color order has id`);
    assert(data.order.printMode === 'COLOR', `Color order mode is COLOR`);
    assert(data.order.printSide === 'DOUBLE', `Color order side is DOUBLE`);
    assert(data.order.copies === 2, `Color order copies = 2`);
    assert(data.breakdown.grandTotal > 0, `Color order grandTotal > 0`);
    assert(data.breakdown.addonCost > 0, `Color order has addonCost > 0`);
    pass(`Color order: ${data.order.id}`);
    return data.order;
  } catch (e) {
    fail(`Color order threw`, e.message);
    return {};
  }
}

// ---- 8. ORDER: Using trial ----
async function testCreateTrialOrder(jar) {
  try {
    // Step 1: Check trial eligibility (preview)
    const preview = await api('POST', '/api/orders', {
      jar,
      body: {
        fileName: 'test-trial.pdf',
        filePath: '/uploads/test-trial.pdf',
        pages: 3,
        copies: 1,
        printMode: 'BW',
        printSide: 'SINGLE',
      },
    });
    assert(preview.status === 200, `Trial preview returns 200`, preview.data);
    assert(preview.data.trialEligible === true, `Trial preview shows eligible`);
    assert(preview.data.requiresPayment === false, `Trial preview no payment`);
    pass(`Trial eligibility preview OK`);

    // Step 2: Submit with paymentConfirmed: true to finalize trial order
    const { status, data } = await api('POST', '/api/orders', {
      jar,
      body: {
        fileName: 'test-trial.pdf',
        filePath: '/uploads/test-trial.pdf',
        pages: 3,
        copies: 1,
        printMode: 'BW',
        printSide: 'SINGLE',
        paymentConfirmed: true,
      },
    });
    assert(status === 201, `Trial order created (${status})`, data);
    assert(data.isTrialUsed === true, `Trial order used trial`);
    assert(data.breakdown.grandTotal === 0, `Trial order grandTotal = 0`);
    assert(data.message && data.message.includes('trial'), `Trial order message`, data.message);
    pass(`Trial order: ${data.order.id}`);
    return data.order;
  } catch (e) {
    fail(`Trial order threw`, e.message);
    return {};
  }
}

// ---- 9. SUBSCRIPTION ----
async function testCreateSubscription(jar, packId) {
  try {
    const { status, data } = await api('POST', '/api/subscriptions', {
      jar,
      body: { packId },
    });
    assert(status === 201, `Subscription created (${status})`, data);
    assert(data.id, `Subscription has id`);
    assert(data.packId === packId, `Subscription has correct packId`);
    assert(data.status === 'active', `Subscription status is active`);
    assert(data.pagesAllowed > 0, `Subscription has pagesAllowed > 0`);
    pass(`Subscription: ${data.id}`);
    return data;
  } catch (e) {
    fail(`Create subscription threw`, e.message);
    return {};
  }
}

async function testSubscriptionsMine(jar) {
  try {
    const { status, data } = await api('GET', '/api/subscriptions/mine', { jar });
    assert(status === 200, `GET /api/subscriptions/mine returns 200`);
    assert(data.subscriptions && Array.isArray(data.subscriptions), `Has subscriptions array`);
    assert(data.subscriptions.length > 0, `Has at least one subscription`);
    assert(typeof data.totalAllowed === 'number', `Has totalAllowed`);
    assert(typeof data.remainingPages === 'number', `Has remainingPages`);
    pass(`Found ${data.subscriptions.length} subscriptions, ${data.remainingPages} pages remaining`);
  } catch (e) {
    fail(`Subscriptions mine threw`, e.message);
  }
}

// ---- 10. ORDER: Using pack ----
async function testCreatePackOrder(jar) {
  try {
    const { status, data } = await api('POST', '/api/orders', {
      jar,
      body: {
        fileName: 'test-pack.pdf',
        filePath: '/uploads/test-pack.pdf',
        pages: 2,
        copies: 1,
        printMode: 'BW',
        printSide: 'SINGLE',
      },
    });
    assert(status === 201, `Pack order created (${status})`, data);
    assert(data.coveredByPack > 0, `Pack order covered by pack`);
    assert(data.chargeablePages === 0, `Pack order has 0 chargeable pages`);
    assert(data.breakdown.grandTotal === 0, `Pack order grandTotal = 0`);
    assert(data.breakdown.packDiscount < 0, `Pack order has packDiscount`);
    pass(`Pack order: ${data.order.id}`);
    return data.order;
  } catch (e) {
    fail(`Pack order threw`, e.message);
    return {};
  }
}

// ---- 11. ORDER: No pack (pay-per-page) ----
async function testCreateNoPackOrder(jar) {
  try {
    const { status, data } = await api('POST', '/api/orders', {
      jar,
      body: {
        fileName: 'test-nopack.pdf',
        filePath: '/uploads/test-nopack.pdf',
        pages: 4,
        copies: 1,
        printMode: 'BW',
        printSide: 'SINGLE',
        paymentConfirmed: true,
      },
    });
    assert(status === 201, `No-pack order created (${status})`, data);
    assert(data.order.id, `No-pack order has id`);
    assert(data.chargeablePages === 4, `No-pack chargeablePages = 4`);
    assert(data.breakdown.grandTotal > 0, `No-pack grandTotal > 0`);
    assert(data.breakdown.packDiscount === 0, `No-pack packDiscount = 0`);
    pass(`No-pack order: ${data.order.id}`);
    return data.order;
  } catch (e) {
    fail(`No-pack order threw`, e.message);
    return {};
  }
}

// ---- 12. PAYMENTS ----
async function testPaymentsApi(adminJar) {
  try {
    // We need a pack for the payments API
    if (!plansList.length) {
      fail('Payments API', 'No plans available');
      return;
    }
    // The payments API requires a real razorpay payment; since keys are not set,
    // RAZORPAY_KEY_SECRET will be empty string, so signature verification is skipped.
    // But we need a valid pack. Use the first available pack.
    const pack = plansList[0];
    const { status, data } = await api('POST', '/api/payments', {
      jar: adminJar,
      body: {
        packId: pack.id,
        razorpayPaymentId: 'pay_test_e2e_' + ts,
        razorpayOrderId: 'order_test_e2e_' + ts,
        razorpaySignature: 'sig_test_e2e_' + ts,
      },
    });
    assert(status === 201, `Payment created (${status})`, data);
    assert(data.payment && data.payment.id, `Payment has id`);
    assert(data.subscription && data.subscription.id, `Payment created subscription`);
    assert(data.payment.status === 'COMPLETED', `Payment status COMPLETED`);
    assert(data.payment.amount === pack.price, `Payment amount matches pack price`);
    pass(`Payment: ${data.payment.id}`);
  } catch (e) {
    fail(`Payments API threw`, e.message);
  }
}

// ---- 13. ORDERS MINE ----
async function testOrdersMine(jar) {
  try {
    const { status, data } = await api('GET', '/api/orders/mine', { jar });
    assert(status === 200, `GET /api/orders/mine returns 200`);
    assert(Array.isArray(data), `Orders mine is array`);
    assert(data.length > 0, `Orders mine has orders`);
    const o = data[0];
    assert(o.id && o.status && o.fileName && o.printMode, `Order has required fields`, Object.keys(o));
    pass(`Found ${data.length} orders`);
  } catch (e) {
    fail(`Orders mine threw`, e.message);
  }
}

async function testOrdersMineIsolation(jar, otherOrderId) {
  try {
    if (!otherOrderId) { fail('Orders mine isolation', 'No reference order'); return; }
    const { status, data } = await api('GET', '/api/orders/mine', { jar });
    assert(status === 200, `Orders mine isolation returns 200`);
    const found = data.some(o => o.id === otherOrderId);
    assert(!found, `User cannot see another user's order`);
    pass('Order isolation verified');
  } catch (e) {
    fail(`Orders mine isolation threw`, e.message);
  }
}

// ---- 14. USERS ME ----
async function testUsersMe(jar) {
  try {
    const { status, data } = await api('GET', '/api/users/me', { jar });
    assert(status === 200, `GET /api/users/me returns 200`);
    assert(data.id && data.email && data.name && data.role, `User has required fields`, Object.keys(data));
    assert(data.role === 'student' || data.role === 'admin', `User has valid role`);
    assert(typeof data.hasUsedTrial === 'boolean', `hasUsedTrial is boolean`);
    assert(typeof data.hasClaimedTrial === 'boolean', `hasClaimedTrial is boolean`);
    pass(`User: ${data.name} (${data.email})`);
  } catch (e) {
    fail(`Users me threw`, e.message);
  }
}

// ---- 15. ADMIN ORDERS ----
async function testAdminOrders(jar) {
  try {
    const { status, data } = await api('GET', '/api/admin/orders', { jar });
    assert(status === 200, `GET /api/admin/orders returns 200`);
    assert(data.orders && Array.isArray(data.orders), `Admin orders has orders array`);
    assert(data.pagination && typeof data.pagination.total === 'number', `Has pagination`);
    assert(data.statusCounts && typeof data.statusCounts === 'object', `Has statusCounts`);
    pass(`Admin: ${data.orders.length} orders (total ${data.pagination.total})`);
  } catch (e) {
    fail(`Admin orders threw`, e.message);
  }
}

// ---- 16. STATUS UPDATE ----
async function testStatusTransitions(jar, orderId) {
  if (!orderId) { fail('Status update', 'No order ID'); return; }

  const transitions = [
    { status: 'ACCEPTED', expected: 200 },
    { status: 'PRINTING', expected: 200 },
    { status: 'READY', expected: 200 },
    { status: 'COLLECTED', expected: 200 },
  ];

  for (const t of transitions) {
    try {
      const { status, data } = await api('PATCH', `/api/orders/${orderId}/status`, {
        jar,
        body: { status: t.status },
      });
      assert(status === t.expected, `Status ${t.status} returns ${t.expected}`, data);
      if (status === 200) {
        assert(data.status === t.status, `Order status updated to ${t.status}`, data.status);
        // Check timestamp was set
        const fieldMap = { ACCEPTED: 'acceptedAt', PRINTING: 'printingAt', READY: 'readyAt', COLLECTED: 'collectedAt' };
        assert(data[fieldMap[t.status]], `${fieldMap[t.status]} was set`, data[fieldMap[t.status]]);
      }
      pass(`Status transition: SUBMITTED -> ${t.status}`);
    } catch (e) {
      fail(`Status ${t.status} threw`, e.message);
    }
  }

  // Test invalid transition
  try {
    const { status, data } = await api('PATCH', `/api/orders/${orderId}/status`, {
      jar,
      body: { status: 'SUBMITTED' },
    });
    assert(status === 400, `Invalid transition returns 400`, data);
    pass(`Invalid status transition rejected`);
  } catch (e) {
    fail(`Invalid transition threw`, e.message);
  }
}

// ---- 17. SUBSCRIPTIONS ADMIN ----
async function testSubscriptionsAdmin(jar) {
  try {
    const { status, data } = await api('GET', '/api/subscriptions', { jar });
    assert(status === 200, `GET /api/subscriptions returns 200`);
    assert(Array.isArray(data), `Subscriptions is array`);
    if (data.length > 0) {
      const s = data[0];
      assert(s.id && s.packId && s.userId, `Subscription has required fields`, Object.keys(s));
      assert(s.user && s.pack, `Subscription includes user and pack`);
    }
    pass(`Found ${data.length} subscriptions`);
  } catch (e) {
    fail(`Subscriptions admin threw`, e.message);
  }
}

// ---- CLEANUP ----
async function cleanup() {
  for (const email of createdEmails) {
    try {
      await prisma.user.deleteMany({ where: { email } });
      pass(`Cleaned up user ${email}`);
    } catch (e) {
      console.log(`  Cleanup user ${email}: ${e.message}`);
    }
  }
}

// ---- SUMMARY ----
function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log(`RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  if (failures.length > 0) {
    console.log('\nFAILURES:');
    for (const f of failures) {
      console.log(`  - ${f.msg}${f.detail ? ': ' + f.detail : ''}`);
    }
  }
  console.log('='.repeat(60));
}

main();
