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

// Debug middleware for all requests
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    body: req.method === 'POST' ? req.body : undefined
  });
  next();
});

// Enable CORS first
app.use(cors({
  origin: ['https://www.lardeneleather.com', 'https://lardeneleather.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Prevent http param pollution
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Mount routers
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

// Error handler
app.use(errorHandler);

// Handle unhandled routes
app.use('*', (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

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