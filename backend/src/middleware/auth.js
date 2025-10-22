import { verifyAccessToken } from '../utils/jwtUtils.js';
import logger from '../utils/logger.js';

/**
 * Middleware to authenticate requests using JWT
 * Add this to routes that need authentication
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    // Check if header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.',
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user info to request object
    // Now all route handlers can access req.user
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    logger.debug(`User authenticated: ${decoded.email}`);

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    logger.error('Authentication error:', error.message);

    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid or expired token',
    });
  }
};

/**
 * Optional authentication
 * Doesn't fail if no token, just adds user to req if available
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
      };
    }

    next();
  } catch (error) {
    // Don't fail, just continue without user
    next();
  }
};