const { OpenAI } = require('openai');

// Initialize OpenAI client with API key from environment variables.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

module.exports = openai;
