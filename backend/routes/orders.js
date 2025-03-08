// routes/orders.js
const express = require('express');
const {
  createOrder,
  getOrders,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  generateReceipt
} = require('../controllers/orderController');

const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createOrderValidation,
  updateOrderStatusValidation,
  updatePaymentStatusValidation
} = require('../validators/order');

const router = express.Router();

// Direct route with minimal middleware
router.post('/direct', protect, (req, res) => {
  console.log('DIRECT ORDER ROUTE: Starting order creation');
  
  try {
    const { items, shippingAddress, paymentMethod, subtotal, shippingFee, total } = req.body;
    
    // Create an order directly
    const orderData = {
      user: req.user.id,
      items: items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        color: item.color,
        price: item.price,
        name: item.name,
        image: item.image
      })),
      shippingAddress,
      paymentMethod,
      paymentDetails: {
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed'
      },
      subtotal,
      shippingFee,
      total,
      status: 'pending'
    };
    
    console.log('DIRECT ORDER ROUTE: Creating order in database');
    
    // Create the order directly in the route handler
    Order.create(orderData)
      .then(order => {
        console.log(`DIRECT ORDER ROUTE: Order created with ID: ${order._id}`);
        res.status(201).json({
          success: true,
          data: order
        });
      })
      .catch(error => {
        console.error('DIRECT ORDER ROUTE: Order creation error:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      });
      
  } catch (error) {
    console.error('DIRECT ORDER ROUTE: Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

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
router.route('/:id/receipt').get(protect, generateReceipt);

module.exports = router;