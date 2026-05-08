const BASE = 'http://localhost:5000';

async function testDiagnosis() {
  try {
    // First register and login
    const regRes = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: `test${Date.now()}@test.com`,
        password: 'Test123456'
      })
    });
    const regData = await regRes.json();
    const token = regData.token;

    // Test diagnosis
    console.log('Testing diagnosis endpoint...');
    console.log('Symptoms: fever, headache, myalgia');
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const diagRes = await fetch(`${BASE}/api/predict/diagnose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        symptoms: ['fever', 'headache', 'myalgia'],
        answers: [
          { question: 'Have symptoms lasted more than 3 days?', answer: 'yes' },
          { question: 'Is the pain severe?', answer: 'no' }
        ]
      })
    });

    clearTimeout(timeout);
    console.log(`Response status: ${diagRes.status}`);
    
    const diagData = await diagRes.json();
    console.log('Response:', JSON.stringify(diagData, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDiagnosis();
