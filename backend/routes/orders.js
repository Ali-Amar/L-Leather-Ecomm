// routes/orders.js
const express = require('express');
const {
  createOrder,
  getOrders,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder
} = require('../controllers/orderController');

const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createOrderValidation,
  updateOrderStatusValidation,
  updatePaymentStatusValidation
} = require('../validators/order');

const router = express.Router();

router.use((req, res, next) => {
  console.log('Orders Router - Request body:', req.body);
  next();
});

router
  .route('/')
  .post(protect, createOrderValidation, validate, createOrder)
  .get(protect, authorize('admin'), getOrders);

router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrder);
router.route('/:id/status').put(protect, authorize('admin'), updateOrderStatusValidation, validate, updateOrderStatus);
router.route('/:id/payment').put(protect, authorize('admin'), updatePaymentStatusValidation, validate, updatePaymentStatus);
router.route('/:id/cancel').put(protect, cancelOrder);

module.exports = router;