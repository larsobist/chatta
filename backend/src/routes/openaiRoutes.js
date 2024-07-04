const express = require('express');
const { handleOpenAIRequestHandler } = require('../controllers/openaiController');

const router = express.Router();

router.post('/openai', handleOpenAIRequestHandler);

module.exports = router;
