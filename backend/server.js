require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const userRoutes = require('./routes/userRoutes');
const openaiRoutes = require('./routes/openaiRoutes');
const googleRoutes = require('./routes/googleRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",  // Adjust the origin to your requirements
        methods: ["GET", "POST"]
    }
});
const PORT = 8080;

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

server.listen(PORT, () => {
    console.log(`App listening on ${PORT}`);
});

// Pass the io object to the booking service
const bookingService = require('./services/bookingService');
bookingService.setSocket(io);
const userService = require('./services/userService');
userService.setSocket(io);
