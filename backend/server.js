const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const auth = require('./routes/auth');
const users = require('./routes/users');
const products = require('./routes/products');
const orders = require('./routes/orders');
const emergencyOrder = require('./routes/emergencyOrder');
const cart = require('./routes/cart');
const categories = require('./routes/categories');
const upload = require('./routes/upload');
const reviews = require('./routes/reviews');
const payments = require('./routes/payments');
const analytics = require('./routes/analytics');
const delivery = require('./routes/delivery');
const shipping = require('./routes/shipping');
const multer = require('multer');
const uplead = multer();

const app = express();

// Define production vs development environment
const isProduction = process.env.NODE_ENV === 'production';
const clientUrl = process.env.CLIENT_URL || 'https://lardeneleather.com';

// Enhanced request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  
  // For debugging headers in auth-related routes
  if (req.originalUrl.includes('/auth') || req.originalUrl.includes('/users')) {
    console.log('Headers:', {
      authorization: req.headers.authorization ? 'Bearer token present' : 'No token',
      'content-type': req.headers['content-type'],
      origin: req.headers.origin,
      cookie: req.headers.cookie ? 'Cookie present' : 'No cookie'
    });
  }
  
  // Log body for POST/PUT requests (with sensitive data omitted)
  if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
    const sanitizedBody = { ...req.body };
    
    // Remove sensitive fields for logging
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';
    if (sanitizedBody.creditCard) sanitizedBody.creditCard = '[REDACTED]';
    
    console.log('Request body:', sanitizedBody);
  }
  
  // Capture response data for error debugging
  const originalSend = res.send;
  res.send = function(data) {
    if (res.statusCode >= 400) {
      console.log(`[ERROR] Response ${res.statusCode} for ${req.method} ${req.originalUrl}:`, 
        typeof data === 'string' ? data.substring(0, 200) : '[complex data]');
    }
    return originalSend.apply(res, arguments);
  };
  
  next();
});

// Enable CORS - with proper production configuration
app.use(cors({
  origin: isProduction 
    ? [
        'https://lardeneleather.com', 
        'https://www.lardeneleather.com',
        'https://api.lardeneleather.com'
      ] 
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Security middleware
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(hpp());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 10 minutes'
  }
});
app.use('/api/v1', limiter);

// Root route for API health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "L'Ardene Leather API is running",
    version: '1.0',
    environment: process.env.NODE_ENV,
    endpoints: '/api/v1'
  });
});

// Root path for the API version
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    success: true,
    message: "L'Ardene Leather API v1",
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

// Mount routers with consistent /api/v1 prefix
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/products', products);
app.use('/api/v1/orders', orders);
app.use('/api/v1/emergency-order', emergencyOrder);
app.use('/api/v1/cart', cart);
app.use('/api/v1/categories', categories);
app.use('/api/v1/upload', upload);
app.use('/api/v1/reviews', reviews);
app.use('/api/v1/payments', payments);
app.use('/api/v1/analytics', analytics);
app.use('/api/v1/delivery', delivery);
app.use('/api/v1/shipping', shipping);

// Handle unhandled routes - must be before error handler
app.use('*', (req, res) => {
  console.log(`Route not found: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  logger.error('Unhandled Rejection', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`.red);
  logger.error('Uncaught Exception', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = server; // Export for testing