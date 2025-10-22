import express from 'express';
import { register, login, getMe, logout } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public (no authentication required)
 */
router.post('/register', authLimiter, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get JWT token
 * @access  Public (no authentication required)
 */
router.post('/login', authLimiter, login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user info
 * @access  Protected (authentication required)
 */
router.get('/me', authenticate, getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (optional, mainly for logging)
 * @access  Protected (authentication required)
 */
router.post('/logout', authenticate, logout);

export default router;