require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { OpenAI } = require('openai');
const { GoogleAuth } = require('google-auth-library');

const app = express();
const PORT = 8000; // Change the port if necessary

app.use(express.json());
app.use(cors());

// MongoDB
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.nbzpr4r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connectClient() {
    if (!client.topology || !client.topology.isConnected()) {
        await client.connect();
        console.log("Connected to MongoDB");
    }
}

async function findBooking(query) {
    await connectClient();
    const database = client.db('chattaDatabase');
    const collection = database.collection('bookings');
    return await collection.find(query).toArray();
}

async function makeBooking(newBooking) {
    await connectClient();
    const database = client.db('chattaDatabase');
    const bookingsCollection = database.collection('bookings');
    return await bookingsCollection.insertOne(newBooking);
}

async function deleteBooking(query) {
    await connectClient();
    const database = client.db('chattaDatabase');
    const bookingsCollection = database.collection('bookings');
    return await bookingsCollection.deleteOne(query);
}

async function updateBooking(query, update) {
    await connectClient();
    const database = client.db('chattaDatabase');
    const bookingsCollection = database.collection('bookings');
    return await bookingsCollection.updateOne(query, { $set: update });
}

async function fetchUsers() {
    try {
        await connectClient();
        console.log('Connected to database');
        const database = client.db('chattaDatabase');
        const usersCollection = database.collection('users');
        return await usersCollection.find().toArray();
    } catch (error) {
        console.error('Database connection or query error:', error);
        throw error;  // Rethrow error to be caught in the endpoint handler
    }
}

app.get('/users', async (req, res) => {
    try {
        const users = await fetchUsers();
        res.json(users);
    } catch (error) {
        console.error('Error in /users endpoint:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Google Auth
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

app.get('/get-token', async (req, res) => {
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

// OPENAI

// In-memory message history
let messageHistory = [];

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post('/chat', async (req, res) => {
    const textInput = req.body.text;
    const userName = req.body.user; // Get the user from the request body
    const currentDate = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    console.log(userName)

    try {
        messageHistory = []; // Reset message history

        if (messageHistory.length === 0) {
            messageHistory.push({
                role: "system",
                content: `You are a helpful room booking assistant. The current date is ${currentDate}. Help the user with all necessary information questions and make calls to the database if needed.`
            });
        }

        messageHistory.push({
            role: "user",
            content: textInput
        });

        const completion = await openai.chat.completions.create({
            messages: messageHistory,
            model: "gpt-3.5-turbo",
            functions: [
                {
                    name: "findBooking",
                    parameters: {
                        type: "object",
                        properties: {
                            userName: { type: "string" },
                            timeSlot: { type: "string" },
                            date: { type: "string" }
                        },
                        required: ["userName"]
                    }
                },
                {
                    name: "makeBooking",
                    parameters: {
                        type: "object",
                        properties: {
                            userName: { type: "string" },
                            roomNumber: { type: "string" },
                            date: { type: "string" },
                            timeSlot: { type: "string" }
                        },
                        required: ["roomNumber", "date", "timeSlot"]
                    }
                },
                {
                    name: "deleteBooking",
                    parameters: {
                        type: "object",
                        properties: {
                            date: { type: "string" },
                            timeSlot: { type: "string" }
                        },
                        required: ["date", "timeSlot"]
                    }
                },
                {
                    name: "updateBooking",
                    parameters: {
                        type: "object",
                        properties: {
                            date: { type: "string" },
                            timeSlot: { type: "string" },
                            new_date: { type: "string" },
                            new_timeSlot: { type: "string" }
                        },
                        required: ["date", "timeSlot", "new_date", "new_timeSlot"]
                    }
                }
            ],
            function_call: "auto" // Let the model decide when to call a function
        });

        const responseContent = completion.choices[0].message;
        if (responseContent.function_call) {
            const { name, arguments: args } = responseContent.function_call;
            let result;
            let naturalLanguageResponse = "";

            switch (name) {
                case "findBooking":
                    result = await findBooking({ ...JSON.parse(args), userName: userName });
                    naturalLanguageResponse = result.length > 0 ?
                        `Here are the bookings found: ${result.map(booking => `Room ${booking.roomNumber} booked by ${booking.userName} on ${booking.date} at ${booking.timeSlot}`).join(", ")}.` :
                        "No bookings found.";
                    break;
                case "makeBooking":
                    const newBooking = JSON.parse(args);
                    result = await makeBooking(newBooking);
                    naturalLanguageResponse = `Your booking has been made successfully with ID: ${result.insertedId}.`;
                    break;
                case "deleteBooking":
                    const deleteQuery = { ...JSON.parse(args), userName: userName };
                    console.log(deleteQuery)
                    result = await deleteBooking(deleteQuery);
                    naturalLanguageResponse = result.deletedCount > 0 ? "The booking has been deleted successfully." : "No booking was found to delete.";
                    break;
                case "updateBooking":
                    const { date, timeSlot, new_date, new_timeSlot } = JSON.parse(args);
                    result = await updateBooking({ userName: userName, date, timeSlot }, { date: new_date, timeSlot: new_timeSlot });
                    naturalLanguageResponse = result.matchedCount > 0 ? "The booking has been updated successfully." : "No booking was found to update.";
                    break;
                default:
                    console.log("Default Case ")
            }

            messageHistory.push({
                role: "assistant",
                content: naturalLanguageResponse
            });

            res.send({ message: { content: naturalLanguageResponse } });
        } else {
            messageHistory.push({
                role: "assistant",
                content: responseContent.content
            });

            res.send({ message: { content: responseContent.content } });
        }
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(PORT, () => {
    console.log(`App listening on ${PORT}`);
});
