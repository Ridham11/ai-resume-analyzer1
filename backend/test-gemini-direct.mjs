// test-gemini-direct.mjs
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Read key from .env
const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error('❌ GEMINI_API_KEY missing in backend/.env');
  process.exit(1);
}

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(key);

async function tryModel(id) {
  try {
    const model = genAI.getGenerativeModel({ model: id });
    const res = await model.generateContent('Return exactly: OK');
    console.log(`✅ ${id}:`, res.response.text());
  } catch (e) {
    console.error(`❌ ${id}:`, e?.message);
    if (e?.response) {
      console.error('status:', e.response.status);
      console.error('body:', await e.response.text());
    }
  }
}

console.log('🔍 Testing Gemini models...\n');
await tryModel('gemini-1.5-flash');
await tryModel('gemini-1.5-pro');
