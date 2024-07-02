const express = require('express');
const { getToken } = require('../controllers/googleController');

const router = express.Router();

router.get('/get-token', getToken);

module.exports = router;
