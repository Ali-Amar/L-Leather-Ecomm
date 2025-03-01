const DatauriParser = require('datauri/parser');
const path = require('path');
const parser = new DatauriParser();

/**
 * Convert Buffer to Data URI
 * @param {Object} file - File object from multer
 * @returns {string} Data URI string
 */
exports.dataUri = (file) => {
  return parser.format(
    path.extname(file.originalname).toString(),
    file.buffer
  ).content;
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
exports.formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Get file extension from mime type
 * @param {string} mimeType - File mime type
 * @returns {string} File extension
 */
exports.getExtensionFromMime = (mimeType) => {
  const extensions = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
  };

  return extensions[mimeType] || '';
};

/**
 * Validate file type
 * @param {string} mimeType - File mime type
 * @returns {boolean} Is valid image type
 */
exports.isValidImageType = (mimeType) => {
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  return validTypes.includes(mimeType);
};