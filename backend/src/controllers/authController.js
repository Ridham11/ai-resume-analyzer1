import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateAccessToken, generateRefreshToken } from '../utils/jwtUtils.js';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Register a new user
 * POST /api/auth/register
 * Body: { email, name, password }
 * No authentication required (public route)
 */
export const register = async (req, res, next) => {
  try {
    const { email, name, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Hash password (10 rounds of salt)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        hashedPassword: hashedPassword,  // ← CHANGED FROM 'password' TO 'hashedPassword'
      },
    });

    // Generate JWT tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);

    // Log successful registration
    logger.info(`New user registered: ${user.email}`, { userId: user.id });

    // Send response (don't send password!)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error); // Pass to error handler
  }
};

/**
 * Login user
 * POST /api/auth/login
 * Body: { email, password }
 * No authentication required (public route)
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // User not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);  // ← CHANGED FROM 'user.password' TO 'user.hashedPassword'

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);

    // Log successful login
    logger.info(`User logged in: ${user.email}`, { userId: user.id });

    // Send response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

/**
 * Get current logged-in user
 * GET /api/auth/me
 * Requires: JWT token in Authorization header
 * Authentication required (protected route)
 */
export const getMe = async (req, res, next) => {
  try {
    // req.user is set by authenticate middleware
    const userId = req.user.userId;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        // Don't send password!
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    logger.error('Get user error:', error);
    next(error);
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 * Note: With JWT, logout is handled on client-side by deleting token
 * This endpoint is optional, can be used for logging purposes
 */
export const logout = async (req, res) => {
  try {
    // Log the logout event
    logger.info(`User logged out: ${req.user?.email}`, { userId: req.user?.userId });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
    });
  }
};