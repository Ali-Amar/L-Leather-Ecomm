const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStockProducts
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { upload, handleUploadErrors } = require('../middleware/upload'); // Add this import
const {
  createProductValidation,
  updateProductValidation,
  updateStockValidation
} = require('../validators/product');

// Create router
const router = express.Router();

// Include reviews router
const reviewRouter = require('./reviews');
router.use('/:productId/reviews', reviewRouter);

// Routes
router
  .route('/')
  .get(getProducts)
  .post(
    protect,
    authorize('admin'),
    upload.array('images', 5), // Now upload is defined
    handleUploadErrors, // Add error handler
    validate(createProductValidation),
    createProduct
  );

router.route('/search').get(getProducts);

router
  .route('/lowstock')
  .get(protect, authorize('admin'), getLowStockProducts);

router
  .route('/:id')
  .get(getProduct)
  .put(
    protect,
    authorize('admin'),
    validate(updateProductValidation),
    updateProduct
  )
  .delete(protect, authorize('admin'), deleteProduct);

router
  .route('/:id/stock')
  .put(
    protect,
    authorize('admin'),
    validate(updateStockValidation),
    updateStock
  );

module.exports = router;