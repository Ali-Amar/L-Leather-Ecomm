const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Product = require('../models/Product');
const uploadService = require('../services/uploadService');

exports.getProducts = asyncHandler(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;

    // Base query
    let baseQuery = {};

    // Add search condition
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      baseQuery.$or = [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } }
      ];
    }

    // Add category condition
    if (req.query.category && req.query.category !== 'all') {
      baseQuery.category = req.query.category;
    }

    // Add status condition
    if (req.query.status) {
      baseQuery.status = req.query.status;
    }

    // Get total count
    const total = await Product.countDocuments(baseQuery);

    // Get paginated products
    const products = await Product.find(baseQuery)
      .skip(startIndex)
      .limit(limit)
      .sort(req.query.sortBy || '-createdAt')
      .lean(); // Add lean() for better performance

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    console.log('DEBUG-PRODUCTS: Products fetched from DB:', products.map(p => ({
      id: p._id,
      name: p.name
    })));
    
    res.status(200).json({
      success: true,
      data: products,
      currentPage: page,
      totalPages,
      total,
      limit
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private/Admin
exports.createProduct = asyncHandler(async (req, res, next) => {
  console.log('Create product request received:', {
    body: req.body,
    filesCount: req.files?.length || 0
  });

  try {
    // Validate required fields
    if (!req.body.name || !req.body.description || !req.body.price || !req.body.category) {
      return next(new ErrorResponse('Please provide all required fields', 400));
    }

    if (!req.files || req.files.length === 0) {
      return next(new ErrorResponse('Please upload at least one image', 400));
    }

    // Parse numeric values
    const productData = {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      category: req.body.category,
      stock: parseInt(req.body.stock),
      stockThreshold: parseInt(req.body.stockThreshold),
      status: req.body.status || 'active',
      colors: JSON.parse(req.body.colors),
      createdBy: req.user.id
    };

    console.log('Processed product data:', productData);

    // Upload images
    try {
      const uploadedImages = await uploadService.uploadMultipleToCloudinary(
        req.files.map(file => file.buffer),
        { folder: 'products' }
      );
      console.log('Images uploaded successfully:', uploadedImages);

      productData.images = uploadedImages.map(img => img.url);
    } catch (uploadError) {
      console.error('Image upload error:', uploadError);
      return next(new ErrorResponse('Error uploading images', 400));
    }

    const product = await Product.create(productData);
    console.log('Product created successfully:', {
      id: product._id,
      name: product.name
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error in createProduct:', error);
    return next(new ErrorResponse(error.message || 'Error creating product', 400));
  }
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  const updateData = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    stock: req.body.stock,
    stockThreshold: req.body.stockThreshold,
    status: req.body.status,
    colors: JSON.parse(req.body.colors)
  };

  // Handle images if present
  if (req.files?.length > 0) {
    const uploadedImages = await uploadService.uploadMultipleToCloudinary(
      req.files.map(file => file.buffer),
      { folder: 'products' }
    );
    updateData.images = uploadedImages.map(img => img.url);
  } else if (req.body.existingImages) {
    updateData.images = JSON.parse(req.body.existingImages);
  }

  product = await Product.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  await Product.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Update product stock
// @route   PUT /api/v1/products/:id/stock
// @access  Private/Admin
exports.updateStock = asyncHandler(async (req, res, next) => {
  const { operation, quantity } = req.body;
  
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  if (operation === 'remove' && product.stock < quantity) {
    return next(new ErrorResponse(`Insufficient stock. Available: ${product.stock}`, 400));
  }

  product.stock += operation === 'add' ? quantity : -quantity;
  await product.save();

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Get low stock products
// @route   GET /api/v1/products/lowstock
// @access  Private/Admin
exports.getLowStockProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({
    $expr: {
      $lte: ['$stock', '$stockThreshold']
    }
  });

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});