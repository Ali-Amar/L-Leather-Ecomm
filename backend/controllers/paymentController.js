const stripe = require('../config/stripe');
const Order = require('../models/Order');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const logger = require('../utils/logger');

// @desc    Create payment intent
// @route   POST /api/v1/payments/create-intent
// @access  Private
exports.createPaymentIntent = asyncHandler(async (req, res, next) => {
  const { amount } = req.body;

  if (!amount) {
    return next(new ErrorResponse('Please provide an amount', 400));
  }

  try {
    // Create payment intent with proper error handling
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to smallest currency unit
      currency: 'pkr',
      payment_method_types: ['card'],
      metadata: {
        userId: req.user.id
      }
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe payment intent creation failed:', error);
    return next(new ErrorResponse(error.message || 'Payment processing failed', 500));
  }
});

// @desc    Confirm payment
// @route   POST /api/v1/payments/confirm
// @access  Private
exports.confirmPayment = asyncHandler(async (req, res, next) => {
  const { paymentIntentId, orderId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (!paymentIntent) {
      return next(new ErrorResponse('Payment not found', 404));
    }

    if (paymentIntent.metadata.userId !== req.user.id) {
      return next(new ErrorResponse('Not authorized to confirm this payment', 401));
    }

    // Update order with payment details if orderId is provided
    if (orderId) {
      const order = await Order.findById(orderId);
      
      if (!order) {
        return next(new ErrorResponse('Order not found', 404));
      }

      order.payment = {
        method: 'card',
        status: paymentIntent.status,
        paymentIntentId: paymentIntent.id,
        cardLast4: paymentIntent.charges.data[0]?.payment_method_details?.card?.last4
      };

      await order.save();
    }

    res.status(200).json({
      success: true,
      paymentIntent
    });
  } catch (error) {
    logger.error('Payment confirmation failed:', error);
    return next(new ErrorResponse('Payment confirmation failed', 500));
  }
});

// @desc    Process Cash on Delivery order
// @route   POST /api/v1/payments/cod
// @access  Private
exports.processCashOnDelivery = asyncHandler(async (req, res, next) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Update order with COD payment details
  order.payment = {
    method: 'cod',
    status: 'pending'
  };

  await order.save();

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Handle Stripe webhook events
// @route   POST /api/v1/payments/webhook
// @access  Public
exports.handleWebhook = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.error('Webhook signature verification failed:', err);
    return res.status(400).json({ success: false, error: err.message });
  }

  // Handle different event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
      
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
      
    case 'charge.refunded':
      await handleRefund(event.data.object);
      break;

    default:
      logger.info(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ success: true });
});

// Helper function to handle successful payment
const handlePaymentSuccess = async (paymentIntent) => {
  try {
    const order = await Order.findOne({
      'payment.paymentIntentId': paymentIntent.id
    });

    if (order) {
      order.payment.status = 'paid';
      order.status = 'processing';
      await order.save();

      // You might want to send confirmation email here
      logger.info(`Payment successful for order ${order._id}`);
    }
  } catch (error) {
    logger.error('Error handling payment success:', error);
  }
};

// Helper function to handle failed payment
const handlePaymentFailure = async (paymentIntent) => {
  try {
    const order = await Order.findOne({
      'payment.paymentIntentId': paymentIntent.id
    });

    if (order) {
      order.payment.status = 'failed';
      order.status = 'payment_failed';
      await order.save();

      // You might want to send failure notification email here
      logger.error(`Payment failed for order ${order._id}`);
    }
  } catch (error) {
    logger.error('Error handling payment failure:', error);
  }
};

// Helper function to handle refund
const handleRefund = async (charge) => {
  try {
    const order = await Order.findOne({
      'payment.paymentIntentId': charge.payment_intent
    });

    if (order) {
      order.payment.status = 'refunded';
      order.status = 'refunded';
      order.payment.refundedAt = new Date();
      await order.save();

      // You might want to send refund confirmation email here
      logger.info(`Refund processed for order ${order._id}`);
    }
  } catch (error) {
    logger.error('Error handling refund:', error);
  }
};