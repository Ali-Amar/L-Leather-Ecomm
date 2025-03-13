const Order = require('../models/Order');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const logger = require('../utils/logger');

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