const express = require('express');
const { getToken, dialogflowHandler } = require('../controllers/googleController');

const router = express.Router();

// Route to get a Google API token.
router.get('/get-token', getToken);

// Route to handle Dialogflow requests.
router.post('/dialogflow', dialogflowHandler);

module.exports = router;
