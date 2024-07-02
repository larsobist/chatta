const { handleOpenAIRequest } = require('../services/openaiService');

const handleOpenAIRequestHandler = async (req, res) => {
    const textInput = req.body.text;
    const user = req.body.selectedUser;

    try {
        const response = await handleOpenAIRequest(textInput, user);
        res.json({ message: response });
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = { handleOpenAIRequestHandler };
