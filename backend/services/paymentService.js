const Order = require('../models/Order');
const ErrorResponse = require('../utils/errorResponse');

class PaymentService {
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
}

module.exports = new PaymentService();