const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/seller.controller');

router.post('/register', sellerController.registerSeller);
router.get('/:id', sellerController.getSellerDetails);

module.exports = router; 