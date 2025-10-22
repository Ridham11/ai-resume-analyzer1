import express from 'express';
import {
  checkATS,
  getAnalysisHistory,
  reAnalyzeResume,
} from '../controllers/analysisController.js';
import { authenticate } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * @route   POST /api/analysis/ats-check
 * @desc    Check ATS compatibility with job description
 * @access  Protected (authentication required)
 * @body    { resumeId: number, jobDescription: string }
 */
router.post('/ats-check', authenticate, apiLimiter, checkATS);

/**
 * @route   GET /api/analysis/history/:resumeId
 * @desc    Get ATS analysis history for a resume
 * @access  Protected (authentication required)
 */
router.get('/history/:resumeId', authenticate, getAnalysisHistory);

/**
 * @route   POST /api/analysis/re-analyze/:resumeId
 * @desc    Re-analyze existing resume
 * @access  Protected (authentication required)
 */
router.post('/re-analyze/:resumeId', authenticate, apiLimiter, reAnalyzeResume);

export default router;