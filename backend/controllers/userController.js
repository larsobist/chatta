const { connectClient, getCollection } = require('../config/database');

// Variable zum Speichern des ausgewählten Benutzers
let currentUser;
let io;  // Declare a variable to hold the io object

const setSocket = (socketIo) => {
    io = socketIo;
};

// Funktion zum Abrufen aller Benutzer
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

// Funktion zum Aktualisieren des ausgewählten Benutzers
const updateSelectedUser = async (req, res) => {
    let user = req.body.selectedUser; // Make sure the user object is correctly extracted from the request body
    try {
        await connectClient();
        const usersCollection = getCollection('users');
        const users = await usersCollection.find().toArray();
        if (user && users.find(u => u.id === user.id)) {
            currentUser = user; // Setze die globale Variable "currentUser" direkt auf das Benutzerobjekt
            if (io) {
                io.emit('bookingChanged');
            }
            res.status(200).json({ message: 'Selected user updated successfully', user: currentUser });
        } else {
            res.status(400).json({ message: 'Invalid user' });
        }
    } catch (error) {
        console.error('Error in /selectedUser endpoint:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Funktion zum Abrufen der Buchungen des ausgewählten Benutzers
const getUserBookings = async (req, res) => {
    try {
        const currentUser = await getCurrentUser();
        const userName = currentUser.name;
        await connectClient();
        const bookingsCollection = getCollection('bookings');
        const bookings = await bookingsCollection.find({ userName: userName }).toArray();
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Funktion zum Abrufen des aktuellen Benutzernamens
const getCurrentUser = async () => {
    if (currentUser) {
        return currentUser;
    }

    try {
        await connectClient();
        const usersCollection = getCollection('users');
        return await usersCollection.findOne();
    } catch (error) {
        console.error('Error fetching first user:', error);
        throw new Error('Internal Server Error');
    }
};

// Export der Funktionen als Controller-Methoden
module.exports = { getUsers, updateSelectedUser, getUserBookings, getCurrentUser, setSocket };
