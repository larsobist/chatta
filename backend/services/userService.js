const { getCollection } = require('../config/database');

let currentUser;
let io;
let usersCollection;
let bookingsCollection;

const setSocket = (socketIo) => {
    io = socketIo;
};

const setCollections = async () => {
    usersCollection = getCollection('users');
    bookingsCollection = getCollection('bookings');
};

const getUsers = async () => {
    return await usersCollection.find().toArray();
};

const updateSelectedUser = async (user) => {
    const users = await usersCollection.find().toArray();
    if (user && users.find(u => u.id === user.id)) {
        currentUser = user;
        if (io) {
            io.emit('bookingChanged');
        }
        return currentUser;
    } else {
        throw new Error('Invalid user');
    }
};

const getUserBookings = async (userName) => {
    return await bookingsCollection.find({ userName }).toArray();
};

const getCurrentUser = async () => {
    if (currentUser) {
        return currentUser;
    }
    return await usersCollection.findOne();
};

module.exports = { getUsers, updateSelectedUser, getUserBookings, getCurrentUser, setSocket, setCollections };
