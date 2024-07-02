const { connectClient, getCollection } = require('../config/database');
const { getCurrentUser } = require('../controllers/userController'); // Pfad anpassen

const connectAndGetCollection = async (collectionName) => {
    await connectClient();
    return getCollection(collectionName);
};

const getCurrentUsername = async () => {
    const currentUser = await getCurrentUser();
    return currentUser.name;
};

const getUserBookings = async () => {
    const userName = await getCurrentUsername();
    try {
        const bookingsCollection = await connectAndGetCollection('bookings');
        return await bookingsCollection.find({ userName }).toArray();
    } catch (error) {
        console.error('Error getting user bookings:', error);
        throw error;
    }
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
        return await bookingsCollection.insertOne({ userName, ...bookingDetails });
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
};

const updateBooking = async (query) => {
    const userName = await getCurrentUsername();
    try {
        const bookingsCollection = await connectAndGetCollection('bookings');

        // Extract old values from the query object
        const { new_roomNumber, new_date, new_timeSlot, ...originalQuery } = query;

        // Dynamically build the update object
        let updateFields = {};
        if (new_roomNumber) updateFields.roomNumber = new_roomNumber;
        if (new_date) updateFields.date = new_date;
        if (new_timeSlot) updateFields.timeSlot = new_timeSlot;

        // Ensure updateFields is not empty before updating the document
        if (Object.keys(updateFields).length === 0) {
            throw new Error("No valid update fields provided");
        }

        console.log('Original query:', originalQuery);
        console.log('Update fields:', updateFields);

        return await bookingsCollection.updateOne(
            { userName, ...originalQuery },
            { $set: updateFields }
        );
    } catch (error) {
        console.error('Error updating booking:', error);
        throw error;
    }
};

const deleteBooking = async (query) => {
    const userName = await getCurrentUsername();
    try {
        const bookingsCollection = await connectAndGetCollection('bookings');
        return await bookingsCollection.deleteOne({ userName, ...query });
    } catch (error) {
        console.error('Error deleting booking:', error);
        throw error;
    }
};

module.exports = { getUserBookings, findBooking, createBooking, updateBooking, deleteBooking };
