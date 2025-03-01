const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { uploadToCloudinary, uploadMultipleToCloudinary, deleteFromCloudinary } = require('../services/uploadService');

// @desc    Upload single image
// @route   POST /api/v1/upload
// @access  Private/Admin
exports.uploadImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const folder = req.query.folder || 'general';
  const result = await uploadToCloudinary(req.file, {
    folder: `lardene/${folder}`
  });

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Upload multiple images
// @route   POST /api/v1/upload/multiple
// @access  Private/Admin
exports.uploadMultipleImages = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new ErrorResponse('Please upload at least one file', 400));
  }

  const folder = req.query.folder || 'general';
  const results = await uploadMultipleToCloudinary(req.files, {
    folder: `lardene/${folder}`
  });

  res.status(200).json({
    success: true,
    data: results
  });
});

// @desc    Delete image
// @route   DELETE /api/v1/upload/:publicId
// @access  Private/Admin
exports.deleteImage = asyncHandler(async (req, res, next) => {
  const result = await deleteFromCloudinary(req.params.publicId);

  if (result.result !== 'ok') {
    return next(new ErrorResponse('Error deleting image', 400));
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});