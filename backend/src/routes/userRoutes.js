const express = require('express');
const { getUsers, updateSelectedUser, getUserBookings, getUserPossibleRooms } = require('../controllers/userController');

const router = express.Router();

router.get('/users', getUsers);
router.post('/selectedUser', updateSelectedUser);
router.get('/user-bookings', getUserBookings);
router.get('/user-possible-rooms', getUserPossibleRooms);

module.exports = router;
