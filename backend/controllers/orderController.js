const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
// In orderController.js
exports.createOrder = asyncHandler(async (req, res, next) => {
  console.log('DEBUG: Starting order creation');

  const { items, shippingAddress, paymentMethod, subtotal, shippingFee, total } = req.body;

  // 1. Validate each product/stock
  for (const item of items) {
    const productId = typeof item.product === 'object' ? item.product._id : item.product;
    console.log(`DEBUG: Checking product ${productId}`);
    
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorResponse(`Product not found: ${productId}`, 404));
    }
    
    if (product.stock < item.quantity) {
      return next(new ErrorResponse(`Insufficient stock for ${product.name}`, 400));
    }
  }

  // 2. Prepare the order items
  const orderItems = items.map(item => ({
    product: typeof item.product === 'object' ? item.product._id : item.product,
    quantity: item.quantity,
    color: item.color,
    price: item.price,
    name: item.name,
    image: item.image
  }));

  // 3. Construct the order object
  const orderData = {
    user: req.user.id,
    items: orderItems,
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

  console.log('DEBUG: Saving order to database');
  const order = await Order.create(orderData);
  console.log(`DEBUG: Order created with ID: ${order._id}`);

  // 4. Send success response to the client
  res.status(201).json({
    success: true,
    data: order
  });
});

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Private/Admin
exports.getOrders = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  let query = Order.find();

  // Filter by status
  if (req.query.status) {
    query = query.where('status').equals(req.query.status);
  }

  // Filter by payment status
  if (req.query.paymentStatus) {
    query = query.where('paymentDetails.paymentStatus').equals(req.query.paymentStatus);
  }

  // Filter by date range
  if (req.query.startDate && req.query.endDate) {
    query = query.where('createdAt').gte(req.query.startDate).lte(req.query.endDate);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Get total count for pagination
  const total = await Order.countDocuments(query);

  // Add pagination
  query = query.skip(startIndex).limit(limit);

  // Execute query
  const orders = await query.populate({
    path: 'user',
    select: 'firstName lastName email'
  });

  // Pagination result
  const pagination = {};

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  if (startIndex + limit < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: orders.length,
    pagination,
    data: orders
  });
});

// @desc    Get single order
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate({
    path: 'user',
    select: 'firstName lastName email phone'
  });

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Check if user is owner or admin
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this order', 401));
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Update order status
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Validate status transition
  const validTransitions = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'returned'],
    delivered: ['returned'],
    cancelled: [],
    returned: []
  };

  if (!validTransitions[order.status].includes(status)) {
    return next(
      new ErrorResponse(
        `Invalid status transition from ${order.status} to ${status}`,
        400
      )
    );
  }

  // Update tracking info if order is being shipped
  if (status === 'shipped') {
    if (!req.body.trackingInfo) {
      return next(new ErrorResponse('Tracking information is required for shipped orders', 400));
    }
    order.trackingInfo = req.body.trackingInfo;
  }

  // Handle inventory for cancelled/returned orders
  if (['cancelled', 'returned'].includes(status) && 
      !['cancelled', 'returned'].includes(order.status)) {
    await Promise.all(
      order.items.map(async (item) => {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      })
    );
  }

  order.status = status;
  await order.save();

  // Send status update email to customer
  try {
    await emailService.sendOrderStatusUpdate(order, await order.populate('user'));
  } catch (err) {
    logger.error('Error sending order status update email', err);
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Get my orders
// @route   GET /api/v1/orders/myorders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  let query = Order.find({ user: req.user.id });

  // Filter by status
  if (req.query.status) {
    query = query.where('status').equals(req.query.status);
  }

  // Sort
  query = query.sort('-createdAt');

  // Get total count
  const total = await Order.countDocuments({ user: req.user.id });

  // Add pagination
  query = query.skip(startIndex).limit(limit);

  const orders = await query;

  // Pagination result
  const pagination = {};

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  if (startIndex + limit < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: orders.length,
    pagination,
    data: orders
  });
});

// @desc    Update payment status
// @route   PUT /api/v1/orders/:id/payment
// @access  Private/Admin
exports.updatePaymentStatus = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  order.paymentDetails.paymentStatus = req.body.paymentStatus;
  await order.save();

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Cancel order
// @route   PUT /api/v1/orders/:id/cancel
// @access  Private
exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Check if user is owner or admin
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to cancel this order', 401));
  }

  // Check if order can be cancelled
  if (!['pending', 'processing'].includes(order.status)) {
    return next(new ErrorResponse('Order cannot be cancelled at this stage', 400));
  }

  order.status = 'cancelled';
  await order.save();

  // Restore product stock
  await Promise.all(
    order.items.map(async (item) => {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    })
  );

  // Send cancellation email
  try {
    await emailService.sendOrderCancellationEmail(order, req.user);
  } catch (err) {
    logger.error('Error sending order cancellation email', err);
  }

  res.status(200).json({
    success: true,
    data: order
  });
});