const express = require('express');
const {
  getDashboardStats,
  getSalesAnalytics,
  getProductAnalytics,
  getCustomerAnalytics
} = require('../controllers/analyticsController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect and authorize all routes
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/sales', getSalesAnalytics);
router.get('/products', getProductAnalytics);
router.get('/customers', getCustomerAnalytics);

module.exports = router;