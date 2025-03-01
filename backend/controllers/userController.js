const User = require('../models/User');
const Order = require('../models/Order');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get user profile
// @route   GET /api/v1/users/me
// @access  Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password');

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/v1/users/me
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    postalCode: req.body.postalCode
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  // Check if email is being changed and if it's already in use
  if (fieldsToUpdate.email && fieldsToUpdate.email !== req.user.email) {
    const emailExists = await User.findOne({ email: fieldsToUpdate.email });
    if (emailExists) {
      return next(new ErrorResponse('Email already in use', 400));
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update password
// @route   PUT /api/v1/users/me/password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.matchPassword(req.body.currentPassword);
  if (!isMatch) {
    return next(new ErrorResponse('Current password is incorrect', 401));
  }

  // Set new password
  user.password = req.body.newPassword;
  await user.save();

  user.password = undefined;

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user account
// @route   DELETE /api/v1/users/me
// @access  Private
exports.deleteAccount = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  // Check if user has any orders
  const orders = await Order.find({ user: req.user.id });
  if (orders.length > 0) {
    return next(
      new ErrorResponse(
        'Cannot delete account with existing orders. Please contact support.',
        400
      )
    );
  }

  await user.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get user's shipping addresses
// @route   GET /api/v1/users/me/addresses
// @access  Private
exports.getAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('addresses');

  res.status(200).json({
    success: true,
    data: user.addresses || []
  });
});

// @desc    Add shipping address
// @route   POST /api/v1/users/me/addresses
// @access  Private
exports.addAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  user.addresses = user.addresses || [];
  user.addresses.push(req.body);

  await user.save();

  res.status(200).json({
    success: true,
    data: user.addresses
  });
});

// @desc    Update shipping address
// @route   PUT /api/v1/users/me/addresses/:addressId
// @access  Private
exports.updateAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const addressIndex = user.addresses.findIndex(
    addr => addr._id.toString() === req.params.addressId
  );

  if (addressIndex === -1) {
    return next(new ErrorResponse('Address not found', 404));
  }

  user.addresses[addressIndex] = {
    ...user.addresses[addressIndex],
    ...req.body
  };

  await user.save();

  res.status(200).json({
    success: true,
    data: user.addresses
  });
});

// @desc    Delete shipping address
// @route   DELETE /api/v1/users/me/addresses/:addressId
// @access  Private
exports.deleteAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  user.addresses = user.addresses.filter(
    addr => addr._id.toString() !== req.params.addressId
  );

  await user.save();

  res.status(200).json({
    success: true,
    data: user.addresses
  });
});