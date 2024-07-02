const { connectClient, getCollection } = require('../config/database');

const getUserBookings = async (req, res) => {
    const { selectedUser: user } = req.body;
    try {
        await connectClient();
        const bookingsCollection = getCollection('bookings');
        const bookings = await bookingsCollection.find({ userName: user }).toArray();
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Other booking functions...

module.exports = { getUserBookings, /* Other functions... */ };
