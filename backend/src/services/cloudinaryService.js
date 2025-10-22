import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Local file path
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Object>} Upload result with URL and public_id
 */
export const uploadToCloudinary = async (filePath, folder = 'resumes') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'raw', // For non-image files (PDF, DOCX)
      folder: folder,
      use_filename: true,
      unique_filename: true,
    });

    logger.info('File uploaded to Cloudinary', {
      public_id: result.public_id,
      url: result.secure_url,
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    logger.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload file to Cloudinary: ${error.message}`);
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public_id
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw',
    });

    logger.info('File deleted from Cloudinary', { public_id: publicId });

    return {
      success: true,
      result: result.result, // 'ok' if successful
    };
  } catch (error) {
    logger.error('Cloudinary deletion error:', error);
    throw new Error(`Failed to delete file from Cloudinary: ${error.message}`);
  }
};

/**
 * Get file URL from Cloudinary
 * @param {string} publicId - Cloudinary public_id
 * @returns {string} Secure URL
 */
export const getCloudinaryUrl = (publicId) => {
  return cloudinary.url(publicId, {
    resource_type: 'raw',
    secure: true,
  });
};

export default cloudinary;