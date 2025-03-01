// services/paymentService.js
const stripe = require('../config/stripe');
const Order = require('../models/Order');
const ErrorResponse = require('../utils/errorResponse');

class PaymentService {
  /**
   * Create a Stripe payment intent
   * @param {number} amount - Amount in PKR
   * @param {Object} metadata - Additional payment metadata
   * @returns {Promise<Object>} Stripe payment intent
   */
  async createPaymentIntent(amount, metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to smallest currency unit (paisa)
        currency: 'pkr',
        metadata,
        payment_method_types: ['card'],
      });

      return paymentIntent;
    } catch (error) {
      throw new ErrorResponse(`Payment intent creation failed: ${error.message}`, 400);
    }
  }

  /**
   * Confirm and process payment
   * @param {string} paymentIntentId - Stripe payment intent ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Updated order
   */
  async confirmPayment(paymentIntentId, orderId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        throw new ErrorResponse('Payment has not been completed', 400);
      }

      // Update order status
      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: 'paid',
          paymentDetails: {
            paymentMethod: 'card',
            transactionId: paymentIntentId,
            paidAt: new Date()
          }
        },
        { new: true }
      );

      if (!order) {
        throw new ErrorResponse('Order not found', 404);
      }

      return order;
    } catch (error) {
      throw new ErrorResponse(`Payment confirmation failed: ${error.message}`, 400);
    }
  }

  /**
   * Process Cash on Delivery order
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Updated order
   */
  async processCashOnDelivery(orderId) {
    try {
      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: 'pending',
          paymentDetails: {
            paymentMethod: 'cod',
            updatedAt: new Date()
          }
        },
        { new: true }
      );

      if (!order) {
        throw new ErrorResponse('Order not found', 404);
      }

      return order;
    } catch (error) {
      throw new ErrorResponse(`COD processing failed: ${error.message}`, 400);
    }
  }

  /**
   * Handle Stripe webhook events
   * @param {Object} event - Stripe webhook event
   * @returns {Promise<void>}
   */
  async handleWebhookEvent(event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          await this.handleSuccessfulPayment(paymentIntent);
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object;
          await this.handleFailedPayment(failedPayment);
          break;

        // Add more event handlers as needed
      }
    } catch (error) {
      throw new ErrorResponse(`Webhook handling failed: ${error.message}`, 400);
    }
  }

  /**
   * Handle successful payment
   * @param {Object} paymentIntent - Stripe payment intent
   * @returns {Promise<void>}
   */
  async handleSuccessfulPayment(paymentIntent) {
    const orderId = paymentIntent.metadata.orderId;
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'paid',
      status: 'processing'
    });
  }

  /**
   * Handle failed payment
   * @param {Object} paymentIntent - Stripe payment intent
   * @returns {Promise<void>}
   */
  async handleFailedPayment(paymentIntent) {
    const orderId = paymentIntent.metadata.orderId;
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'failed',
      status: 'payment_failed'
    });
  }
}

module.exports = new PaymentService();