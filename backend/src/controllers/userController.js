const userService = require('../services/userService');

const getUsers = async (req, res) => {
    try {
        const users = await userService.getUsers();
        res.json(users);
    } catch (error) {
        console.error('Error in /users endpoint:', error);
        res.status(500).send('Internal Server Error');
    }
};

const updateSelectedUser = async (req, res) => {
    const user = req.body.selectedUser;
    try {
        const updatedUser = await userService.updateSelectedUser(user);
        res.status(200).json({ message: 'Selected user updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error in /selectedUser endpoint:', error);
        res.status(500).send('Internal Server Error');
    }
};

const getUserBookings = async (req, res) => {
    try {
        const currentUser = await userService.getCurrentUser();
        const bookings = await userService.getUserBookings(currentUser.name);
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).send('Internal Server Error');
    }
};

const getUserPossibleRooms = async (req, res) => {
    try {
        const currentUser = await userService.getCurrentUser();
        const rooms = await userService.getUserPossibleRooms(currentUser.role);
        res.json(rooms);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).send('Internal Server Error');
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const user = await userService.getCurrentUser();
        res.json(user);
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = { getUsers, updateSelectedUser, getUserBookings, getUserPossibleRooms, getCurrentUser };
