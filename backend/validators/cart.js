const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

exports.addToCartValidation = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .custom(value => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid product ID');
      }
      return true;
    }),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10'),

  body('color')
    .notEmpty()
    .withMessage('Color is required')
    .isString()
    .withMessage('Color must be a string')
];

exports.updateCartItemValidation = [
  param('productId')
    .custom(value => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid product ID');
      }
      return true;
    }),

  query('color')
    .notEmpty()
    .withMessage('Color is required')
    .isString()
    .withMessage('Color must be a string'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 0, max: 10 })
    .withMessage('Quantity must be between 0 and 10')
];

exports.removeFromCartValidation = [
  param('productId')
    .custom(value => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid product ID');
      }
      return true;
    }),

  query('color')
    .notEmpty()
    .withMessage('Color is required')
    .isString()
    .withMessage('Color must be a string')
];