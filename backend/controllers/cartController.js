const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const logger = require('../utils/logger');

// @desc    Get user cart
// @route   GET /api/v1/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  // Validate all items in cart
  const validationResults = await validateCartItems(cart.items);
  
  res.status(200).json({
    success: true,
    data: {
      items: cart.items || [],
      total: cart.total || 0
    },
    warnings: validationResults.warnings || [],
    invalidItems: validationResults.invalidItems || []
  });
});

// @desc    Add item to cart
// @route   POST /api/v1/cart
// @access  Private
exports.addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity, color } = req.body;

  console.log('DEBUG-CART-CONTROLLER: Received product ID:', productId);

  // Check if product exists and is active
  const product = await Product.findOne({ 
    _id: productId,
    status: 'active'
  });

  if (!product) {
    return next(new ErrorResponse('Product not found or is not available', 404));
  }

  // Validate color
  if (!product.colors.includes(color)) {
    return next(new ErrorResponse('Selected color is not available', 400));
  }

  // Check stock availability
  if (quantity > product.stock) {
    return next(
      new ErrorResponse(
        `Insufficient stock. Available: ${product.stock}`,
        400
      )
    );
  }

  // Get or create user's cart
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  // Check if item already exists in cart
  const existingItemIndex = cart.items.findIndex(
    item => item.product.toString() === productId && item.color === color
  );

  if (existingItemIndex > -1) {
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;
    if (newQuantity > product.stock) {
      return next(
        new ErrorResponse(
          `Cannot add more items. Available stock: ${product.stock}`,
          400
        )
      );
    }
    cart.items[existingItemIndex].quantity += quantity;
    
    // Update price in case it changed
    cart.items[existingItemIndex].price = product.price;
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      name: product.name,
      price: product.price,
      image: product.images[0],
      color,
      quantity,
      maxStock: product.stock // Store current stock limit
    });
  }
  console.log('Received cart request:', req.body);
  await cart.save();

  // Check cart limits
  const cartLimits = await validateCartLimits(cart);
  if (!cartLimits.valid) {
    return next(new ErrorResponse(cartLimits.message, 400));
  }

  res.status(200).json({
    success: true,
    data: {
      items: cart.items,
      total: cart.total,
      itemCount: cart.items.length
    }
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/v1/cart/:productId
// @access  Private
exports.updateCartItem = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const { productId } = req.params;
  const { color } = req.query;

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  // Find item in cart
  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId && item.color === color
  );

  if (itemIndex === -1) {
    return next(new ErrorResponse('Item not found in cart', 404));
  }

  // Check if product still exists and is active
  const product = await Product.findOne({ 
    _id: productId,
    status: 'active'
  });

  if (!product) {
    return next(new ErrorResponse('Product is no longer available', 400));
  }

  // Validate stock
  if (quantity > product.stock) {
    return next(
      new ErrorResponse(
        `Cannot update quantity. Available stock: ${product.stock}`,
        400
      )
    );
  }

  if (quantity < 1) {
    // Remove item if quantity is less than 1
    cart.items.splice(itemIndex, 1);
  } else {
    // Update quantity and price
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price; // Update price in case it changed
    cart.items[itemIndex].maxStock = product.stock; // Update stock limit
  }

  await cart.save();

  // Revalidate cart items
  const validationResults = await validateCartItems(cart.items);

  res.status(200).json({
    success: true,
    data: cart,
    warnings: validationResults.warnings,
    invalidItems: validationResults.invalidItems
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/v1/cart/:productId
// @access  Private
// cartController.js
// cartController.js
// cartController.js
exports.removeFromCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { color } = req.query;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  // The fix is in this comparison - we need to access _id from the product object
  cart.items = cart.items.filter(item => {
    const itemProductId = item.product._id || item.product;
    return !(itemProductId.toString() === productId && item.color === color);
  });

  await cart.save();

  res.status(200).json({
    success: true,
    data: cart
  });
});

// @desc    Clear cart
// @route   DELETE /api/v1/cart
// @access  Private
exports.clearCart = asyncHandler(async (req, res, next) => {
  // Get user's cart
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  cart.items = [];
  await cart.save();

  res.status(200).json({
    success: true,
    data: cart
  });
});

// Helper Functions

// Validate cart items
const validateCartItems = async (items) => {
  const warnings = [];
  const invalidItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      invalidItems.push({
        item,
        reason: 'Product no longer exists'
      });
      continue;
    }

    if (product.status !== 'active') {
      invalidItems.push({
        item,
        reason: 'Product is no longer available'
      });
      continue;
    }

    if (!product.colors.includes(item.color)) {
      invalidItems.push({
        item,
        reason: 'Selected color is no longer available'
      });
      continue;
    }

    if (item.quantity > product.stock) {
      warnings.push({
        item,
        available: product.stock,
        message: `Only ${product.stock} items available`
      });
    }

    if (product.price !== item.price) {
      warnings.push({
        item,
        newPrice: product.price,
        message: 'Price has changed'
      });
    }
  }

  return { warnings, invalidItems };
};

// Validate cart limits
const validateCartLimits = async (cart) => {
  const MAX_ITEMS = 20; // Maximum number of unique items
  const MAX_QUANTITY_PER_ITEM = 10; // Maximum quantity per item
  const MAX_TOTAL_ITEMS = 50; // Maximum total items

  // Check unique items limit
  if (cart.items.length > MAX_ITEMS) {
    return {
      valid: false,
      message: `Cart cannot contain more than ${MAX_ITEMS} unique items`
    };
  }

  // Check quantity per item limit
  const itemOverLimit = cart.items.find(item => item.quantity > MAX_QUANTITY_PER_ITEM);
  if (itemOverLimit) {
    return {
      valid: false,
      message: `Cannot add more than ${MAX_QUANTITY_PER_ITEM} units of a single item`
    };
  }

  // Check total items limit
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  if (totalItems > MAX_TOTAL_ITEMS) {
    return {
      valid: false,
      message: `Cart cannot contain more than ${MAX_TOTAL_ITEMS} total items`
    };
  }

  return { valid: true };
};