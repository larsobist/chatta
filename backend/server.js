require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const openaiRoutes = require('./routes/openaiRoutes');
const googleRoutes = require('./routes/googleRoutes');

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());

app.use('/', userRoutes);
app.use('/', openaiRoutes);
app.use('/', googleRoutes);

app.listen(PORT, () => {
    console.log(`App listening on ${PORT}`);
});
