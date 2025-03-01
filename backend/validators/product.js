const { body } = require('express-validator');

exports.createProductValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot be more than 100 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),

  body('price')
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price cannot be negative'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Wallets', 'Cardholders'])
    .withMessage('Invalid category'),

  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  body('stockThreshold')
    .isInt({ min: 0 })
    .withMessage('Stock threshold must be a non-negative integer'),

  body('colors')
    .notEmpty()
    .withMessage('Colors are required')
    .custom((value) => {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) && parsed.length > 0;
      } catch (err) {
        throw new Error('Invalid colors format');
      }
    }),

  body('status')
    .optional()
    .isIn(['active', 'draft', 'archived'])
    .withMessage('Invalid status')
];

exports.updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }),

  body('price')
    .optional()
    .isNumeric(),

  body('category')
    .optional()
    .trim()
    .isIn(['Wallets', 'Cardholders']),

  body('stock')
    .optional()
    .isInt({ min: 0 }),

  body('stockThreshold')
    .optional()
    .isInt({ min: 0 }),

  body('colors')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed);
        } catch (err) {
          return false;
        }
      }
      return Array.isArray(value);
    }),

  body('status')
    .optional()
    .isIn(['active', 'draft', 'archived'])
];

exports.updateStockValidation = [
  body('operation')
    .trim()
    .notEmpty()
    .withMessage('Operation is required')
    .isIn(['add', 'remove'])
    .withMessage('Invalid operation type'),

  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
];