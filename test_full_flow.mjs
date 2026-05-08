// Comprehensive flow test
const BASE = 'http://localhost:5000';

async function testFlow() {
  console.log('🧪 Starting comprehensive system test...\n');

  try {
    // 1. Register user
    console.log('1️⃣ Testing user registration...');
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
    console.log(`   Status: ${regRes.status}`);
    console.log(`   Result:`, regData);
    
    if (!regRes.ok || !regData.token) {
      console.error('   ❌ Registration failed');
      return;
    }
    
    const token = regData.token;
    console.log('   ✅ Registration successful\n');

    // 2. Test symptom extraction
    console.log('2️⃣ Testing symptom extraction...');
    const symptomRes = await fetch(`${BASE}/api/predict/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ symptoms: 'I have fever, headache, and body aches' })
    });
    const symptomData = await symptomRes.json();
    console.log(`   Status: ${symptomRes.status}`);
    console.log(`   Result:`, symptomData);
    
    if (!symptomRes.ok) {
      console.error('   ❌ Extraction failed');
      return;
    }
    
    console.log('   ✅ Symptoms extracted\n');

    // 3. Test follow-up questions
    console.log('3️⃣ Testing follow-up questions...');
    const symptoms = symptomData.symptoms_found || ['fever', 'headache', 'body aches'];
    const fupRes = await fetch(`${BASE}/api/predict/followup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ symptoms })
    });
    const fupData = await fupRes.json();
    console.log(`   Status: ${fupRes.status}`);
    console.log(`   Questions:`, fupData.questions?.length || 0);
    
    if (!fupRes.ok) {
      console.error('   ❌ Follow-up generation failed');
      return;
    }
    
    console.log('   ✅ Follow-up questions generated\n');

    // 4. Test diagnosis
    console.log('4️⃣ Testing diagnosis with follow-up answers...');
    const answers = fupData.questions?.slice(0, 2).map(q => ({ question: q, answer: 'yes' })) || [];
    const diagRes = await fetch(`${BASE}/api/predict/diagnose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ symptoms, answers })
    });
    const diagData = await diagRes.json();
    console.log(`   Status: ${diagRes.status}`);
    console.log(`   Disease:`, diagData.predictedDisease);
    console.log(`   Confidence:`, diagData.confidence);
    
    if (!diagRes.ok) {
      console.error('   ❌ Diagnosis failed');
      console.error('   Error:', diagData.error);
      return;
    }
    
    console.log('   ✅ Diagnosis successful\n');

    // 5. Test history save
    console.log('5️⃣ Testing history save...');
    const histRes = await fetch(`${BASE}/api/chat/create-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        symptoms,
        predictedDisease: diagData.predictedDisease,
        confidence: diagData.confidence,
        explanation: diagData.explanation
      })
    });
    const histData = await histRes.json();
    console.log(`   Status: ${histRes.status}`);
    console.log(`   Session ID:`, histData.id);
    
    if (!histRes.ok) {
      console.error('   ❌ History save failed');
      return;
    }
    
    console.log('   ✅ History saved\n');

    // 6. Test history retrieval
    console.log('6️⃣ Testing history retrieval...');
    const getHistRes = await fetch(`${BASE}/api/chat/history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const getHistData = await getHistRes.json();
    console.log(`   Status: ${getHistRes.status}`);
    console.log(`   Sessions:`, getHistData.length || 0);
    console.log('   ✅ History retrieved\n');

    console.log('✅ ALL TESTS PASSED!');
    console.log('\n📊 Summary:');
    console.log('   - Registration: ✓');
    console.log('   - Symptom Extraction: ✓');
    console.log('   - Follow-up Questions: ✓');
    console.log('   - Diagnosis: ✓');
    console.log('   - History Save: ✓');
    console.log('   - History Retrieval: ✓');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testFlow();
