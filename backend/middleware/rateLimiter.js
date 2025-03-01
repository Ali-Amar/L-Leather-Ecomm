// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const ErrorResponse = require('../utils/errorResponse');

// Create rate limiter for general API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  handler: (req, res) => {
    throw new ErrorResponse('Too many requests from this IP, please try again later', 429);
  }
});

// Stricter limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  handler: (req, res) => {
    throw new ErrorResponse('Too many authentication attempts, please try again later', 429);
  }
});

// Very strict limiter for password reset
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per windowMs
  message: 'Too many password reset attempts, please try again later',
  handler: (req, res) => {
    throw new ErrorResponse('Too many password reset attempts, please try again later', 429);
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter
};