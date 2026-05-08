// Simple diagnosis test
const BASE = 'http://localhost:5000';

async function test() {
  try {
    // Register
    const regRes = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test',
        email: `test${Date.now()}@test.com`,
        password: 'Test123456'
      })
    });
    const { token } = await regRes.json();
    console.log('✅ Registered');

    // Diagnose
    console.log('Testing diagnosis...');
    const diagRes = await fetch(`${BASE}/api/predict/diagnose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        symptoms: ['fever', 'headache', 'body aches'],
        answers: [{ question: 'Duration?', answer: 'yes' }]
      })
    });

    console.log(`Status: ${diagRes.status}`);
    const data = await diagRes.json();
    console.log('Result:', JSON.stringify(data, null, 2).substring(0, 500));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
