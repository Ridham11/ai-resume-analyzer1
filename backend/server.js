import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import middleware
import { errorHandler } from './src/middleware/errorHandler.js';
import { apiLimiter } from './src/middleware/rateLimiter.js';
import logger from './src/utils/logger.js';

// Import routes
import authRoutes from './src/routes/authRoutes.js';
import resumeRoutes from './src/routes/resumeRoutes.js';        // ← PHASE 3 NEW
import analysisRoutes from './src/routes/analysisRoutes.js';    // ← PHASE 3 NEW

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// ========================================
// MIDDLEWARE
// ========================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Compression
app.use(compression());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// ROUTES
// ========================================

// Home route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 AI Resume Analyzer API',
    version: '1.0.0',
    status: 'Phase 3 - Resume Analysis Active',  // ← UPDATED
    endpoints: {
      health: '/health',
      testDb: '/test-db',
      // Authentication (Phase 2)
      register: '/api/auth/register',
      login: '/api/auth/login',
      me: '/api/auth/me',
      logout: '/api/auth/logout',
      // Resume Operations (Phase 3 - NEW)
      uploadResume: '/api/resume/upload',
      myResumes: '/api/resume/my-resumes',
      getResume: '/api/resume/:id',
      deleteResume: '/api/resume/:id',
      // Analysis Operations (Phase 3 - NEW)
      atsCheck: '/api/analysis/ats-check',
      analysisHistory: '/api/analysis/history/:resumeId',
      reAnalyze: '/api/analysis/re-analyze/:resumeId',
    },
  });
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      status: 'OK',
      database: 'Connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'UNHEALTHY',
      database: 'Disconnected',
      error: error.message,
    });
  }
});

// Test database (development only)
app.get('/test-db', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const resumeCount = await prisma.resume.count();
    res.json({
      success: true,
      message: 'Database connection successful',
      data: {
        users: userCount,
        resumes: resumeCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database query failed',
      error: error.message,
    });
  }
});

// Authentication routes (Phase 2)
app.use('/api/auth', authRoutes);

// Resume routes (Phase 3 - NEW)
app.use('/api/resume', resumeRoutes);

// Analysis routes (Phase 3 - NEW)
app.use('/api/analysis', analysisRoutes);

// Apply rate limiter to other API routes
app.use('/api', apiLimiter);

// ========================================
// ERROR HANDLING
// ========================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// ========================================
// SERVER START
// ========================================

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Database connected successfully');
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`☁️  Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configured' : '❌ Not configured'}`);  // ← NEW
    console.log(`🤖 Gemini AI: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);          // ← NEW
    console.log('='.repeat(60));
    console.log('\n📍 Available Endpoints:');
    console.log(`   GET  http://localhost:${PORT}/`);
    console.log(`   GET  http://localhost:${PORT}/health`);
    console.log(`   GET  http://localhost:${PORT}/test-db`);
    
    console.log('\n🔐 Authentication Endpoints (Phase 2):');
    console.log(`   POST http://localhost:${PORT}/api/auth/register`);
    console.log(`   POST http://localhost:${PORT}/api/auth/login`);
    console.log(`   GET  http://localhost:${PORT}/api/auth/me (protected)`);
    console.log(`   POST http://localhost:${PORT}/api/auth/logout (protected)`);
    
    // ← PHASE 3 NEW LOGS
    console.log('\n📄 Resume Endpoints (Phase 3):');
    console.log(`   POST   http://localhost:${PORT}/api/resume/upload (protected)`);
    console.log(`   GET    http://localhost:${PORT}/api/resume/my-resumes (protected)`);
    console.log(`   GET    http://localhost:${PORT}/api/resume/:id (protected)`);
    console.log(`   DELETE http://localhost:${PORT}/api/resume/:id (protected)`);
    
    console.log('\n🎯 Analysis Endpoints (Phase 3):');
    console.log(`   POST http://localhost:${PORT}/api/analysis/ats-check (protected)`);
    console.log(`   GET  http://localhost:${PORT}/api/analysis/history/:resumeId (protected)`);
    console.log(`   POST http://localhost:${PORT}/api/analysis/re-analyze/:resumeId (protected)`);
    
    console.log('='.repeat(60) + '\n');
    
    logger.info('Server started successfully');
  } catch (error) {
    logger.error('Failed to start server:', error);
    console.error('\n❌ Database connection failed:', error.message);
    console.error('Please check:');
    console.error('  1. PostgreSQL is running');
    console.error('  2. DATABASE_URL in .env is correct');
    console.error('  3. Database "resume_analyzer" exists\n');
    process.exit(1);
  }
});

export default app;