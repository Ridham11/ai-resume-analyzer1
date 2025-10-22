import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService.js';
import { extractAndCleanText } from '../services/textExtractor.js';
import { analyzeResume, validateIsResume } from '../services/geminiService.js'; // ✅ Added validateIsResume
import { cleanupTempFile } from '../middleware/upload.js';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Extract basic keywords from text (fallback when AI unavailable)
 */
function extractBasicKeywords(text) {
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'using', 'used', 'work', 'worked', 'working', 'experience', 'education', 'skills', 'responsibilities', 'developed', 'managed', 'created', 'designed']);
  
  const words = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s+#.]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word));
  
  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  return Object.keys(frequency)
    .sort((a, b) => frequency[b] - frequency[a])
    .slice(0, 15);
}

/**
 * Upload and analyze resume
 * POST /api/resume/upload
 * Requires: Authentication + File upload
 */
export const uploadResume = async (req, res, next) => {
  let tempFilePath = null;
  let cloudinaryPublicId = null;

  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a PDF or DOCX file.',
      });
    }

    const userId = req.user.userId; // From auth middleware
    const file = req.file;
    tempFilePath = file.path;

    logger.info('Resume upload started', {
      userId,
      fileName: file.originalname,
      fileSize: file.size,
    });

    // Step 1: Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(tempFilePath, 'resumes');
    cloudinaryPublicId = cloudinaryResult.publicId;

    logger.info('File uploaded to Cloudinary', {
      url: cloudinaryResult.url,
      publicId: cloudinaryResult.publicId,
    });

    // Step 2: Extract text from file
    const extractedText = await extractAndCleanText(tempFilePath, file.mimetype);

    if (!extractedText || extractedText.length < 50) {
      // Cleanup
      await deleteFromCloudinary(cloudinaryPublicId);
      cleanupTempFile(tempFilePath);

      return res.status(400).json({
        success: false,
        message: 'Could not extract sufficient text from the file. Please ensure the file contains readable text.',
      });
    }

    logger.info('Text extracted from resume', {
      textLength: extractedText.length,
    });

    // ✅ Step 3: NEW - Validate if it's actually a resume
    logger.info('Validating if document is a resume...');
    const validation = await validateIsResume(extractedText);

    if (!validation.isValid) {
      // Cleanup - delete from Cloudinary since it's not a valid resume
      await deleteFromCloudinary(cloudinaryPublicId);
      cleanupTempFile(tempFilePath);

      logger.warn('Document validation failed', {
        fileName: file.originalname,
        reason: validation.reason,
        confidence: validation.confidence,
      });

      return res.status(400).json({
        success: false,
        message: `This document doesn't appear to be a resume or CV. ${validation.reason}`,
        details: {
          confidence: validation.confidence,
          reason: validation.reason,
        },
      });
    }

    logger.info('Document validated as resume', {
      confidence: validation.confidence,
      reason: validation.reason,
    });

    // Step 4: Analyze with Gemini AI (with fallback)
    let analysis;
    try {
      const analysisResult = await analyzeResume(extractedText);

      // ✅ Accept both shapes:
      // 1) { success: true, data: {...} }
      // 2) {...analysis fields...}
      if (analysisResult?.success === true && analysisResult.data) {
        analysis = analysisResult.data;
      } else if (
        analysisResult &&
        typeof analysisResult === 'object' &&
        ('overallScore' in analysisResult)
      ) {
        analysis = analysisResult;
      } else {
        throw new Error('AI analysis returned unsuccessful');
      }

      // Validate analysis has required fields
      if (
        typeof analysis.overallScore !== 'number' ||
        !Array.isArray(analysis.strengths)
      ) {
        throw new Error('Invalid analysis response');
      }

      logger.info('AI analysis completed successfully');
    } catch (error) {
      logger.warn('AI analysis failed, using fallback analysis', { error: error.message });

      // Use fallback analysis (keyword-based)
      const keywords = extractBasicKeywords(extractedText);

      analysis = {
        overallScore: 70,
        strengths: [
          'Resume successfully uploaded and processed',
          'Text extracted successfully from document',
          'Standard resume structure detected'
        ],
        weaknesses: [
          'AI analysis temporarily unavailable',
          'Limited automated feedback at this time'
        ],
        suggestions: [
          'Ensure clear section headings (Experience, Education, Skills)',
          'Add quantifiable achievements with numbers and percentages',
          'Include relevant keywords for your target industry',
          'Keep formatting simple and ATS-friendly',
          'Use strong action verbs to describe responsibilities'
        ],
        keySkills: keywords.length > 0 ? keywords : ['Skills detected in resume'],
        summary: 'Resume uploaded successfully. AI analysis is temporarily unavailable, but your resume has been saved. You can view the extracted text and re-analyze it later when the AI service is restored.'
      };
    }

    // Step 5: Save to database
    const resume = await prisma.resume.create({
      data: {
        userId: userId,
        fileName: file.originalname,
        filePath: cloudinaryResult.url,
        fileType: file.mimetype,
        fileSize: file.size,
        originalText: extractedText,
        overallScore: analysis.overallScore,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        suggestions: analysis.suggestions,
        keySkills: analysis.keySkills || [],
        summary: analysis.summary || 'Resume analyzed successfully',
      },
    });

    // Step 6: Cleanup temp file
    cleanupTempFile(tempFilePath);

    logger.info('Resume uploaded and analyzed successfully', {
      resumeId: resume.id,
      userId,
      score: resume.overallScore,
      validationConfidence: validation.confidence,
    });

    // Step 7: Return response
    res.status(201).json({
      success: true,
      message: 'Resume uploaded and analyzed successfully!',
      data: {
        resume: {
          id: resume.id,
          fileName: resume.fileName,
          fileUrl: resume.filePath,
          fileSize: resume.fileSize,
          uploadedAt: resume.uploadedAt,
        },
        analysis: {
          overallScore: resume.overallScore,
          strengths: resume.strengths,
          weaknesses: resume.weaknesses,
          suggestions: resume.suggestions,
          keySkills: resume.keySkills,
          summary: resume.summary,
        },
      },
    });
  } catch (error) {
    logger.error('Resume upload error:', error);

    // Cleanup temp file if exists
    if (tempFilePath) {
      cleanupTempFile(tempFilePath);
    }

    // Cleanup cloudinary if uploaded
    if (cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(cloudinaryPublicId);
      } catch (cleanupError) {
        logger.error('Failed to cleanup Cloudinary file:', cleanupError);
      }
    }

    next(error);
  }
};

/**
 * Get all resumes for current user
 * GET /api/resume/my-resumes
 * Requires: Authentication
 */
export const getMyResumes = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        fileName: true,
        filePath: true,
        fileSize: true,
        overallScore: true,
        uploadedAt: true,
        summary: true,
      },
    });

    logger.info('Fetched user resumes', {
      userId,
      count: resumes.length,
    });

    res.status(200).json({
      success: true,
      count: resumes.length,
      data: { resumes },
    });
  } catch (error) {
    logger.error('Get resumes error:', error);
    next(error);
  }
};

/**
 * Get single resume by ID
 * GET /api/resume/:id
 * Requires: Authentication
 */
export const getResumeById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const resumeId = parseInt(req.params.id);

    if (isNaN(resumeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume ID',
      });
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: userId, // Ensure user owns this resume
      },
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    logger.info('Fetched resume details', {
      resumeId,
      userId,
    });

    res.status(200).json({
      success: true,
      data: { resume },
    });
  } catch (error) {
    logger.error('Get resume by ID error:', error);
    next(error);
  }
};

/**
 * Delete resume
 * DELETE /api/resume/:id
 * Requires: Authentication
 */
export const deleteResume = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const resumeId = parseInt(req.params.id);

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

    // Delete from Cloudinary (extract public_id from URL)
    if (resume.filePath) {
      try {
        // Extract public_id from Cloudinary URL
        // Example URL: https://res.cloudinary.com/cloud/raw/upload/v123/resumes/file_abc123.pdf
        const urlParts = resume.filePath.split('/');
        const uploadIndex = urlParts.indexOf('upload');
        
        if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
          // Get everything after 'upload/v123456/'
          const pathAfterVersion = urlParts.slice(uploadIndex + 2).join('/');
          // Remove file extension
          const publicId = pathAfterVersion.replace(/\.[^/.]+$/, '');
          
          await deleteFromCloudinary(publicId);
          logger.info('Resume deleted from Cloudinary', {
            publicId,
          });
        }
      } catch (error) {
        logger.warn('Failed to delete from Cloudinary:', error.message);
        // Continue with database deletion even if Cloudinary fails
      }
    }

    // Delete from database
    await prisma.resume.delete({
      where: { id: resumeId },
    });

    logger.info('Resume deleted successfully', {
      resumeId,
      userId,
    });

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    logger.error('Delete resume error:', error);
    next(error);
  }
};