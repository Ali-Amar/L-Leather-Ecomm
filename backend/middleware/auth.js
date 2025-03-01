// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

exports.protect = async (req, res, next) => {
  try {
    console.log('Auth Middleware - Start');
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      console.log('Auth Middleware - No token found');
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
      console.log('Auth Middleware - Verifying token');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Auth Middleware - Token decoded:', decoded);

      const user = await User.findById(decoded.id);
      if (!user) {
        console.log('Auth Middleware - No user found');
        return next(new ErrorResponse('User not found', 401));
      }

      req.user = user;
      console.log('Auth Middleware - User attached:', user._id);
      next();
    } catch (err) {
      console.error('Auth Middleware - Token verification error:', err);
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }
  } catch (err) {
    console.error('Auth Middleware - General error:', err);
    return next(new ErrorResponse('Authentication error', 500));
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};