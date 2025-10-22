import express from 'express';
import {
  uploadResume,
  getMyResumes,
  getResumeById,
  deleteResume,
} from '../controllers/resumeController.js';
import { authenticate } from '../middleware/auth.js';
import { upload, handleUploadError } from '../middleware/upload.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * @route   POST /api/resume/upload
 * @desc    Upload and analyze resume
 * @access  Protected (authentication required)
 */
router.post(
  '/upload',
  authenticate,
  uploadLimiter,
  upload.single('resume'), // 'resume' is the field name
  handleUploadError,
  uploadResume
);

/**
 * @route   GET /api/resume/my-resumes
 * @desc    Get all resumes for current user
 * @access  Protected (authentication required)
 */
router.get('/my-resumes', authenticate, getMyResumes);

/**
 * @route   GET /api/resume/:id
 * @desc    Get single resume by ID
 * @access  Protected (authentication required)
 */
router.get('/:id', authenticate, getResumeById);

/**
 * @route   DELETE /api/resume/:id
 * @desc    Delete resume
 * @access  Protected (authentication required)
 */
router.delete('/:id', authenticate, deleteResume);

export default router;