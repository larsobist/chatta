const { handleOpenAIRequest } = require('../services/openaiService');

// Handle incoming requests to process text with OpenAI.
const handleOpenAIRequestHandler = async (req, res) => {
    const textInput = req.body.text;
    const language = req.body.language;

    try {
        const response = await handleOpenAIRequest(textInput, language);
        res.json({ message: response });
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = { handleOpenAIRequestHandler };
