import logger from '../utils/logger.js';

/**
 * Extract keywords from text (simple keyword extraction)
 * @param {string} text - Text to extract keywords from
 * @returns {Array<string>} Array of keywords
 */
export const extractKeywords = (text) => {
  if (!text) return [];

  // Common words to exclude
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who',
    'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
    'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
    'own', 'same', 'so', 'than', 'too', 'very', 'our', 'their'
  ]);

  // Extract words (2+ characters, alphanumeric)
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => 
      word.length >= 2 && 
      !stopWords.has(word) &&
      !/^\d+$/.test(word) // Exclude pure numbers
    );

  // Count frequency
  const wordFreq = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  // Get top keywords (mentioned at least twice)
  const keywords = Object.entries(wordFreq)
    .filter(([word, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30) // Top 30 keywords
    .map(([word]) => word);

  logger.debug('Keywords extracted', { count: keywords.length });

  return keywords;
};

/**
 * Calculate keyword match percentage
 * @param {Array<string>} resumeKeywords - Keywords from resume
 * @param {Array<string>} jobKeywords - Keywords from job description
 * @returns {number} Match percentage (0-100)
 */
export const calculateKeywordMatch = (resumeKeywords, jobKeywords) => {
  if (!jobKeywords || jobKeywords.length === 0) return 0;
  if (!resumeKeywords || resumeKeywords.length === 0) return 0;

  const resumeSet = new Set(resumeKeywords.map(k => k.toLowerCase()));
  const jobSet = new Set(jobKeywords.map(k => k.toLowerCase()));

  const matchedCount = [...jobSet].filter(keyword => resumeSet.has(keyword)).length;
  const matchPercentage = Math.round((matchedCount / jobSet.size) * 100);

  logger.debug('Keyword match calculated', {
    resumeKeywords: resumeKeywords.length,
    jobKeywords: jobKeywords.length,
    matched: matchedCount,
    percentage: matchPercentage,
  });

  return matchPercentage;
};

/**
 * Find missing important keywords
 * @param {Array<string>} resumeKeywords - Keywords from resume
 * @param {Array<string>} jobKeywords - Keywords from job description
 * @returns {Array<string>} Missing keywords
 */
export const findMissingKeywords = (resumeKeywords, jobKeywords) => {
  if (!jobKeywords || jobKeywords.length === 0) return [];
  if (!resumeKeywords) resumeKeywords = [];

  const resumeSet = new Set(resumeKeywords.map(k => k.toLowerCase()));
  const jobSet = new Set(jobKeywords.map(k => k.toLowerCase()));

  const missing = [...jobSet].filter(keyword => !resumeSet.has(keyword));

  logger.debug('Missing keywords identified', { count: missing.length });

  return missing.slice(0, 10); // Return top 10 missing keywords
};

/**
 * Check if resume has good ATS formatting
 * @param {string} resumeText - Resume text
 * @returns {Object} Formatting check results
 */
export const checkATSFormatting = (resumeText) => {
  const checks = {
    hasContactInfo: /email|phone|linkedin|github/i.test(resumeText),
    hasSections: /experience|education|skills|projects/i.test(resumeText),
    hasActionVerbs: /developed|managed|created|led|implemented|designed|improved/i.test(resumeText),
    hasMetrics: /\d+%|\d+ [a-z]+/i.test(resumeText),
    notTooShort: resumeText.length > 500,
    notTooLong: resumeText.length < 10000,
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.keys(checks).length;
  const formattingScore = Math.round((passedChecks / totalChecks) * 100);

  logger.debug('ATS formatting checked', {
    score: formattingScore,
    checks: checks,
  });

  return {
    score: formattingScore,
    checks: checks,
    passed: passedChecks,
    total: totalChecks,
  };
};

/**
 * Generate ATS compatibility report
 * @param {string} resumeText - Resume text
 * @param {string} jobDescription - Job description text
 * @returns {Object} ATS report
 */
export const generateATSReport = (resumeText, jobDescription) => {
  try {
    // Extract keywords
    const resumeKeywords = extractKeywords(resumeText);
    const jobKeywords = extractKeywords(jobDescription);

    // Calculate match
    const keywordMatch = calculateKeywordMatch(resumeKeywords, jobKeywords);

    // Find missing keywords
    const missingKeywords = findMissingKeywords(resumeKeywords, jobKeywords);

    // Check formatting
    const formatting = checkATSFormatting(resumeText);

    // Calculate overall ATS score (weighted)
    const atsScore = Math.round(
      keywordMatch * 0.6 + // 60% weight on keywords
      formatting.score * 0.4 // 40% weight on formatting
    );

    logger.info('ATS report generated', {
      atsScore,
      keywordMatch,
      formattingScore: formatting.score,
    });

    return {
      success: true,
      atsScore,
      keywordMatch,
      resumeKeywords: resumeKeywords.slice(0, 20), // Top 20
      jobKeywords: jobKeywords.slice(0, 20), // Top 20
      missingKeywords,
      formatting,
    };
  } catch (error) {
    logger.error('ATS report generation error:', error);
    throw new Error(`Failed to generate ATS report: ${error.message}`);
  }
};