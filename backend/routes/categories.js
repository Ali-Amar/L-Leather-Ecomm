const express = require('express');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
  updateFeaturedOrder
} = require('../controllers/categoryController');

const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createCategoryValidation,
  updateCategoryValidation,
  updateStatusValidation,
  updateFeaturedOrderValidation
} = require('../validators/category');

const router = express.Router();

router
  .route('/')
  .get(getCategories)
  .post(
    protect,
    authorize('admin'),
    createCategoryValidation,
    validate,
    createCategory
  );

router
  .route('/:id')
  .get(getCategory)
  .put(
    protect,
    authorize('admin'),
    updateCategoryValidation,
    validate,
    updateCategory
  )
  .delete(protect, authorize('admin'), deleteCategory);

router
  .route('/:id/status')
  .put(
    protect,
    authorize('admin'),
    updateStatusValidation,
    validate,
    updateCategoryStatus
  );

router
  .route('/featured-order')
  .put(
    protect,
    authorize('admin'),
    updateFeaturedOrderValidation,
    validate,
    updateFeaturedOrder
  );

module.exports = router;