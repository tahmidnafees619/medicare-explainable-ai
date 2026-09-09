const BASE = 'http://localhost:5000';
const tests = [
  { name: 'Health', method: 'GET', path: '/health' },
  { name: 'Test', method: 'GET', path: '/test' },
  { name: 'Auth Register', method: 'POST', path: '/api/auth/register', body: { name: 'test', email: 'test@test.com', password: '123456' } },
];

async function runTest(test) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const opts = {
      method: test.method,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
    };
    if (test.body) opts.body = JSON.stringify(test.body);
    
    const res = await fetch(`${BASE}${test.path}`, opts);
    clearTimeout(timeout);
    const text = await res.text();
    console.log(`✓ ${test.name}: ${res.status} - ${text.substring(0, 100)}`);
  } catch (e) {
    console.log(`✗ ${test.name}: ${e.message}`);
  }
}

(async () => {
  for (const test of tests) {
    await runTest(test);
  }
})();
