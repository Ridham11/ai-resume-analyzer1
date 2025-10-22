import { PrismaClient } from '@prisma/client';
import { checkATSCompatibility } from '../services/geminiService.js';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Check ATS compatibility with job description
 * POST /api/analysis/ats-check
 * Body: { resumeId, jobDescription }
 * Requires: Authentication
 */
export const checkATS = async (req, res, next) => {
  try {
    const { resumeId, jobDescription } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!resumeId || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Resume ID and job description are required',
      });
    }

    if (jobDescription.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Job description is too short. Please provide a detailed job description.',
      });
    }

    // Get resume from database
    const resume = await prisma.resume.findFirst({
      where: {
        id: parseInt(resumeId),
        userId: userId, // Ensure user owns this resume
      },
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    logger.info('Starting ATS check', { resumeId, userId });

    // Perform ATS analysis with Gemini AI (with fallback)
    let atsResult;
    try {
      atsResult = await checkATSCompatibility(resume.originalText, jobDescription);
      
      if (!atsResult || !atsResult.atsScore) {
        throw new Error('AI returned invalid result');
      }
      
      logger.info('ATS check completed with AI');
    } catch (error) {
      logger.warn('AI ATS check failed, using fallback', { error: error.message });
      
      // Fallback: Simple keyword matching
      const resumeWords = resume.originalText.toLowerCase().split(/\s+/);
      const jobWords = jobDescription.toLowerCase().split(/\s+/);
      
      // Extract meaningful keywords (longer than 3 chars)
      const resumeKeywords = [...new Set(resumeWords.filter(w => w.length > 3))];
      const jobKeywords = [...new Set(jobWords.filter(w => w.length > 3))];
      
      // Find matched and missing keywords
      const matchedKeywords = jobKeywords.filter(jk => 
        resumeKeywords.some(rk => rk.includes(jk) || jk.includes(rk))
      ).slice(0, 15);
      
      const missingKeywords = jobKeywords.filter(jk => 
        !resumeKeywords.some(rk => rk.includes(jk) || jk.includes(rk))
      ).slice(0, 10);
      
      const matchPercentage = Math.round((matchedKeywords.length / Math.max(jobKeywords.length, 1)) * 100);
      const atsScore = Math.min(matchPercentage + 10, 100); // Add 10 points for having a resume
      
      atsResult = {
        atsScore,
        matchPercentage,
        matchedKeywords,
        missingKeywords,
        recommendations: [
          'AI analysis temporarily unavailable - basic keyword matching performed',
          missingKeywords.length > 0 ? `Consider adding these keywords: ${missingKeywords.slice(0, 5).join(', ')}` : 'Good keyword coverage',
          'Ensure your resume uses exact terms from the job description',
          'Add quantifiable achievements that match job requirements',
          'Use industry-standard terminology'
        ],
        summary: `Your resume matches ${matchPercentage}% of job keywords. ${missingKeywords.length > 0 ? `Consider adding: ${missingKeywords.slice(0, 3).join(', ')}` : 'Good keyword alignment!'}`
      };
    }

    // Update resume in database with ATS results
    await prisma.resume.update({
      where: { id: parseInt(resumeId) },
      data: {
        atsScore: atsResult.atsScore,
        matchedKeywords: atsResult.matchedKeywords || [],
        missingKeywords: atsResult.missingKeywords || [],
      },
    });

    // Save to analysis history
    await prisma.analysisHistory.create({
      data: {
        resumeId: parseInt(resumeId),
        score: atsResult.atsScore,
      },
    });

    logger.info('ATS check completed successfully', {
      resumeId,
      atsScore: atsResult.atsScore,
    });

    res.status(200).json({
      success: true,
      message: 'ATS compatibility checked successfully!',
      data: {
        atsScore: atsResult.atsScore,
        matchPercentage: atsResult.matchPercentage,
        matchedKeywords: atsResult.matchedKeywords,
        missingKeywords: atsResult.missingKeywords,
        recommendations: atsResult.recommendations,
        summary: atsResult.summary,
      },
    });
  } catch (error) {
    logger.error('ATS check error:', error);
    next(error);
  }
};

/**
 * Get ATS analysis history for a resume
 * GET /api/analysis/history/:resumeId
 * Requires: Authentication
 */
export const getAnalysisHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const resumeId = parseInt(req.params.resumeId);

    if (isNaN(resumeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume ID',
      });
    }

    // Verify user owns this resume
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: userId,
      },
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    // Get analysis history
    const history = await prisma.analysisHistory.findMany({
      where: { resumeId },
      orderBy: { analyzedAt: 'desc' },
      select: {
        id: true,
        score: true,
        analyzedAt: true,
      },
    });

    logger.info('Fetched analysis history', {
      userId,
      resumeId,
      count: history.length,
    });

    res.status(200).json({
      success: true,
      count: history.length,
      data: { history },
    });
  } catch (error) {
    logger.error('Get analysis history error:', error);
    next(error);
  }
};

/**
 * Re-analyze existing resume (update scores)
 * POST /api/analysis/re-analyze/:resumeId
 * Requires: Authentication
 */
export const reAnalyzeResume = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const resumeId = parseInt(req.params.resumeId);

    if (isNaN(resumeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume ID',
      });
    }

    // Find resume
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: userId,
      },
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    logger.info('Re-analysis started', { userId, resumeId });

    // Re-analyze with Gemini (with fallback)
    const { analyzeResume } = await import('../services/geminiService.js');
    let analysis;
    
    try {
      const analysisResult = await analyzeResume(resume.originalText);

      if (analysisResult.success) {
        analysis = analysisResult.data;
      } else {
        throw new Error('AI analysis failed');
      }
    } catch (error) {
      logger.warn('Re-analysis AI failed, using fallback');
      
      // Use fallback analysis
      analysis = {
        overallScore: 70,
        strengths: [
          'Resume successfully processed',
          'Text content available',
          'Standard structure maintained'
        ],
        weaknesses: [
          'AI analysis temporarily unavailable',
          'Limited automated feedback'
        ],
        suggestions: [
          'Ensure clear section headings',
          'Add quantifiable achievements',
          'Include relevant keywords',
          'Keep formatting simple'
        ],
        keySkills: resume.keySkills || [],
        summary: 'Resume re-analysis completed with basic metrics.'
      };
    }

    // Update resume with new analysis
    const updatedResume = await prisma.resume.update({
      where: { id: resumeId },
      data: {
        overallScore: analysis.overallScore,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        suggestions: analysis.suggestions,
        keySkills: analysis.keySkills || [],
        summary: analysis.summary || '',
      },
    });

    logger.info('Re-analysis completed', {
      userId,
      resumeId,
      newScore: updatedResume.overallScore,
    });

    res.status(200).json({
      success: true,
      message: 'Resume re-analyzed successfully',
      data: {
        analysis: {
          overallScore: updatedResume.overallScore,
          strengths: updatedResume.strengths,
          weaknesses: updatedResume.weaknesses,
          suggestions: updatedResume.suggestions,
          keySkills: updatedResume.keySkills,
          summary: updatedResume.summary,
        },
      },
    });
  } catch (error) {
    logger.error('Re-analyze error:', error);
    next(error);
  }
};