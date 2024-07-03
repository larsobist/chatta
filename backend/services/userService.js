const { connectClient, getCollection } = require('../config/database');

let currentUser;
let io;

const setSocket = (socketIo) => {
    io = socketIo;
};

const getUsers = async () => {
    await connectClient();
    const usersCollection = getCollection('users');
    return await usersCollection.find().toArray();
};

const updateSelectedUser = async (user) => {
    await connectClient();
    const usersCollection = getCollection('users');
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
    await connectClient();
    const bookingsCollection = getCollection('bookings');
    return await bookingsCollection.find({ userName }).toArray();
};

const getCurrentUser = async () => {
    if (currentUser) {
        return currentUser;
    }

    await connectClient();
    const usersCollection = getCollection('users');
    return await usersCollection.findOne();
};

module.exports = { getUsers, updateSelectedUser, getUserBookings, getCurrentUser, setSocket };
