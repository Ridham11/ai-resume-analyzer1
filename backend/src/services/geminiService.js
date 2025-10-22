import 'dotenv/config';
import logger from '../utils/logger.js';

// ---- Config ----
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'; // matches what your key lists

if (!API_KEY) {
  logger.error('❌ GEMINI_API_KEY not found in environment');
}

// AI Studio v1 endpoint (works with your key for 2.5 models)
const BASE_URL = 'https://generativelanguage.googleapis.com/v1/models';

/**
 * Low-level helper: call Gemini v1 generateContent
 */
async function generateContentV1(prompt) {
  if (!API_KEY) throw new Error('GEMINI_API_KEY is missing');

  const url = `${BASE_URL}/${MODEL}:generateContent?key=${encodeURIComponent(API_KEY)}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    // You can pass generationConfig here if you wish:
    // generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 2048 },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await res.text();

  if (!res.ok) {
    // Log the full body for debugging, then throw
    logger.error(`Gemini v1 error ${res.status}: ${text}`);
    throw new Error(`Gemini v1 error ${res.status}`);
  }

  // Extract the model text
  const data = JSON.parse(text);
  const out =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ??
    '';

  return String(out);
}

/**
 * ✅ NEW: Validate if the extracted text is actually a resume/CV
 */
export const validateIsResume = async (extractedText) => {
  try {
    const prompt = `
You are a resume validator. Analyze the following text and determine if it's a resume/CV or not.

A resume/CV typically contains:
- Personal information (name, contact details, email, phone)
- Work experience or employment history
- Education details (degree, university, graduation year)
- Skills section
- Professional summary or objective

Text to analyze:
${extractedText.substring(0, 2000)}

Respond with ONLY a JSON object in this exact format (no additional text):
{
  "isResume": true or false,
  "confidence": <number 0-100>,
  "reason": "<brief explanation>"
}

JSON Response:`.trim();

    const modelText = await generateContentV1(prompt);

    // Parse JSON from response
    const jsonMatch = modelText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      logger.warn('Failed to parse validation response, assuming valid');
      return {
        isValid: true,
        confidence: 50,
        reason: 'Validation check failed, proceeding with analysis',
      };
    }

    const validation = JSON.parse(jsonMatch[0]);

    logger.info('Resume validation completed', {
      isResume: validation.isResume,
      confidence: validation.confidence,
    });

    return {
      isValid: validation.isResume === true && validation.confidence >= 60,
      confidence: validation.confidence,
      reason: validation.reason,
    };
  } catch (error) {
    logger.error('Resume validation error:', error);
    // If validation fails, assume it's valid to not block legitimate resumes
    return {
      isValid: true,
      confidence: 50,
      reason: 'Validation check failed, proceeding with analysis',
    };
  }
};

/**
 * Analyze resume using Gemini
 */
export const analyzeResume = async (resumeText) => {
  try {
    const prompt = `
You are an expert resume analyzer and career counselor. Analyze the following resume and provide detailed feedback.

Resume Content:
${resumeText}

Please provide a comprehensive analysis in the following JSON format:
{
  "overallScore": <number between 0-100>,
  "strengths": [<list of 3-5 strengths>],
  "weaknesses": [<list of 3-5 areas for improvement>],
  "suggestions": [<list of 3-5 actionable suggestions>],
  "keySkills": [<list of key skills identified>],
  "summary": "<brief 2-3 sentence summary>"
}

Be specific, actionable, and constructive in your feedback.
`.trim();

    const modelText = await generateContentV1(prompt);

    // Parse JSON from response
    const jsonMatch = modelText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse AI response');

    const analysis = JSON.parse(jsonMatch[0]);

    logger.info('Resume analyzed successfully by Gemini (v1 REST)');
    return analysis;
  } catch (error) {
    logger.error('Gemini analysis error:', error);

    // Fallback
    return {
      overallScore: 70,
      strengths: [
        'Resume content provided',
        'Structured information',
        'Contains relevant experience',
      ],
      weaknesses: [
        'AI analysis temporarily unavailable',
        'Manual review recommended',
      ],
      suggestions: [
        'Ensure clear formatting',
        'Add quantifiable achievements',
        'Include relevant keywords',
      ],
      keySkills: extractKeywordsSimple(resumeText),
      summary:
        'AI analysis is temporarily unavailable. Please review manually or try again later.',
    };
  }
};

/**
 * Check ATS compatibility
 */
export const checkATSCompatibility = async (resumeText, jobDescription) => {
  try {
    const prompt = `
You are an ATS (Applicant Tracking System) expert. Compare this resume against the job description and provide a compatibility analysis.

Resume:
${resumeText}

Job Description:
${jobDescription}

Provide your analysis in this JSON format:
{
  "atsScore": <number between 0-100>,
  "matchPercentage": <number between 0-100>,
  "matchedKeywords": [<list of keywords found in both>],
  "missingKeywords": [<list of important keywords from job description missing in resume>],
  "recommendations": [<list of 3-5 specific recommendations>],
  "summary": "<brief summary of compatibility>"
}
`.trim();

    const modelText = await generateContentV1(prompt);

    const jsonMatch = modelText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse AI response');

    const analysis = JSON.parse(jsonMatch[0]);

    logger.info('ATS compatibility checked successfully (v1 REST)');
    return analysis;
  } catch (error) {
    logger.error('ATS check error:', error);

    // Fallback keyword-based analysis
    const resumeKeywords = extractKeywordsSimple(resumeText);
    const jobKeywords = extractKeywordsSimple(jobDescription);

    const matchedKeywords = resumeKeywords.filter((k) =>
      jobKeywords.some((jk) => jk.toLowerCase() === k.toLowerCase())
    );

    const missingKeywords = jobKeywords
      .filter(
        (k) => !resumeKeywords.some((rk) => rk.toLowerCase() === k.toLowerCase())
      )
      .slice(0, 10);

    const matchPercentage = Math.round(
      (matchedKeywords.length / Math.max(jobKeywords.length, 1)) * 100
    );

    return {
      atsScore: matchPercentage,
      matchPercentage,
      matchedKeywords: matchedKeywords.slice(0, 10),
      missingKeywords,
      recommendations: [
        'AI analysis temporarily unavailable',
        'Consider adding missing keywords from job description',
        'Ensure resume formatting is ATS-friendly',
      ],
      summary:
        'Basic keyword matching performed. AI analysis temporarily unavailable.',
    };
  }
};

/**
 * Simple keyword extraction fallback
 */
function extractKeywordsSimple(text) {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'should', 'could', 'may', 'might', 'must', 'can',
  ]);

  const words = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !commonWords.has(word));

  const frequency = {};
  for (const w of words) frequency[w] = (frequency[w] || 0) + 1;

  return Object.keys(frequency)
    .sort((a, b) => frequency[b] - frequency[a])
    .slice(0, 15);
}