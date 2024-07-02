const { connectClient, getCollection } = require('../config/database');

const getUserBookings = async (userName) => {
    await connectClient();
    const bookingsCollection = getCollection('bookings');
    return await bookingsCollection.find({ userName }).toArray();
};

const findBooking = async (userName, functionArgs) => {
    await connectClient();
    const bookingsCollection = getCollection('bookings');
    const query = { userName: userName, ...functionArgs };
    const result = await bookingsCollection.find(query).toArray();
    console.log('findBooking result:', result);
    return result;
}

const createBooking = async (userName, bookingDetails) => {
    await connectClient();
    const bookingsCollection = getCollection('bookings');
    return await bookingsCollection.insertOne({ userName, ...bookingDetails });
};

const updateBooking = async (userName, query) => {
    await connectClient();

    // Dynamically build the update object
    let updateFields = {};
    if (query.new_roomNumber) updateFields.roomNumber = query.new_roomNumber;
    if (query.new_date) updateFields.date = query.new_date;
    if (query.new_timeSlot) updateFields.timeSlot = query.new_timeSlot;

    // Ensure updateFields is not empty before updating the document
    if (Object.keys(updateFields).length === 0) {
        throw new Error("No valid update fields provided");
    }

    const bookingsCollection = getCollection('bookings');
    return await bookingsCollection.updateOne(
        { userName, ...query },
        { $set: updateFields }
    );
};

const deleteBooking = async (userName, query) => {
    await connectClient();
    const bookingsCollection = getCollection('bookings');
    return await bookingsCollection.deleteOne({ userName, ...query });
};

module.exports = { getUserBookings, findBooking, createBooking, updateBooking, deleteBooking };
