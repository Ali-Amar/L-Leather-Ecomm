const { body } = require('express-validator');

exports.updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s-]{10,}$/)
    .withMessage('Please enter a valid phone number'),

  body('address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Address cannot be empty if provided'),

  body('city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City cannot be empty if provided'),

  body('state')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('State cannot be empty if provided'),

  body('postalCode')
    .optional()
    .trim()
    .matches(/^\d{5}$/)
    .withMessage('Please enter a valid 5-digit postal code')
];

exports.updatePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
];

exports.addressValidation = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),

  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),

  body('address')
    .notEmpty()
    .withMessage('Address is required')
    .trim(),

  body('city')
    .notEmpty()
    .withMessage('City is required')
    .trim(),

  body('state')
    .notEmpty()
    .withMessage('State is required')
    .trim(),

  body('postalCode')
    .notEmpty()
    .withMessage('Postal code is required')
    .trim()
    .matches(/^\d{5}$/)
    .withMessage('Please enter a valid 5-digit postal code'),

  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim()
    .matches(/^\+?[\d\s-]{10,}$/)
    .withMessage('Please enter a valid phone number'),

  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean value')
];