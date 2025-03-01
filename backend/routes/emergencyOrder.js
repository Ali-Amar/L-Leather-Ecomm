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

module.exports = router;