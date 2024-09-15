const express = require('express');
const { getUsers, updateSelectedUser, getUserBookings, getUserPossibleRooms } = require('../controllers/userController');

const router = express.Router();

// Route to get all users.
router.get('/users', getUsers);

// Route to update the selected user.
router.post('/selectedUser', updateSelectedUser);

// Route to get current user's bookings.
router.get('/user-bookings', getUserBookings);

// Route to get possible rooms for the current user based on their role.
router.get('/user-possible-rooms', getUserPossibleRooms);

module.exports = router;
