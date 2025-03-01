const multer = require('multer');
const ErrorResponse = require('../utils/errorResponse');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow only specific image types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new ErrorResponse('Please upload only JPEG, PNG or WebP images', 400), false);
    return;
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // Maximum 5 files
  }
});

const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ErrorResponse('File size cannot exceed 5MB', 400));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new ErrorResponse('Cannot upload more than 5 images', 400));
    }
    return next(new ErrorResponse(err.message, 400));
  }
  next(err);
};

module.exports = {
  upload,
  handleUploadErrors
};