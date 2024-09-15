const { getCollection } = require('../config/database');
const { getCurrentUser } = require('./userService');

let io;
let bookingsCollection;

// Set the Socket.IO instance for real-time updates.
const setSocket = (socketIo) => {
    io = socketIo;
};

// Initialize the bookings collection from the database.
const setCollections = async () => {
    bookingsCollection = getCollection('bookings');
};

// Retrieve the current user's username.
const getCurrentUsername = async () => {
    const currentUser = await getCurrentUser();
    return currentUser.name;
};

// Get available rooms based on the user's roles and provided query parameters.
const getAvailableRooms = async (query) => {
    try {
        const { roomNumber, equipment = [], date, timeSlot } = query;
        const currentUser = await getCurrentUser();
        let userRoles = currentUser.role;

        // Ensure userRoles is an array to handle multiple roles.
        if (!Array.isArray(userRoles)) userRoles = [userRoles];

        const roomsCollection = getCollection('rooms');
        let rooms = await roomsCollection.find().toArray();

        // Filter rooms based on user's allowed roles.
        rooms = rooms.filter(room => {
            return userRoles.some(role => room.allowedRoles.includes(role));
        });

        // If a room number is specified, filter by room number.
        if (roomNumber) rooms = rooms.filter(room => room.roomNumber === roomNumber);

        // Filter rooms based on the required equipment.
        if (equipment.length > 0) {
            rooms = rooms.filter(room => {
                return equipment.every(item => (room.equipment || []).includes(item));
            });
        }

        // Check room availability based on date and time slot.
        if (date && timeSlot) {
            const bookedRooms = await bookingsCollection.find({ date, timeSlot }).toArray();
            rooms = rooms.filter(room =>
                !bookedRooms.some(booking => booking.roomNumber === room.roomNumber)
            );
        }

        return rooms;
    } catch (error) {
        console.error('Error finding rooms:', error);
        throw error;
    }
};

// Find bookings for the current user based on query parameters.
const findBooking = async (functionArgs) => {
    const username = await getCurrentUsername();
    try {
        const query = { username, ...functionArgs };
        const result = await bookingsCollection.find(query).toArray();
        return result;
    } catch (error) {
        console.error('Error finding booking:', error);
        throw error;
    }
};

// Create a booking for the current user with the provided details.
const createBooking = async (bookingDetails) => {
    const username = await getCurrentUsername();
    try {
        const { roomNumber, date, timeSlot, equipment = [] } = bookingDetails;
        // Use findRooms to get all accessible and available rooms
        const availableRooms = await getAvailableRooms({ roomNumber, equipment, date, timeSlot });

        if (availableRooms.length === 0) throw new Error('No available rooms match your criteria or you don’t have access to any rooms.');

        // Select the first room if no specific roomNumber is provided
        const selectedRoom = availableRooms[0];

        // Create the booking with the selected room
        const finalBookingDetails = { username, roomNumber: selectedRoom.roomNumber, date, timeSlot };

        const result = await bookingsCollection.insertOne(finalBookingDetails);

        if (io) io.emit('bookingChanged', { action: 'created', booking: finalBookingDetails });

        return result;
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
};

// Update an existing booking for the current user.
const updateBooking = async (query) => {
    const username = await getCurrentUsername();
    try {
        const { new_roomNumber, new_date, new_timeSlot, ...originalQuery } = query;

        let updateFields = {};
        if (new_roomNumber) updateFields.roomNumber = new_roomNumber;
        if (new_date) updateFields.date = new_date;
        if (new_timeSlot) updateFields.timeSlot = new_timeSlot;

        if (Object.keys(updateFields).length === 0) throw new Error("No valid update fields provided");

        // Check if the new room and timeslot are available.
        if (new_roomNumber || new_date || new_timeSlot) {
            const availableRooms = await getAvailableRooms({
                roomNumber: new_roomNumber || originalQuery.roomNumber,
                date: new_date || originalQuery.date,
                timeSlot: new_timeSlot || originalQuery.timeSlot
            });

            if (!availableRooms.length) throw new Error('No available rooms match your criteria or you don’t have access to any rooms.');
        }

        const result = await bookingsCollection.updateOne(
            { username, ...originalQuery },
            { $set: updateFields }
        );

        if (io) io.emit('bookingChanged', { action: 'updated', booking: { username, ...originalQuery, ...updateFields } });

        return result;
    } catch (error) {
        console.error('Error updating booking:', error);
        throw error;
    }
};

// Delete a booking for the current user based on query parameters.
const deleteBooking = async (query) => {
    const username = await getCurrentUsername();
    try {
        const result = await bookingsCollection.deleteOne({ username, ...query });
        if (io) io.emit('bookingChanged', { action: 'deleted', booking: { username, ...query } });
        return result;
    } catch (error) {
        console.error('Error deleting booking:', error);
        throw error;
    }
};

module.exports = { findBooking, createBooking, updateBooking, deleteBooking, getAvailableRooms, setSocket, setCollections };
