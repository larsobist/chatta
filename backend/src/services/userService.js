const { getCollection } = require('../config/database');

let currentUser;
let io;
let usersCollection;
let bookingsCollection;
let roomsCollection;

// Set up the Socket.IO instance for real-time communication.
const setSocket = (socketIo) => {
    io = socketIo;
};

// Initialize the database collections for users, bookings, and rooms.
const setCollections = async () => {
    usersCollection = getCollection('users');
    bookingsCollection = getCollection('bookings');
    roomsCollection = getCollection('rooms');
};

// Fetch all users from the 'users' collection.
const getUsers = async () => {
    return await usersCollection.find().toArray();
};

// Update the currently selected user and notify clients via Socket.IO.
const updateSelectedUser = async (user) => {
    const users = await usersCollection.find().toArray();
    if (user && users.find(u => u.id === user.id)) {
        currentUser = user;
        if (io) {
            io.emit('userChanged'); // Notify clients of user change.
        }
        return currentUser;
    } else {
        throw new Error('Invalid user');
    }
};

// Fetch bookings for a specific username from the 'bookings' collection.
const getUserBookings = async (username) => {
    return await bookingsCollection.find({ username }).toArray();
};

// Fetch possible rooms based on the user's roles from the 'rooms' collection.
const getUserPossibleRooms = async (userRoles) => {
    return await roomsCollection.find({ allowedRoles: { $in: userRoles } }).toArray();
};

// Return the current user if set, otherwise fetch the first user from the 'users' collection.
const getCurrentUser = async () => {
    if (currentUser) {
        return currentUser;
    }
    return await usersCollection.findOne();
};

module.exports = { getUsers, updateSelectedUser, getUserBookings, getUserPossibleRooms, getCurrentUser, setSocket, setCollections };
