const express = require('express');
const {
  uploadImage,
  uploadMultipleImages,
  deleteImage
} = require('../controllers/uploadController');

const { protect, authorize } = require('../middleware/auth');
const { upload, handleUploadErrors } = require('../middleware/upload');

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .post(
    upload.single('image'),
    handleUploadErrors,
    uploadImage
  );

router.route('/multiple')
  .post(
    upload.array('images', 10),
    handleUploadErrors,
    uploadMultipleImages
  );

router.route('/:publicId')
  .delete(deleteImage);

module.exports = router;