const Category = require('../models/Category');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  const filter = {};
  
  // Filter by status if provided
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Filter featured categories
  if (req.query.featured === 'true') {
    filter.featured = true;
  }

  // Get categories with product counts
  const categories = await Category.find(filter).sort('displayOrder name');

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Create new category
// @route   POST /api/v1/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);

  res.status(201).json({
    success: true,
    data: category
  });
});

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if category has products
  const productCount = await category.products;
  if (productCount > 0) {
    return next(
      new ErrorResponse(
        `Cannot delete category. It has ${productCount} products associated with it.`,
        400
      )
    );
  }

  await category.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Update category status
// @route   PUT /api/v1/categories/:id/status
// @access  Private/Admin
exports.updateCategoryStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  category = await Category.findByIdAndUpdate(
    req.params.id,
    { status },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Update featured categories order
// @route   PUT /api/v1/categories/featured-order
// @access  Private/Admin
exports.updateFeaturedOrder = asyncHandler(async (req, res, next) => {
  const { categoryOrders } = req.body;

  // categoryOrders should be an array of { id, displayOrder }
  const updatePromises = categoryOrders.map(({ id, displayOrder }) => 
    Category.findByIdAndUpdate(
      id,
      { displayOrder },
      { new: true }
    )
  );

  await Promise.all(updatePromises);

  const updatedCategories = await Category.find({
    _id: { $in: categoryOrders.map(c => c.id) }
  }).sort('displayOrder');

  res.status(200).json({
    success: true,
    data: updatedCategories
  });
});