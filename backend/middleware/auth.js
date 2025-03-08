// Enhanced middleware/auth.js with better debug logging
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

exports.protect = async (req, res, next) => {
  try {
    console.log(`Auth Middleware - Request to: ${req.method} ${req.originalUrl}`);
    console.log('Auth Middleware - Headers:', JSON.stringify({
      authorization: req.headers.authorization ? 'Bearer [token]' : 'Not provided',
      cookie: req.headers.cookie ? 'Exists' : 'Not provided'
    }));

    let token;

    // Extract token from authorization header
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Auth Middleware - Token from Authorization header');
    } 
    // Extract token from cookies
    else if (req.cookies.token) {
      token = req.cookies.token;
      console.log('Auth Middleware - Token from Cookies');
    }

    if (!token) {
      console.log('Auth Middleware - No token found');
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
      console.log('Auth Middleware - Verifying token');
      // Decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(`Auth Middleware - Token decoded, user ID: ${decoded.id}`);

      // Find the user
      const user = await User.findById(decoded.id);
      if (!user) {
        console.log('Auth Middleware - User not found after token verification');
        return next(new ErrorResponse('User not found', 401));
      }

      // Attach user to request
      req.user = user;
      console.log(`Auth Middleware - User attached: ID ${user._id}, Role: ${user.role}`);
      
      // Proceed to next middleware
      next();
    } catch (err) {
      console.error('Auth Middleware - Token verification error:', err);
      
      // More helpful error messages based on the error type
      if (err.name === 'JsonWebTokenError') {
        return next(new ErrorResponse('Invalid token', 401));
      } else if (err.name === 'TokenExpiredError') {
        return next(new ErrorResponse('Token expired', 401));
      }
      
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
    console.log(`Authorization check - User role: ${req.user.role}, Required roles: ${roles.join(',')}`);
    
    if (!roles.includes(req.user.role)) {
      console.log(`Authorization failed - ${req.user.role} not in [${roles.join(',')}]`);
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    
    console.log('Authorization successful');
    next();
  };
};