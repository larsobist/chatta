const client = require('../config/google');
const { handleDialogflowRequest } = require('../services/googleService');

// Fetch and return an access token from Google.
const getToken = async (req, res) => {
    try {
        const accessToken = await client.getAccessToken();
        res.json({ token: accessToken });
    } catch (error) {
        console.error('Error generating access token:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Handle Dialogflow requests and return the response.
const dialogflowHandler = async (req, res) => {
    try {
        const response = await handleDialogflowRequest(req.body);
        res.json(response);
    } catch (error) {
        console.error('Error in dialogflowHandler:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { dialogflowHandler, getToken };
