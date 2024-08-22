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

const getCurrentUserID = async () => {
    const currentUser = await getCurrentUser();
    return currentUser._id;
};

const getAvailableRooms = async (query) => {
    try {
        const { roomNumber, equipment = [], date, timeSlot } = query;
        console.log(query)
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
        console.log('Filtered rooms by roles:', rooms);

        // If a room number is specified, filter by room number
        if (roomNumber) {
            rooms = rooms.filter(room => room.roomNumber === roomNumber);
            console.log(`Filtered rooms by room number ${roomNumber}:`, rooms);
        }

        // If equipment is specified, filter by equipment
        if (equipment.length > 0) {
            rooms = rooms.filter(room => {
                return equipment.every(item => (room.equipment || []).includes(item));
            });
            console.log(`Filtered rooms by equipment [${equipment.join(', ')}]:`, rooms);
        }

        // Check for room availability if date and timeSlot are provided
        if (date && timeSlot) {
            const bookedRooms = await bookingsCollection.find({ date, timeSlot }).toArray();
            rooms = rooms.filter(room =>
                !bookedRooms.some(booking => booking.roomNumber === room.roomNumber)
            );
            console.log(`Filtered rooms by availability on ${date} at ${timeSlot}:`, rooms);
        }

        return rooms;
    } catch (error) {
        console.error('Error finding rooms:', error);
        throw error;
    }
};

const findBooking = async (functionArgs) => {
    const userID = await getCurrentUserID();
    try {
        const query = { userID, ...functionArgs };
        const result = await bookingsCollection.find(query).toArray();
        console.log('findBooking result:', result);
        return result;
    } catch (error) {
        console.error('Error finding booking:', error);
        throw error;
    }
};

const createBooking = async (bookingDetails) => {
    const userID = await getCurrentUserID();
    try {
        const { roomNumber, date, timeSlot, equipment = [] } = bookingDetails;

        // Use findRooms to get all accessible and available rooms
        const availableRooms = await getAvailableRooms({ roomNumber, equipment, date, timeSlot });

        if (availableRooms.length === 0) {
            throw new Error('No available rooms match your criteria or you don’t have access to any rooms.');
        }

        // Select the first room if no specific roomNumber is provided
        const selectedRoom = availableRooms[0];

        // Create the booking with the selected room
        const finalBookingDetails = {
            userID,
            roomNumber: selectedRoom.roomNumber,
            date,
            timeSlot
        };

        const result = await bookingsCollection.insertOne(finalBookingDetails);

        if (io) {
            io.emit('bookingChanged', { action: 'created', booking: finalBookingDetails });
        }

        return result;
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
};

const updateBooking = async (query) => {
    const userID = await getCurrentUserID();
    try {
        const { new_roomNumber, new_date, new_timeSlot, ...originalQuery } = query;

        let updateFields = {};
        if (new_roomNumber) updateFields.roomNumber = new_roomNumber;
        if (new_date) updateFields.date = new_date;
        if (new_timeSlot) updateFields.timeSlot = new_timeSlot;

        if (Object.keys(updateFields).length === 0) {
            throw new Error("No valid update fields provided");
        }

        // Check if new room and timeslot are available (if provided)
        if (new_roomNumber || new_date || new_timeSlot) {
            const availableRooms = await getAvailableRooms({
                roomNumber: new_roomNumber || originalQuery.roomNumber,
                date: new_date || originalQuery.date,
                timeSlot: new_timeSlot || originalQuery.timeSlot
            });

            if (availableRooms.length === 0) {
                throw new Error('No available rooms match your criteria or you don’t have access to any rooms.');
            }
        }

        console.log('Original query:', originalQuery);
        console.log('Update fields:', updateFields);

        const result = await bookingsCollection.updateOne(
            { userID, ...originalQuery },
            { $set: updateFields }
        );

        if (io) {
            io.emit('bookingChanged', { action: 'updated', booking: { userID, ...originalQuery, ...updateFields } });
        }

        return result;
    } catch (error) {
        console.error('Error updating booking:', error);
        throw error;
    }
};

const deleteBooking = async (query) => {
    const userID = await getCurrentUserID();
    try {
        console.log(query, userID)
        const result = await bookingsCollection.deleteOne({ userID, ...query });

        if (io) {
            io.emit('bookingChanged', { action: 'deleted', booking: { userID, ...query } });
        }

        console.log(result)
        return result;
    } catch (error) {
        console.error('Error deleting booking:', error);
        throw error;
    }
};

module.exports = { findBooking, createBooking, updateBooking, deleteBooking, getAvailableRooms, setSocket, setCollections };
