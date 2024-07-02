const { connectClient, getCollection } = require('../config/database');

const getUsers = async () => {
    await connectClient();
    const usersCollection = getCollection('users');
    return await usersCollection.find().toArray();
};

const validateAndSetSelectedUser = async (user) => {
    await connectClient();
    const usersCollection = getCollection('users');
    const users = await usersCollection.find().toArray();
    if (user && users.find(u => u.id === user.id)) {
        return user;
    } else {
        throw new Error('Invalid user');
    }
};

module.exports = { getUsers, validateAndSetSelectedUser };
