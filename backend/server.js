require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const userRoutes = require('./src/routes/userRoutes');
const openaiRoutes = require('./src/routes/openaiRoutes');
const googleRoutes = require('./src/routes/googleRoutes');
const { connectClient } = require('./src/config/database');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",  // Adjust the origin to your requirements
        methods: ["GET", "POST"]
    }
});

app.use(express.json());
app.use(cors());

app.use('/', userRoutes);
app.use('/', openaiRoutes);
app.use('/', googleRoutes);

io.on('connection', (socket) => {
    console.log('A user connected');

    // Define your event listeners and handlers here
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Ensure DB connection is established once before starting services
const startServer = async () => {
    await connectClient(); // Ensure DB connection is established once

    // Pass the io object to the booking and user services
    const bookingService = require('./src/services/bookingService');
    bookingService.setSocket(io);
    await bookingService.setCollections();

    const userService = require('./src/services/userService');
    userService.setSocket(io);
    await userService.setCollections();

    server.listen(process.env.PORT || 8080, () => {
        console.log(`App listening on ${process.env.PORT}`);
    });
};

startServer();
