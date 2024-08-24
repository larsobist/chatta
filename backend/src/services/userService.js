const { getCollection } = require('../config/database');

let currentUser;
let io;
let usersCollection;
let bookingsCollection;
let roomsCollection;

const setSocket = (socketIo) => {
    io = socketIo;
};

const setCollections = async () => {
    usersCollection = getCollection('users');
    bookingsCollection = getCollection('bookings');
    roomsCollection = getCollection('rooms');
};

const getUsers = async () => {
    return await usersCollection.find().toArray();
};

const updateSelectedUser = async (user) => {
    const users = await usersCollection.find().toArray();
    if (user && users.find(u => u.id === user.id)) {
        currentUser = user;
        if (io) {
            io.emit('userChanged');
        }
        return currentUser;
    } else {
        throw new Error('Invalid user');
    }
};

const getUserBookings = async (username) => {
    return  await bookingsCollection.find({ username }).toArray();
};

const getUserPossibleRooms = async (userRoles) => {
    return await roomsCollection.find({ allowedRoles: { $in: userRoles } }).toArray();
};

const getCurrentUser = async () => {
    if (currentUser) {
        return currentUser;
    }
    return await usersCollection.findOne();
};

module.exports = { getUsers, updateSelectedUser, getUserBookings, getUserPossibleRooms, getCurrentUser, setSocket, setCollections };
