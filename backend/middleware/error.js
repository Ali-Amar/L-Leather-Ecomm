// middleware/error.js
const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  console.error('Error Handler Called:', {
    name: err.name,
    code: err.code,
    message: err.message,
    stack: err.stack
  });

  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  // Handle uncaught promises
  if (err.name === 'UnhandledPromiseRejectionWarning') {
    error = new ErrorResponse('Server Error - Unhandled Promise', 500);
  }

  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  console.log('Sending error response:', { statusCode, response });
  res.status(statusCode).json(response);
};

module.exports = errorHandler;