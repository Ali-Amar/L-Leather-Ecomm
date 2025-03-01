// middleware/admin.js
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

// Define admin permission levels
const ADMIN_PERMISSIONS = {
  MANAGE_PRODUCTS: 'manage_products',
  MANAGE_ORDERS: 'manage_orders',
  MANAGE_USERS: 'manage_users',
  MANAGE_CATEGORIES: 'manage_categories',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_INVENTORY: 'manage_inventory',
  MANAGE_PAYMENTS: 'manage_payments',
  MANAGE_SETTINGS: 'manage_settings'
};

// Basic admin check middleware
const admin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    logger.warn('Unauthorized admin access attempt', {
      userId: req.user ? req.user.id : null,
      attemptedRoute: req.originalUrl
    });
    return next(new ErrorResponse('Not authorized to access this route', 403));
  }

  logger.info('Admin access granted', {
    userId: req.user.id,
    accessedRoute: req.originalUrl
  });
  next();
};

// Check specific admin permissions
const checkAdminPermission = (requiredPermissions) => {
  return (req, res, next) => {
    // First check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      logger.warn('Unauthorized admin permission attempt', {
        userId: req.user ? req.user.id : null,
        requiredPermissions,
        attemptedRoute: req.originalUrl
      });
      return next(new ErrorResponse('Not authorized to access this route', 403));
    }

    // If requiredPermissions is a string, convert to array
    const permissions = Array.isArray(requiredPermissions) ? 
      requiredPermissions : [requiredPermissions];

    // Check if admin has all required permissions
    // In a real application, you would check against permissions stored in the user document
    // For now, we're granting all permissions to admins
    const hasPermissions = permissions.every(permission => {
      return ADMIN_PERMISSIONS[permission]; // In real app, check user.permissions.includes(permission)
    });

    if (!hasPermissions) {
      logger.warn('Insufficient admin permissions', {
        userId: req.user.id,
        requiredPermissions,
        attemptedRoute: req.originalUrl
      });
      return next(new ErrorResponse('Insufficient permissions', 403));
    }

    logger.info('Admin permission granted', {
      userId: req.user.id,
      permissions,
      accessedRoute: req.originalUrl
    });
    next();
  };
};

// Super admin check middleware
const superAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin' || !req.user.isSuperAdmin) {
    logger.warn('Unauthorized super admin access attempt', {
      userId: req.user ? req.user.id : null,
      attemptedRoute: req.originalUrl
    });
    return next(new ErrorResponse('Super admin privileges required', 403));
  }

  logger.info('Super admin access granted', {
    userId: req.user.id,
    accessedRoute: req.originalUrl
  });
  next();
};

// Admin activity logging middleware
const logAdminActivity = (activityType) => {
  return (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      logger.info('Admin activity', {
        userId: req.user.id,
        activityType,
        method: req.method,
        path: req.originalUrl,
        body: req.method !== 'GET' ? req.body : undefined,
        timestamp: new Date()
      });
    }
    next();
  };
};

// Validate admin session middleware
const validateAdminSession = async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ErrorResponse('Invalid admin session', 401));
  }

  // Check if admin session is still valid
  // In a real application, you might want to check against a sessions collection
  // or validate the last activity timestamp
  const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
  const lastActivity = new Date(req.user.lastActive).getTime();
  const currentTime = new Date().getTime();

  if (currentTime - lastActivity > sessionTimeout) {
    logger.warn('Admin session expired', {
      userId: req.user.id,
      lastActivity: new Date(lastActivity)
    });
    return next(new ErrorResponse('Session expired, please login again', 401));
  }

  // Update last activity
  req.user.lastActive = new Date();
  await req.user.save();

  next();
};

module.exports = {
  admin,
  checkAdminPermission,
  superAdmin,
  logAdminActivity,
  validateAdminSession,
  ADMIN_PERMISSIONS
};