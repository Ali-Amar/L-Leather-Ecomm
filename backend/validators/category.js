const { body } = require('express-validator');

exports.createCategoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot be more than 50 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),

  body('image')
    .notEmpty()
    .withMessage('Image is required'),

  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Invalid status'),

  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean value'),

  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer')
];

exports.updateCategoryValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Name cannot be more than 50 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),

  body('image')
    .optional()
    .notEmpty()
    .withMessage('Image cannot be empty if provided'),

  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Invalid status'),

  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean value'),

  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer')
];

exports.updateStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['active', 'inactive'])
    .withMessage('Invalid status')
];

exports.updateFeaturedOrderValidation = [
  body('categoryOrders')
    .isArray()
    .withMessage('Category orders must be an array')
    .notEmpty()
    .withMessage('Category orders cannot be empty'),

  body('categoryOrders.*.id')
    .notEmpty()
    .withMessage('Category ID is required')
    .isMongoId()
    .withMessage('Invalid category ID'),

  body('categoryOrders.*.displayOrder')
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer')
];