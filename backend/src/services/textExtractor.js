import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import fs from 'fs';
import logger from '../utils/logger.js';

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<string>} Extracted text
 */
export const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    logger.info('Text extracted from PDF', {
      pages: data.numpages,
      textLength: data.text.length,
    });

    return data.text;
  } catch (error) {
    logger.error('PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

/**
 * Extract text from DOCX file
 * @param {string} filePath - Path to DOCX file
 * @returns {Promise<string>} Extracted text
 */
export const extractTextFromDOCX = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });

    logger.info('Text extracted from DOCX', {
      textLength: result.value.length,
    });

    return result.value;
  } catch (error) {
    logger.error('DOCX extraction error:', error);
    throw new Error(`Failed to extract text from DOCX: ${error.message}`);
  }
};

/**
 * Extract text based on file type
 * @param {string} filePath - Path to file
 * @param {string} fileType - MIME type or extension
 * @returns {Promise<string>} Extracted text
 */
export const extractText = async (filePath, fileType) => {
  try {
    // Normalize file type
    const normalizedType = fileType.toLowerCase();

    if (
      normalizedType.includes('pdf') ||
      normalizedType === '.pdf'
    ) {
      return await extractTextFromPDF(filePath);
    } else if (
      normalizedType.includes('wordprocessingml') ||
      normalizedType === '.docx' ||
      normalizedType.includes('docx')
    ) {
      return await extractTextFromDOCX(filePath);
    } else {
      throw new Error('Unsupported file type. Only PDF and DOCX are supported.');
    }
  } catch (error) {
    logger.error('Text extraction error:', error);
    throw error;
  }
};

/**
 * Clean extracted text (remove extra whitespace, etc.)
 * @param {string} text - Raw extracted text
 * @returns {string} Cleaned text
 */
export const cleanText = (text) => {
  if (!text) return '';

  return text
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Remove multiple newlines (keep max 2)
    .replace(/\n{3,}/g, '\n\n')
    // Trim whitespace
    .trim();
};

/**
 * Extract and clean text from file
 * @param {string} filePath - Path to file
 * @param {string} fileType - File type
 * @returns {Promise<string>} Cleaned extracted text
 */
export const extractAndCleanText = async (filePath, fileType) => {
  const rawText = await extractText(filePath, fileType);
  const cleanedText = cleanText(rawText);

  logger.info('Text extracted and cleaned', {
    originalLength: rawText.length,
    cleanedLength: cleanedText.length,
  });

  return cleanedText;
};