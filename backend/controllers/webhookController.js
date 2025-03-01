const stripe = require('../config/stripe');
const Order = require('../models/Order');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

// @desc    Handle Stripe webhook events
// @route   POST /api/v1/webhook
// @access  Public
exports.handleWebhook = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.rawBody, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.error('Webhook signature verification failed', err);
    return next(new ErrorResponse(`Webhook Error: ${err.message}`, 400));
  }

  try {
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

      case 'payment_intent.canceled':
        await handlePaymentCancellation(event.data.object);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    logger.error('Error processing webhook event', {
      error: err,
      eventType: event.type,
      eventId: event.id
    });
    return next(new ErrorResponse('Error processing webhook event', 500));
  }
});

// Handle successful payment
const handlePaymentSuccess = async (paymentIntent) => {
  const orderId = paymentIntent.metadata.orderId;
  
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ErrorResponse('Order not found', 404);
  }

  // Update order status
  order.paymentDetails = {
    paymentStatus: 'completed',
    transactionId: paymentIntent.id,
    paidAt: new Date()
  };
  order.status = 'processing';
  
  await order.save();

  // Send payment confirmation email
  try {
    await emailService.sendPaymentConfirmation(order, {
      email: paymentIntent.receipt_email || order.shippingAddress.email
    });
  } catch (err) {
    logger.error('Error sending payment confirmation email', {
      error: err,
      orderId: order._id
    });
  }

  logger.info('Payment processed successfully', {
    orderId: order._id,
    paymentIntentId: paymentIntent.id
  });
};

// Handle payment failure
const handlePaymentFailure = async (paymentIntent) => {
  const orderId = paymentIntent.metadata.orderId;
  
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ErrorResponse('Order not found', 404);
  }

  // Update order status
  order.paymentDetails = {
    paymentStatus: 'failed',
    lastError: paymentIntent.last_payment_error?.message || 'Payment failed',
    attemptedAt: new Date()
  };
  order.status = 'payment_failed';
  
  await order.save();

  // Send payment failure notification
  try {
    await emailService.sendPaymentFailureNotification(order, {
      email: order.shippingAddress.email,
      error: paymentIntent.last_payment_error?.message
    });
  } catch (err) {
    logger.error('Error sending payment failure email', {
      error: err,
      orderId: order._id
    });
  }

  logger.warn('Payment failed', {
    orderId: order._id,
    paymentIntentId: paymentIntent.id,
    error: paymentIntent.last_payment_error
  });
};

// Handle refund
const handleRefund = async (charge) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(charge.payment_intent);
  const orderId = paymentIntent.metadata.orderId;
  
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ErrorResponse('Order not found', 404);
  }

  // Update order payment details
  order.paymentDetails = {
    ...order.paymentDetails,
    refunded: true,
    refundedAt: new Date(),
    refundAmount: charge.amount_refunded / 100, // Convert from cents
    refundReason: charge.refunds.data[0]?.reason
  };
  order.status = 'refunded';
  
  await order.save();

  // Send refund confirmation email
  try {
    await emailService.sendRefundConfirmation(order, {
      email: order.shippingAddress.email,
      refundAmount: order.paymentDetails.refundAmount
    });
  } catch (err) {
    logger.error('Error sending refund confirmation email', {
      error: err,
      orderId: order._id
    });
  }

  logger.info('Refund processed', {
    orderId: order._id,
    chargeId: charge.id,
    refundAmount: charge.amount_refunded
  });
};

// Handle payment cancellation
const handlePaymentCancellation = async (paymentIntent) => {
  const orderId = paymentIntent.metadata.orderId;
  
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ErrorResponse('Order not found', 404);
  }

  // Update order status
  order.paymentDetails = {
    ...order.paymentDetails,
    paymentStatus: 'cancelled',
    cancelledAt: new Date()
  };
  order.status = 'cancelled';
  
  await order.save();

  logger.info('Payment cancelled', {
    orderId: order._id,
    paymentIntentId: paymentIntent.id
  });
};