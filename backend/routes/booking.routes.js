const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');

router.post('/', bookingController.createBooking);
router.get('/user/:userId', bookingController.getUserBookings);

module.exports = router; 