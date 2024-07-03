const { connectClient, getCollection } = require('../config/database');
const { getCurrentUser } = require('./userService');

let io;  // Declare a variable to hold the io object

const setSocket = (socketIo) => {
    io = socketIo;
};

const connectAndGetCollection = async (collectionName) => {
    await connectClient();
    return getCollection(collectionName);
};

const getCurrentUsername = async () => {
    const currentUser = await getCurrentUser();
    return currentUser.name;
};

const findBooking = async (functionArgs) => {
    const userName = await getCurrentUsername();
    try {
        const bookingsCollection = await connectAndGetCollection('bookings');
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
        const bookingsCollection = await connectAndGetCollection('bookings');
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
        const bookingsCollection = await connectAndGetCollection('bookings');

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
        const bookingsCollection = await connectAndGetCollection('bookings');
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

module.exports = { findBooking, createBooking, updateBooking, deleteBooking, setSocket };
