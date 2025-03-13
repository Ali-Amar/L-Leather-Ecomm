const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { processCashOnDelivery } = require('../controllers/paymentController');

// Route to process COD orders
router.post('/cod', protect, processCashOnDelivery);

module.exports = router;