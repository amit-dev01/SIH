// ============================================
// TEST SUITE: Polar Science Portal API
// Run: node tests/api-tests.js
// Or: API_URL=http://localhost:3000/api/v1 node tests/api-tests.js
// ============================================

require('dotenv').config();

const API = process.env.API_URL || 'http://localhost:3000/api/v1';
const SUPABASE_URL = process.env.SUPABASE_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;

let TOKEN = '';
let expeditionId = '';
let expeditionSlug = '';
let mediaId = '';
let publicationId = '';
let datasetId = '';
let generatedContentId = '';
let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`\x1b[32m✅ PASS:\x1b[0m ${name}`);
    passed++;
  } catch (err) {
    console.log(`\x1b[31m❌ FAIL:\x1b[0m ${name}`);
    console.log(`   \x1b[33mError: ${err.message}\x1b[0m`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

async function run() {
  console.log('\n🧊 \x1b[36mPolar Science Portal — API Test Suite\x1b[0m\n');
  console.log(`Testing API at: \x1b[35m${API}\x1b[0m\n`);

  // --- HEALTH ---
  await test('Health check returns ok', async () => {
    const res = await fetch(`${API}/health`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.success === true, 'Expected success: true');
    assert(data.data.status === 'ok', 'Expected status: ok');
  });

  // --- AUTH (via Supabase directly) ---
  await test('Sign up a test user via Supabase', async () => {
    if (!SUPABASE_URL || !ANON_KEY) {
      throw new Error('Set SUPABASE_URL and SUPABASE_ANON_KEY env vars or check .env');
    }
    const testEmail = `test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@ncpor.gov.in`;
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPassword@1234',
        data: { name: 'Test Scientist', role: 'ADMIN' }
      })
    });
    const data = await res.json();
    assert(data.access_token, 'No access token returned from Supabase auth signup');
    TOKEN = data.access_token;
  });

  // --- EXPEDITIONS ---
  await test('Create expedition (protected)', async () => {
    const uniqueTitle = `Test Antarctic Expedition ${Date.now()}`;
    const res = await fetch(`${API}/expeditions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({
        title: uniqueTitle,
        description: 'This is a comprehensive test expedition description that is at least fifty characters long for validation.',
        region: 'ANTARCTIC',
        startDate: '2026-01-01T00:00:00Z',
        status: 'PLANNED'
      })
    });
    const data = await res.json();
    assert(res.status === 201, `Expected 201, got ${res.status} (${JSON.stringify(data)})`);
    assert(data.success === true, 'Expected success: true');
    assert(data.data.id, 'No expedition ID returned');
    expeditionId = data.data.id;
    expeditionSlug = data.data.slug;
  });

  await test('List expeditions (public)', async () => {
    const res = await fetch(`${API}/expeditions`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.success === true, 'Expected success: true');
    assert(Array.isArray(data.data), 'Expected data to be array');
    assert(data.meta, 'Missing pagination meta');
  });

  await test('Get expedition by ID', async () => {
    assert(expeditionId, 'No expeditionId available from create step');
    const res = await fetch(`${API}/expeditions/${expeditionId}`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.data.id === expeditionId, 'Expedition ID mismatch');
  });

  await test('Get expedition by slug', async () => {
    assert(expeditionSlug, 'No expeditionSlug available');
    const res = await fetch(`${API}/expeditions/${expeditionSlug}`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.data.title.includes('Test'), 'Expedition title mismatch');
  });

  await test('Filter expeditions by region', async () => {
    const res = await fetch(`${API}/expeditions?region=ANTARCTIC`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    data.data.forEach((e) => assert(e.region === 'ANTARCTIC', `Expected region ANTARCTIC, got ${e.region}`));
  });

  await test('Get expedition stats', async () => {
    assert(expeditionId, 'No expeditionId available');
    const res = await fetch(`${API}/expeditions/${expeditionId}/stats`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.data.publications !== undefined, 'Missing publications count');
    assert(data.data.media !== undefined, 'Missing media count');
  });

  await test('Update expedition', async () => {
    assert(expeditionId, 'No expeditionId available');
    const res = await fetch(`${API}/expeditions/${expeditionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ status: 'ONGOING' })
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.data.status === 'ONGOING', 'Expected status to be ONGOING');
  });

  await test('Reject invalid expedition data', async () => {
    const res = await fetch(`${API}/expeditions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ title: 'AB' }) // Too short & missing required fields
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await test('Reject unauthenticated create', async () => {
    const res = await fetch(`${API}/expeditions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Should Fail Authentication',
        description: 'This should fail because no auth token is provided in the request payload.',
        region: 'ARCTIC',
        startDate: '2026-01-01T00:00:00Z'
      })
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  // --- PUBLICATIONS ---
  await test('Create publication', async () => {
    const res = await fetch(`${API}/publications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({
        title: `Test Publication on Ice Sheet Dynamics ${Date.now()}`,
        abstract: 'This scientific study investigates ice sheet dynamics in coastal East Antarctica.',
        authors: ['Dr. Test Scientist', 'Dr. Sample Researcher'],
        journal: 'Journal of Polar Glaciology',
        expeditionId: expeditionId || undefined,
        tags: 'antarctica,glaciology'
      })
    });
    const data = await res.json();
    assert(res.status === 201, `Expected 201, got ${res.status} (${JSON.stringify(data)})`);
    assert(data.data.id, 'No publication ID returned');
    publicationId = data.data.id;
  });

  await test('List publications', async () => {
    const res = await fetch(`${API}/publications`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(data.data), 'Expected publications data to be an array');
  });

  // --- SEARCH ---
  await test('Search returns mixed results', async () => {
    const res = await fetch(`${API}/search?q=test`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.data.results, 'Missing results array in search response');
    assert(data.data.counts, 'Missing counts object in search response');
  });

  await test('Search with type filter', async () => {
    const res = await fetch(`${API}/search?q=test&type=expedition`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    data.data.results.forEach((r) =>
      assert(r.type === 'expedition', `Expected type expedition, got ${r.type}`)
    );
  });

  await test('Search rejects short query', async () => {
    const res = await fetch(`${API}/search?q=a`);
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await test('Search suggest works', async () => {
    const res = await fetch(`${API}/search/suggest?q=test`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(data.data), 'Expected suggestions to be an array');
  });

  // --- MAP ---
  await test('Map locations returns pins', async () => {
    const res = await fetch(`${API}/map/locations`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(data.data), 'Expected map pins to be an array');
  });

  await test('Map expeditions returns data', async () => {
    const res = await fetch(`${API}/map/expeditions`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(data.data), 'Expected expedition map pins to be an array');
  });

  // --- OUTREACH (AI) ---
  await test('Generate AI content (mock/groq mode)', async () => {
    const res = await fetch(`${API}/outreach/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({
        sourceType: 'CUSTOM',
        platform: 'TWITTER',
        customInput: 'India launched its 43rd Antarctic expedition with 85 scientists to study ice sheet dynamics'
      })
    });
    const data = await res.json();
    assert(res.status === 201, `Expected 201, got ${res.status} (${JSON.stringify(data)})`);
    assert(data.data.content_text, 'No content_text generated');
    assert(data.data.status === 'DRAFT', 'Generated status should be DRAFT');
    generatedContentId = data.data.id;
  });

  await test('List drafts', async () => {
    const res = await fetch(`${API}/outreach/drafts`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(data.data), 'Expected drafts to be an array');
  });

  await test('Approve draft', async () => {
    assert(generatedContentId, 'No generatedContentId available');
    const res = await fetch(`${API}/outreach/${generatedContentId}/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  await test('Publish draft', async () => {
    assert(generatedContentId, 'No generatedContentId available');
    const res = await fetch(`${API}/outreach/${generatedContentId}/publish`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  await test('Published feed is public', async () => {
    const res = await fetch(`${API}/outreach/published`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(data.data), 'Expected published feed to be an array');
    assert(data.data.length > 0, 'Should have at least 1 published post');
  });

  // --- ANALYTICS ---
  await test('Popular content (public)', async () => {
    const res = await fetch(`${API}/analytics/popular`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.data.topExpeditions !== undefined, 'Missing topExpeditions');
  });

  await test('Timeline (public)', async () => {
    const res = await fetch(`${API}/analytics/timeline`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(data.data), 'Expected timeline to be an array');
  });

  await test('Overview (admin only)', async () => {
    const res = await fetch(`${API}/analytics/overview`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.data.totalExpeditions !== undefined, 'Missing totalExpeditions');
  });

  // --- 404 HANDLING ---
  await test('Non-existent route returns 404', async () => {
    const res = await fetch(`${API}/nonexistent`);
    assert(res.status === 404, `Expected 404, got ${res.status}`);
  });

  await test('Non-existent expedition returns 404', async () => {
    const res = await fetch(`${API}/expeditions/00000000-0000-0000-0000-000000000000`);
    assert(res.status === 404, `Expected 404, got ${res.status}`);
  });

  // --- CLEANUP ---
  await test('Delete test expedition', async () => {
    if (expeditionId) {
      const res = await fetch(`${API}/expeditions/${expeditionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
    }
  });

  // --- SUMMARY ---
  console.log('\n' + '='.repeat(50));
  console.log(`📊 \x1b[1mResults:\x1b[0m \x1b[32m${passed} passed\x1b[0m, \x1b[31m${failed} failed\x1b[0m`);
  console.log('='.repeat(50) + '\n');

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('Test suite crashed:', err);
  process.exit(1);
});
