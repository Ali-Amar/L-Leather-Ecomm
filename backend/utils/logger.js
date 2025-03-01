// utils/logger.js
const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // Write all logs error (and below) to error.log
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// If we're not in production, log to console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Create stream for Morgan middleware
logger.stream = {
  write: (message) => logger.info(message.trim())
};

// Custom logging methods
const customLogger = {
  info: (message, meta = {}) => {
    logger.info(message, { ...meta, timestamp: new Date().toISOString() });
  },
  
  error: (message, error = null, meta = {}) => {
    logger.error(message, {
      error: error ? error.stack : null,
      ...meta,
      timestamp: new Date().toISOString()
    });
  },
  
  warn: (message, meta = {}) => {
    logger.warn(message, { ...meta, timestamp: new Date().toISOString() });
  },
  
  debug: (message, meta = {}) => {
    logger.debug(message, { ...meta, timestamp: new Date().toISOString() });
  },

  // Log API requests
  logApiRequest: (req, meta = {}) => {
    logger.info(`API Request: ${req.method} ${req.originalUrl}`, {
      ...meta,
      userId: req.user ? req.user.id : null,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString()
    });
  },

  // Log API responses
  logApiResponse: (req, res, responseTime, meta = {}) => {
    logger.info(`API Response: ${req.method} ${req.originalUrl}`, {
      ...meta,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userId: req.user ? req.user.id : null,
      timestamp: new Date().toISOString()
    });
  },

  // Log authentication events
  logAuth: (action, userId, meta = {}) => {
    logger.info(`Auth: ${action}`, {
      ...meta,
      userId,
      timestamp: new Date().toISOString()
    });
  },

  // Log order events
  logOrder: (action, orderId, userId, meta = {}) => {
    logger.info(`Order: ${action}`, {
      ...meta,
      orderId,
      userId,
      timestamp: new Date().toISOString()
    });
  },

  // Log payment events
  logPayment: (action, orderId, amount, meta = {}) => {
    logger.info(`Payment: ${action}`, {
      ...meta,
      orderId,
      amount,
      timestamp: new Date().toISOString()
    });
  },

  // Log system events
  logSystem: (action, meta = {}) => {
    logger.info(`System: ${action}`, {
      ...meta,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = customLogger;