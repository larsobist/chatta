const express = require('express');
const { getToken, dialogflowHandler } = require('../controllers/googleController');

const router = express.Router();

router.get('/get-token', getToken);
router.post('/dialogflow', dialogflowHandler);

module.exports = router;
