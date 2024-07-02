const express = require('express');
const { getUsers, updateSelectedUser, getUserBookings } = require('../controllers/userController');

const router = express.Router();

router.get('/users', getUsers);
router.post('/selectedUser', updateSelectedUser);
router.post('/user-bookings', getUserBookings);

module.exports = router;
