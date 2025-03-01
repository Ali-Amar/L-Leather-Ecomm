const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

const { protect } = require('../middleware/auth');
const router = express.Router();

// Debug middleware to check auth
router.use((req, res, next) => {
  console.log('Cart middleware check - User:', req.user ? req.user._id : 'No user');
  next();
});

// Apply protect middleware to all routes
router.use(protect);

// Another check after protect middleware
router.use((req, res, next) => {
  console.log('After protect middleware - User:', req.user ? req.user._id : 'No user');
  next();
});

router.get('/', (req, res, next) => {
  res.set('Cache-Control', 'no-store'); // Prevent 304 responses
  next();
});

router
  .route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router
  .route('/:productId')
  .put(updateCartItem)
  .delete(removeFromCart);

module.exports = router;