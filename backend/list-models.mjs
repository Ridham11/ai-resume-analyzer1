// backend/list-models.mjs
import 'dotenv/config';

const key = process.env.GEMINI_API_KEY;
if (!key) { console.error('GEMINI_API_KEY missing'); process.exit(1); }

const url = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(key)}`;

const res = await fetch(url);
const text = await res.text();
console.log('status:', res.status);
console.log(text);
