// middleware/validate.js
const { validationResult } = require('express-validator');
const ErrorResponse = require('../utils/errorResponse');

const validate = (validations) => {
  return async (req, res, next) => {
    console.log('Validation Start:', req.path);
    
    try {
      if (!Array.isArray(validations)) {
        validations = [validations];
      }

      console.log('Running validations');
      
      // Execute all validations first
      for (let validation of validations) {
        console.log('Running validation rule');
        await validation.run(req);
      }

      console.log('Checking validation results');
      const errors = validationResult(req);
      
      if (errors.isEmpty()) {
        console.log('Validation passed');
        return next();
      }

      console.log('Validation failed:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });

    } catch (error) {
      console.error('Validation error:', error);
      return res.status(400).json({
        success: false,
        error: 'Validation failed'
      });
    }
  };
};

module.exports = validate;