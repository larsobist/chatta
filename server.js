require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { OpenAI } = require('openai');
const { GoogleAuth } = require('google-auth-library');
const { v4: uuidv4 } = require('uuid');

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

async function findBooking(query) {
    await client.connect();
    const database = client.db('chattaDatabase');
    const collection = database.collection('bookings');
    const bookings = await collection.find(query).toArray();
    await client.close();
    return bookings;
}

async function makeBooking(newBooking) {
    await client.connect();
    const database = client.db('chattaDatabase');
    const bookingsCollection = database.collection('bookings');
    const result = await bookingsCollection.insertOne(newBooking);
    await client.close();
    return result.insertedId;
}

async function deleteBooking(query) {
    await client.connect();
    const database = client.db('chattaDatabase');
    const bookingsCollection = database.collection('bookings');
    const result = await bookingsCollection.deleteOne(query);
    await client.close();
    return result.deletedCount;
}

async function updateBooking(query, update) {
    await client.connect();
    const database = client.db('chattaDatabase');
    const bookingsCollection = database.collection('bookings');
    const result = await bookingsCollection.updateOne(query, { $set: update });
    await client.close();
    return result.modifiedCount;
}


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
    const currentDate = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD

    try {
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
                            userId: { type: "string" },
                            timeSlot: { type: "string" },
                            date: { type: "string" }
                        },
                        required: ["userId"]
                    }
                },
                {
                    name: "makeBooking",
                    parameters: {
                        type: "object",
                        properties: {
                            roomNumber: { type: "string" },
                            userId: { type: "string" },
                            date: { type: "string" },
                            timeSlot: { type: "string" }
                        },
                        required: ["roomNumber", "userId", "date", "timeSlot"]
                    }
                },
                {
                    name: "deleteBooking",
                    parameters: {
                        type: "object",
                        properties: {
                            userId: { type: "string" },
                            date: { type: "string" },
                            timeSlot: { type: "string" }
                        },
                        required: ["userId", "date", "timeSlot"]
                    }
                },
                {
                    name: "updateBooking",
                    parameters: {
                        type: "object",
                        properties: {
                            userId: { type: "string" },
                            date: { type: "string" },
                            timeSlot: { type: "string" },
                            new_date: { type: "string" },
                            new_timeSlot: { type: "string" }
                        },
                        required: ["userId", "date", "timeSlot", "new_date", "new_timeSlot"]
                    }
                }
            ],
            function_call: "auto" // Let the model decide when to call a function
        });

        const responseContent = completion.choices[0].message;
        if (responseContent.function_call) {
            const { name, arguments } = responseContent.function_call;
            let result;
            let naturalLanguageResponse = "";

            switch (name) {
                case "findBooking":
                    result = await findBooking(JSON.parse(arguments));
                    naturalLanguageResponse = result.length > 0 ?
                        `Here are the bookings found: ${result.map(booking => `Room ${booking.roomNumber} booked by ${booking.userId} on ${booking.date} at ${booking.timeSlot}`).join(", ")}.` :
                        "No bookings found.";
                    break;
                case "makeBooking":
                    const newBooking = JSON.parse(arguments);
                    result = await makeBooking(newBooking);
                    naturalLanguageResponse = `Your booking has been made successfully with ID: ${result}.`;
                    break;
                case "deleteBooking":
                    const deleteQuery = JSON.parse(arguments);
                    result = await deleteBooking(deleteQuery);
                    naturalLanguageResponse = result > 0 ? "The booking has been deleted successfully." : "No booking was found to delete.";
                    break;
                case "updateBooking":
                    const { userId, date, timeSlot, new_date, new_timeSlot } = JSON.parse(arguments);
                    result = await updateBooking({ userId, date, timeSlot }, { date: new_date, timeSlot: new_timeSlot });
                    naturalLanguageResponse = result > 0 ? "The booking has been updated successfully." : "No booking was found to update.";
                    break;
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
    console.log(`Listening on ${PORT}`);
    console.log("Chatbot: Connecting to MongoDB...");
});
