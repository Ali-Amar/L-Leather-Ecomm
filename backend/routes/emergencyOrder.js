const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Emergency direct order creation route
router.post('/', protect, (req, res) => {
  console.log('EMERGENCY ORDER ROUTE: Starting order creation');
  
  try {
    const { items, shippingAddress, paymentMethod, subtotal, shippingFee, total } = req.body;
    
    console.log('EMERGENCY ORDER: User ID:', req.user.id);
    console.log('EMERGENCY ORDER: Payment method:', paymentMethod);
    console.log('EMERGENCY ORDER: Items count:', items?.length || 0);
    
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
    
    console.log('EMERGENCY ORDER: Creating order in database');
    
    // Create the order using promises for better error handling
    Order.create(orderData)
      .then(order => {
        console.log(`EMERGENCY ORDER: Order created with ID: ${order._id}`);
        return res.status(201).json({
          success: true,
          data: order
        });
      })
      .catch(error => {
        console.error('EMERGENCY ORDER: DB Error:', error);
        return res.status(500).json({
          success: false,
          error: error.message || 'Database error'
        });
      });
      
  } catch (error) {
    console.error('EMERGENCY ORDER: Route error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

// Add these routes to routes/emergencyOrder.js

// Emergency route to get user's orders
router.get('/myorders', protect, (req, res) => {
  console.log('EMERGENCY MYORDERS ROUTE: Starting order fetch for user:', req.user.id);
  
  try {
    // Find orders directly without additional middleware
    Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .then(orders => {
        console.log(`EMERGENCY MYORDERS: Found ${orders.length} orders for user`);
        return res.status(200).json({
          success: true,
          data: orders
        });
      })
      .catch(error => {
        console.error('EMERGENCY MYORDERS: DB Error:', error);
        return res.status(500).json({
          success: false,
          error: error.message || 'Database error'
        });
      });
      
  } catch (error) {
    console.error('EMERGENCY MYORDERS: Route error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

// Emergency route to get all orders (for admin)
router.get('/', protect, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
  
  console.log('EMERGENCY ORDERS ROUTE: Starting all orders fetch');
  
  try {
    // Find all orders directly
    Order.find({})
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: 'firstName lastName email'
      })
      .then(orders => {
        console.log(`EMERGENCY ORDERS: Found ${orders.length} orders`);
        return res.status(200).json({
          success: true,
          data: orders
        });
      })
      .catch(error => {
        console.error('EMERGENCY ORDERS: DB Error:', error);
        return res.status(500).json({
          success: false,
          error: error.message || 'Database error'
        });
      });
      
  } catch (error) {
    console.error('EMERGENCY ORDERS: Route error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

module.exports = router;