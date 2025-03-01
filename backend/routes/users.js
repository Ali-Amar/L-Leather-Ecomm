const express = require('express');
const {
  getProfile,
  updateProfile,
  updatePassword,
  deleteAccount,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
} = require('../controllers/userController');

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  updateProfileValidation,
  updatePasswordValidation,
  addressValidation
} = require('../validators/user');

const router = express.Router();

// Protect all routes
router.use(protect);

// Profile routes
router
  .route('/me')
  .get(getProfile)
  .put(updateProfileValidation, validate, updateProfile)
  .delete(deleteAccount);

// Password update route
router
  .route('/me/password')
  .put(updatePasswordValidation, validate, updatePassword);

// Address routes
router
  .route('/me/addresses')
  .get(getAddresses)
  .post(addressValidation, validate, addAddress);

router
  .route('/me/addresses/:addressId')
  .put(addressValidation, validate, updateAddress)
  .delete(deleteAddress);

module.exports = router;