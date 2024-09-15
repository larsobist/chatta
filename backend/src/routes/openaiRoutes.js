const express = require('express');
const { handleOpenAIRequestHandler } = require('../controllers/openaiController');

const router = express.Router();

// Route to handle OpenAI requests.
router.post('/openai', handleOpenAIRequestHandler);

module.exports = router;
