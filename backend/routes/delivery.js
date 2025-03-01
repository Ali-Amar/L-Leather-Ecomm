const express = require('express');
const router = express.Router();
const { CITIES, SHIPPING } = require('../utils/constants');

// @desc    Get all cities with delivery fees
// @route   GET /api/v1/delivery/cities
// @access  Public
router.get('/cities', (req, res) => {
  const citiesWithFees = CITIES.map(city => ({
    name: city,
    fee: SHIPPING.DEFAULT_SHIPPING_FEE
  }));

  res.status(200).json({
    success: true,
    data: citiesWithFees
  });
});

// @desc    Get delivery fee for a specific city
// @route   GET /api/v1/delivery/fee/:city
// @access  Public
router.get('/fee/:city', (req, res) => {
  const { city } = req.params;
  
  if (!CITIES.includes(city)) {
    return res.status(404).json({
      success: false,
      error: 'City not found'
    });
  }

  // For now, using default shipping fee for all cities
  // You can implement city-specific fees later
  const fee = SHIPPING.DEFAULT_SHIPPING_FEE;

  res.status(200).json({
    success: true,
    data: { fee }
  });
});

module.exports = router;