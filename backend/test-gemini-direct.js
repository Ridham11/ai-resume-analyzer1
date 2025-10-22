// backend/test-gemini-direct.js
import 'dotenv/config';

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('❌ GEMINI_API_KEY missing in backend/.env');
  process.exit(1);
}

// Gemini 1.5 model names
const MODELS = ['gemini-1.5-flash', 'gemini-1.5-pro'];

// Use the regional (us-central1) endpoint — REQUIRED for Gemini 1.5
const BASE_URL =
  'https://us-central1-aiplatform.googleapis.com/v1/projects/gen-lang-client-0091354764/locations/us-central1/publishers/google/models';

async function tryModel(model) {
  const url = `${BASE_URL}/${model}:generateContent?key=${encodeURIComponent(API_KEY)}`;

  const body = {
    contents: [{ parts: [{ text: 'Return exactly: OK' }] }],
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    console.log(`\n🔹 Testing: ${model}`);
    console.log('Status:', res.status);

    if (!res.ok) {
      console.log('❌ Failed:', text);
      return false;
    }

    console.log('✅ Success response:\n', text);
    return true;
  } catch (err) {
    console.error(`💥 Error while testing ${model}:`, err.message);
    return false;
  }
}

(async () => {
  console.log('🔍 Testing Gemini 1.5 models (Regional v1 endpoint)...\n');
  let anyWorking = false;

  for (const m of MODELS) {
    const ok = await tryModel(m);
    if (ok) {
      anyWorking = true;
      break; // stop after first success
    }
  }

  if (!anyWorking) {
    console.log('\n❌ No working models found. Check API key or region.');
  }
})();
