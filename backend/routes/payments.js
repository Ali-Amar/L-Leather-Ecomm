const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createPaymentIntent,
  confirmPayment,
  processCashOnDelivery,
  handleWebhook
} = require('../controllers/paymentController');

// Route to create payment intent
router.post('/create-intent', protect, createPaymentIntent);

// Route to confirm payment
router.post('/confirm', protect, confirmPayment);

// Route to process COD orders
router.post('/cod', protect, processCashOnDelivery);

// Webhook route - must be raw and unprotected
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

module.exports = router;