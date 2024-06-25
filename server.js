require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { OpenAI } = require('openai');
const { GoogleAuth } = require('google-auth-library');

const SERVICE_ACCOUNT_KEY = {
    type: process.env.GOOGLE_TYPE,
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: process.env.GOOGLE_AUTH_URI,
    token_uri: process.env.GOOGLE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN,
};

const app = express();
const PORT = 8000; // Change the port if necessary

// MongoDB Connection
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.nbzpr4r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// In-memory message history
let messageHistory = [];

// Google Auth
app.get('/get-token', async (req, res) => {
    console.log('Received request for /get-token');
    try {
        const client = new GoogleAuth({
            credentials: SERVICE_ACCOUNT_KEY,
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });

        const accessToken = await client.getAccessToken();
        res.json({ token: accessToken });
    } catch (error) {
        console.error('Error generating access token:', error);
        res.status(500).send('Internal Server Error');
    }
});

async function fetchRoomData() {
    await client.connect();
    const database = client.db('chattaDatabase');
    const collection = database.collection('rooms');
    const documents = await collection.find({}).toArray();
    await client.close();
    return documents;
}

async function sendMessage(message) {
    const completion = await openai.chat.completions.create({
        messages: message,
        model: "gpt-3.5-turbo",
    });

    return completion.choices[0].message.content;
}

app.post('/chat', async (req, res) => {
    const textInput = req.body.text;
    console.log(textInput);

    try {
        const roomData = await fetchRoomData();

        if (messageHistory.length === 0) {
            messageHistory.push({
                role: "system",
                content: "You are a helpful room booking assistant. Help the user with all necessary information questions and make calls to the database if needed. Your data is " + JSON.stringify(roomData),
            });
        }

        messageHistory.push({
            role: "user",
            content: textInput
        });

        const responseContent = await sendMessage(messageHistory);
        messageHistory.push({
            role: "assistant",
            content: responseContent
        });

        res.send({ message: { content: responseContent } });
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
    console.log("Chatbot: Connecting to MongoDB...");
    fetchRoomData().then(roomData => {
        console.log("Chatbot: Data loaded. Ready to assist with room bookings.");
    }).catch(console.dir);
});
