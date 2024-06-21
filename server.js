require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { OpenAI } = require('openai');

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
app.use(cors());

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
        let messageHistory = [{
            role: "system",
            content: "You are a helpful room booking assistant. Help the user with all necessary information questions and make calls to the database if needed. Your data is " + JSON.stringify(roomData),
        }, {
            role: "user",
            content: textInput
        }];

        const responseContent = await sendMessage(messageHistory);
        console.log(messageHistory)

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
