const express = require('express');
const client = require('../config/google');

const router = express.Router();

router.get('/get-token', async (req, res) => {
    try {
        const accessToken = await client.getAccessToken();
        res.json({ token: accessToken });
    } catch (error) {
        console.error('Error generating access token:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
