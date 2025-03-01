const { body } = require('express-validator');

exports.reviewValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot be more than 100 characters'),

  body('text')
    .trim()
    .notEmpty()
    .withMessage('Review text is required')
    .isLength({ max: 500 })
    .withMessage('Review text cannot be more than 500 characters'),

  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
];

exports.updateReviewValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot be more than 100 characters'),

  body('text')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Review text cannot be more than 500 characters'),

  body('rating')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
];