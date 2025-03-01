// routes/shipping.js
const express = require('express');
const router = express.Router();
const { validateShipping } = require('../controllers/shippingController');

router.post('/validate', validateShipping);

module.exports = router;