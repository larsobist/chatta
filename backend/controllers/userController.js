const { connectClient, getCollection } = require('../config/database');

const getUsers = async (req, res) => {
    try {
        await connectClient();
        const usersCollection = getCollection('users');
        const users = await usersCollection.find().toArray();
        res.json(users);
    } catch (error) {
        console.error('Error in /users endpoint:', error);
        res.status(500).send('Internal Server Error');
    }
};

const updateSelectedUser = async (req, res) => {
    let user = req.body;
    let selectedUser;  // Declare selectedUser in the function scope
    try {
        await connectClient();
        const usersCollection = getCollection('users');
        const users = await usersCollection.find().toArray();
        if (user && users.find(u => u.id === user.id)) {
            selectedUser = user;
            res.status(200).json({ message: 'Selected user updated successfully', user: selectedUser });
        } else {
            res.status(400).json({ message: 'Invalid user' });
        }
    } catch (error) {
        console.error('Error in /selectedUser endpoint:', error);
        res.status(500).send('Internal Server Error');
    }
};

const getUserBookings = async (req, res) => {
    const { selectedUser: user } = req.body;
    try {
        await connectClient();
        const bookingsCollection = getCollection('bookings');
        const bookings = await bookingsCollection.find({ userName: user }).toArray();
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = { getUsers, updateSelectedUser, getUserBookings };
