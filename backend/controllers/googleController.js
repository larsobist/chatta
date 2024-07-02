const client = require('../config/google');

const getToken = async (req, res) => {
    try {
        const accessToken = await client.getAccessToken();
        res.json({ token: accessToken });
    } catch (error) {
        console.error('Error generating access token:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = { getToken };
