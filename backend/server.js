require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const openaiRoutes = require('./routes/openaiRoutes');
const googleAuthRoutes = require('./routes/googleRoutes');

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());

app.use('/', userRoutes);
app.use('/', bookingRoutes);
app.use('/', openaiRoutes);
app.use('/', googleAuthRoutes);

app.listen(PORT, () => {
    console.log(`App listening on ${PORT}`);
});
