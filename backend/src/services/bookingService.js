const { getCollection } = require('../config/database');
const { getCurrentUser } = require('./userService');

let io;
let bookingsCollection;

const setSocket = (socketIo) => {
    io = socketIo;
};

const setCollections = async () => {
    bookingsCollection = getCollection('bookings');
};

const getCurrentUsername = async () => {
    const currentUser = await getCurrentUser();
    return currentUser.name;
};

const findRooms = async (roomNumber = null, equipment = []) => {
    try {
        const currentUser = await getCurrentUser();
        let userRoles = currentUser.role;

        // Ensure userRoles is an array, to handle multiple roles
        if (!Array.isArray(userRoles)) { userRoles = [userRoles]; }

        const roomsCollection = getCollection('rooms');
        let rooms = await roomsCollection.find().toArray();

        // Filter rooms where any of the user's roles are in the allowedRoles array
        rooms = rooms.filter(room => {
            return userRoles.some(role => room.allowedRoles.includes(role));
        });
        console.log('Filtered rooms by roles:', rooms); // Debugging log to confirm filtered rooms

        // If a room number is specified, filter by room number
        if (!roomNumber == null) {
            rooms = rooms.filter(room => room.roomNumber === roomNumber);
            console.log(`Filtered rooms by room number ${roomNumber}:`, rooms);
        }

        // If equipment is specified, filter by equipment
        if (equipment.length > 0) {
            rooms = rooms.filter(room => {
                return equipment.every(item => room.equipment.includes(item));
            });
            console.log(`Filtered rooms by equipment [${equipment.join(', ')}]:`, rooms);
        }

        return rooms;
    } catch (error) {
        console.error('Error finding rooms:', error);
        throw error;
    }
};

const findBooking = async (functionArgs) => {
    const userName = await getCurrentUsername();
    try {
        const query = { userName, ...functionArgs };
        const result = await bookingsCollection.find(query).toArray();
        console.log('findBooking result:', result);
        return result;
    } catch (error) {
        console.error('Error finding booking:', error);
        throw error;
    }
};

const createBooking = async (bookingDetails) => {
    const userName = await getCurrentUsername();
    try {
        const result = await bookingsCollection.insertOne({ userName, ...bookingDetails });

        if (io) {
            io.emit('bookingChanged', { action: 'created', booking: { userName, ...bookingDetails } });
        }

        return result;
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
};

const updateBooking = async (query) => {
    const userName = await getCurrentUsername();
    try {
        const { new_roomNumber, new_date, new_timeSlot, ...originalQuery } = query;

        let updateFields = {};
        if (new_roomNumber) updateFields.roomNumber = new_roomNumber;
        if (new_date) updateFields.date = new_date;
        if (new_timeSlot) updateFields.timeSlot = new_timeSlot;

        if (Object.keys(updateFields).length === 0) {
            throw new Error("No valid update fields provided");
        }

        console.log('Original query:', originalQuery);
        console.log('Update fields:', updateFields);

        const result = await bookingsCollection.updateOne(
            { userName, ...originalQuery },
            { $set: updateFields }
        );

        if (io) {
            io.emit('bookingChanged', { action: 'updated', booking: { userName, ...originalQuery, ...updateFields } });
        }

        return result;
    } catch (error) {
        console.error('Error updating booking:', error);
        throw error;
    }
};

const deleteBooking = async (query) => {
    const userName = await getCurrentUsername();
    try {
        const result = await bookingsCollection.deleteOne({ userName, ...query });

        if (io) {
            io.emit('bookingChanged', { action: 'deleted', booking: { userName, ...query } });
        }

        return result;
    } catch (error) {
        console.error('Error deleting booking:', error);
        throw error;
    }
};

module.exports = { findBooking, createBooking, updateBooking, deleteBooking, findRooms, setSocket, setCollections };
