// backend/test-gemini-models.js
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('❌ GEMINI_API_KEY missing in backend/.env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const modelsToTest = ['gemini-1.5-flash', 'gemini-1.5-pro'];

async function testModel(modelName) {
  try {
    console.log(`\nTesting: ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Return exactly: OK');
    console.log(`✅ ${modelName} WORKS! ->`, result.response.text());
    return true;
  } catch (error) {
    console.log(`❌ ${modelName} FAILED`);
    console.log('name:', error?.name);
    console.log('message:', error?.message);
    if (error?.response) {
      console.log('status:', error.response.status);
      console.log('body  :', await error.response.text());
    }
    return false;
  }
}

(async function findWorkingModel() {
  console.log('🔍 Testing Gemini models (SDK v1)...');
  let found = false;
  for (const name of modelsToTest) {
    if (await testModel(name)) { found = true; break; }
  }
  if (!found) console.log('\n❌ No working models found');
})();