const cloudinary = require('../config/cloudinary');
const ErrorResponse = require('../utils/errorResponse');
const DatauriParser = require('datauri/parser');
const parser = new DatauriParser();

exports.uploadToCloudinary = async (file, options = {}) => {
  try {
    // Convert buffer to DataURI
    const fileUri = parser.format(
      '.png', // default extension, cloudinary will handle actual type
      file
    ).content;
    
    // Default options
    const defaultOptions = {
      folder: 'lardene',
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    };

    // Merge options
    const uploadOptions = {
      ...defaultOptions,
      ...options
    };

    console.log('Attempting to upload to Cloudinary with options:', uploadOptions);

    const result = await cloudinary.uploader.upload(fileUri, uploadOptions);
    
    console.log('Upload successful:', {
      public_id: result.public_id,
      url: result.secure_url
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new ErrorResponse(`Error uploading file to Cloudinary: ${error.message}`, 500);
  }
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - The public ID of the file to delete
 * @returns {Promise<Object>} Cloudinary deletion response
 */
exports.deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new ErrorResponse('Error deleting file from Cloudinary', 500);
  }
};

/**
 * Upload multiple files to Cloudinary
 * @param {Array<Buffer>} files - Array of file buffers to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Array<Object>>} Array of Cloudinary upload responses
 */
exports.uploadMultipleToCloudinary = async (files, options = {}) => {
  try {
    console.log('Starting multiple file upload to Cloudinary');
    console.log('Number of files:', files.length);
    
    const uploadPromises = files.map(async (file, index) => {
      console.log(`Uploading file ${index + 1}/${files.length}`);
      try {
        const result = await this.uploadToCloudinary(file, options);
        console.log(`File ${index + 1} uploaded successfully`);
        return result;
      } catch (err) {
        console.error(`Error uploading file ${index + 1}:`, err);
        throw err;
      }
    });

    const results = await Promise.all(uploadPromises);
    console.log('All files uploaded successfully');
    return results;
  } catch (error) {
    console.error('Error in uploadMultipleToCloudinary:', error);
    throw new ErrorResponse('Error uploading files to Cloudinary', 500);
  }
};

/**
 * Create a Cloudinary image transformation URL
 * @param {string} url - Original Cloudinary URL
 * @param {Object} options - Transformation options
 * @returns {string} Transformed image URL
 */
exports.transformImage = (url, options = {}) => {
  try {
    return cloudinary.url(url, options);
  } catch (error) {
    throw new ErrorResponse('Error creating transformation URL', 500);
  }
};