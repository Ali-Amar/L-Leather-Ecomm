// controllers/shippingController.js
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { PAKISTAN_REGIONS, SHIPPING } = require('../utils/constants');
const logger = require('../utils/logger');

// @desc    Validate shipping information
// @route   POST /api/v1/shipping/validate
// @access  Public
exports.validateShipping = asyncHandler(async (req, res, next) => {
  // Log incoming request
  logger.info('Shipping validation request:', { body: req.body });

  const { 
    firstName, 
    lastName, 
    email, 
    phone, 
    address, 
    city, 
    state, 
    postalCode 
  } = req.body;

  // Log parsed fields
  logger.info('Parsed shipping fields:', {
    firstName, lastName, email, phone, address, city, state, postalCode
  });

  // Check each field individually and collect missing fields
  const missingFields = [];
  if (!firstName) missingFields.push('firstName');
  if (!lastName) missingFields.push('lastName');
  if (!email) missingFields.push('email');
  if (!phone) missingFields.push('phone');
  if (!address) missingFields.push('address');
  if (!city) missingFields.push('city');
  if (!state) missingFields.push('state');
  if (!postalCode) missingFields.push('postalCode');

  if (missingFields.length > 0) {
    logger.warn('Missing required fields:', { missingFields });
    return res.status(400).json({
      success: false,
      error: 'Please provide all required fields',
      missingFields
    });
  }

  // Validate email format
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid email address'
    });
  }

  // Validate phone number
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid phone number'
    });
  }

  // Validate postal code
  const postalCodeRegex = /^\d{5}$/;
  if (!postalCodeRegex.test(postalCode)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid 5-digit postal code'
    });
  }

  // Validate state
  if (!PAKISTAN_REGIONS[state]) {
    return res.status(400).json({
      success: false,
      error: 'Invalid state selected'
    });
  }

  // Validate city
  if (!PAKISTAN_REGIONS[state].includes(city)) {
    return res.status(400).json({
      success: false,
      error: `${city} is not a valid city in ${state}`
    });
  }

  // Calculate shipping details
  const shippingDetails = {
    fee: calculateShippingFee(city),
    estimatedDeliveryDays: getEstimatedDeliveryDays(city),
    services: getAvailableServices(city),
    restrictions: getShippingRestrictions(city)
  };

  // Log successful validation
  logger.info('Shipping validation successful:', {
    city,
    state,
    shippingDetails
  });

  res.status(200).json({
    success: true,
    data: {
      validation: { isValid: true },
      shippingDetails
    }
  });
});

// Helper function to calculate shipping fee
const calculateShippingFee = (city) => {
  const baseFee = SHIPPING.DEFAULT_SHIPPING_FEE;
  const remoteCities = ['Quetta', 'Gwadar'];
  return remoteCities.includes(city) ? baseFee * 1.5 : baseFee;
};

// Helper function to get estimated delivery days
const getEstimatedDeliveryDays = (city) => {
  const deliveryEstimates = {
    'Karachi': '2-3',
    'Lahore': '2-3',
    'Islamabad': '3-4',
    default: '4-5'
  };
  return deliveryEstimates[city] || deliveryEstimates.default;
};

// Helper function to get available shipping services
const getAvailableServices = (city) => {
  const services = ['Standard Delivery'];
  const majorCities = ['Karachi', 'Lahore', 'Islamabad'];
  if (majorCities.includes(city)) {
    services.push('Express Delivery');
  }
  return services;
};

// Helper function to get shipping restrictions
const getShippingRestrictions = (city) => {
  const restrictions = [];
  const remoteAreas = ['Quetta', 'Gwadar'];
  if (remoteAreas.includes(city)) {
    restrictions.push('Delivery may take longer due to remote location');
  }
  return restrictions;
};