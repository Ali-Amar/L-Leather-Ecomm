const { body } = require('express-validator');

exports.createOrderValidation = [
  body('items')
    .isArray()
    .withMessage('Items must be an array')
    .notEmpty()
    .withMessage('Order must contain at least one item'),

  body('items.*.product')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  body('items.*.color')
    .notEmpty()
    .withMessage('Color is required'),

  body('shippingAddress.firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),

  body('shippingAddress.lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),

  body('shippingAddress.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),

  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),

  body('shippingAddress.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),

  body('shippingAddress.postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal code is required'),

  body('shippingAddress.phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[\d\s-]{10,}$/)
    .withMessage('Please enter a valid phone number'),

  body('shippingAddress.email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email'),

  body('paymentMethod')
    .trim()
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['cod', 'card'])
    .withMessage('Invalid payment method'),

  body('subtotal')
    .isNumeric()
    .withMessage('Subtotal must be a number')
    .isFloat({ min: 0 })
    .withMessage('Subtotal cannot be negative'),

  body('shippingFee')
    .isNumeric()
    .withMessage('Shipping fee must be a number')
    .isFloat({ min: 0 })
    .withMessage('Shipping fee cannot be negative'),

  body('total')
    .isNumeric()
    .withMessage('Total must be a number')
    .isFloat({ min: 0 })
    .withMessage('Total cannot be negative')
];

exports.updateOrderStatusValidation = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status'),

  body('trackingInfo.carrier')
    .if(body('status').equals('shipped'))
    .trim()
    .notEmpty()
    .withMessage('Carrier is required when status is shipped'),

  body('trackingInfo.trackingNumber')
    .if(body('status').equals('shipped'))
    .trim()
    .notEmpty()
    .withMessage('Tracking number is required when status is shipped')
];

exports.updatePaymentStatusValidation = [
  body('paymentStatus')
    .trim()
    .notEmpty()
    .withMessage('Payment status is required')
    .isIn(['pending', 'completed', 'failed'])
    .withMessage('Invalid payment status')
];