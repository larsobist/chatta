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
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware to parse JSON requests and enable CORS
app.use(express.json());
app.use(cors());

// Define routes for users, OpenAI, and Google
app.use('/', userRoutes);
app.use('/', openaiRoutes);
app.use('/', googleRoutes);

// Set up Socket.IO event listeners
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle socket disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server and connect to the database
const startServer = async () => {
    await connectClient(); // Ensure DB connection is established

    // Pass the Socket.IO instance to services and set collections
    const bookingService = require('./src/services/bookingService');
    bookingService.setSocket(io);
    await bookingService.setCollections();

    const userService = require('./src/services/userService');
    userService.setSocket(io);
    await userService.setCollections();

    server.listen(process.env.PORT || 8080, () => {
        console.log(`App listening`);
    });
};

startServer();
