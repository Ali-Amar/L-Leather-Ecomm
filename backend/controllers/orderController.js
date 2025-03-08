const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');
const PDFDocument = require('pdfkit');

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
  console.log('DEBUG: Starting order creation with complete logging');
  
  try {
    const { items, shippingAddress, paymentMethod, subtotal, shippingFee, total } = req.body;
    
    console.log('DEBUG: Order data received:', {
      itemsCount: items?.length,
      paymentMethod,
      subtotal,
      total
    });

    // 1. Validate and prepare order items
    const orderItems = [];
    for (const item of items) {
      const productId = typeof item.product === 'object' ? item.product._id : item.product;
      console.log(`DEBUG: Processing product ID ${productId}`);
      
      const product = await Product.findById(productId);
      if (!product) {
        console.log(`DEBUG: Product not found: ${productId}`);
        return res.status(404).json({
          success: false,
          error: `Product not found: ${productId}`
        });
      }
      
      if (product.stock < item.quantity) {
        console.log(`DEBUG: Insufficient stock for ${product.name}: ${product.stock} available, ${item.quantity} requested`);
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product.name}`
        });
      }
      
      orderItems.push({
        product: productId,
        quantity: item.quantity,
        color: item.color,
        price: item.price,
        name: item.name,
        image: item.image
      });
    }

    // 2. Create order with proper error handling
    console.log('DEBUG: Creating order in database');
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
    
    console.log('DEBUG: Order schema prepared, calling Order.create()');
    const order = await Order.create(orderData);
    console.log(`DEBUG: Order created successfully with ID: ${order._id}`);

    // 3. Explicitly return response to ensure completion
    return res.status(201).json({
      success: true,
      data: order
    });
    
  } catch (error) {
    console.error('DEBUG: Order creation error:', error);
    // Explicitly return error response
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error during order creation'
    });
  }
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
  try {
    console.log(`Updating order status: Order ID ${req.params.id}, New status: ${req.body.status}`);
    
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      console.log(`Order not found with id: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        error: `Order not found with id of ${req.params.id}`
      });
    }

    console.log(`Current order status: ${order.status}, Requested status: ${status}`);

    // MODIFIED: Relaxed transition validation for admin users
    if (req.user.role === 'admin') {
      // Allow admins to set any status
      console.log('Admin user - allowing any status transition');
    } else {
      // For non-admin users, enforce stricter rules
      const validTransitions = {
        pending: ['processing', 'cancelled'],
        processing: ['shipped', 'cancelled'],
        shipped: ['delivered', 'returned'],
        delivered: ['returned'],
        cancelled: [],
        returned: []
      };

      if (!validTransitions[order.status]?.includes(status)) {
        console.log(`Invalid status transition from ${order.status} to ${status}`);
        return res.status(400).json({
          success: false,
          error: `Invalid status transition from ${order.status} to ${status}`
        });
      }
    }

    // MODIFIED: Make tracking info optional for shipping status
    if (status === 'shipped' && req.body.trackingInfo) {
      console.log('Adding tracking info to order');
      order.trackingInfo = req.body.trackingInfo;
    }

    // Handle inventory for cancelled/returned orders
    if (['cancelled', 'returned'].includes(status) && 
        !['cancelled', 'returned'].includes(order.status)) {
      console.log('Restoring inventory for cancelled/returned order');
      await Promise.all(
        order.items.map(async (item) => {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity }
          });
        })
      );
    }

    // Update the status
    order.status = status;
    await order.save();
    console.log(`Order status updated successfully to: ${status}`);

    // Send status update email to customer (in background, don't wait)
    try {
      emailService.sendOrderStatusUpdate(order, await order.populate('user'))
        .catch(err => {
          console.error('Error sending order status update email', err);
        });
    } catch (err) {
      console.error('Error preparing email notification', err);
    }

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error updating order status'
    });
  }
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

// @desc    Generate and download order receipt
// @route   GET /api/v1/orders/:id/receipt
// @access  Private
exports.generateReceipt = asyncHandler(async (req, res, next) => {
  try {
    // Get order by ID
    const order = await Order.findById(req.params.id).populate({
      path: 'user',
      select: 'firstName lastName email phone'
    });

    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }

    // Check if user is owner or admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to access this receipt', 401));
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=order-${order._id}.pdf`);

    // Create a document and pipe it directly to the response
    const doc = new PDFDocument();
    doc.pipe(res);

    // Set up the PDF document
    doc.fontSize(25).text('L\'ardene Leather', { align: 'center' });
    doc.fontSize(15).text('Order Receipt', { align: 'center' });
    doc.moveDown();
    
    // Order details
    doc.fontSize(12).text(`Order #: ${order._id}`);
    doc.fontSize(10).text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
    doc.fontSize(10).text(`Payment Method: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}`);
    doc.fontSize(10).text(`Status: ${order.status}`);
    doc.moveDown();
    
    // Customer info
    doc.fontSize(12).text('Customer Information:');
    doc.fontSize(10).text(`Name: ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`);
    doc.fontSize(10).text(`Email: ${order.shippingAddress.email}`);
    doc.fontSize(10).text(`Phone: ${order.shippingAddress.phone}`);
    doc.moveDown();
    
    // Shipping address
    doc.fontSize(12).text('Shipping Address:');
    doc.fontSize(10).text(order.shippingAddress.address);
    doc.fontSize(10).text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`);
    doc.moveDown();
    
    // Items
    doc.fontSize(12).text('Order Items:');
    doc.moveDown(0.5);
    
    // Table header
    let y = doc.y;
    doc.fontSize(10);
    doc.text('Item', 50, y);
    doc.text('Color', 250, y);
    doc.text('Qty', 320, y);
    doc.text('Price', 370, y);
    doc.text('Total', 450, y);
    
    // Separator line
    y += 15;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 10;
    
    // Items
    order.items.forEach(item => {
      doc.fontSize(10);
      doc.text(item.name, 50, y, { width: 190 });
      doc.text(item.color, 250, y);
      doc.text(item.quantity.toString(), 320, y);
      doc.text(`$${item.price.toFixed(2)}`, 370, y);
      doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 450, y);
      y += 25;
      
      // Add a new page if we run out of space
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    });
    
    // Separator line
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 15;
    
    // Order summary
    doc.fontSize(10).text('Subtotal:', 350, y);
    doc.text(`$${order.subtotal.toFixed(2)}`, 450, y);
    y += 15;
    
    doc.fontSize(10).text('Shipping:', 350, y);
    doc.text(`$${order.shippingFee.toFixed(2)}`, 450, y);
    y += 15;
    
    doc.fontSize(12).text('Total:', 350, y);
    doc.fontSize(12).text(`$${order.total.toFixed(2)}`, 450, y);
    
    // Footer
    doc.fontSize(10).text('Thank you for shopping with L\'ardene Leather', 50, 700, { align: 'center' });

    // Finalize the PDF
    doc.end();
    
  } catch (err) {
    console.error('Error generating receipt:', err);
    return next(new ErrorResponse('Error generating receipt', 500));
  }
});