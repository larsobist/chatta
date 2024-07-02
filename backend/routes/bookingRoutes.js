const express = require('express');
const { getUserBookings } = require('../controllers/bookingController');

const router = express.Router();

router.post('/user-bookings', getUserBookings);

module.exports = router;
