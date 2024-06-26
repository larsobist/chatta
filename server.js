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

// In-memory store for the selected user
let selectedUser = null;

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

async function findBooking(userName, query) {
    await connectClient();
    query.userName = userName;

    console.log(JSON.stringify(query) + " FIND QUERY");
    const database = client.db('chattaDatabase');
    const collection = database.collection('bookings');
    return await collection.find(query).toArray();
}

async function createBooking(userName, query) {
    await connectClient();
    query.userName = userName;
    console.log(JSON.stringify(query) + " ADD QUERY");
    const database = client.db('chattaDatabase');
    const bookingsCollection = database.collection('bookings');
    return await bookingsCollection.insertOne(query);
}

async function deleteBooking(userName, query) {
    await connectClient();
    query.userName = userName;
    console.log(JSON.stringify(query) + " DELETE QUERY");
    const database = client.db('chattaDatabase');
    const bookingsCollection = database.collection('bookings');
    return await bookingsCollection.deleteOne(query);
}

async function updateBooking(userName, query, update) {
    await connectClient();
    query.userName = userName;
    console.log(JSON.stringify(query) + " UPDATE QUERY");
    const database = client.db('chattaDatabase');
    const bookingsCollection = database.collection('bookings');
    return await bookingsCollection.updateOne(query, { $set: update });
}

async function fetchUsers() {
    try {
        await connectClient();
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

app.post('/selectedUser', async (req, res) => {
    const { selectedUser: user } = req.body;
    try {
        const users = await fetchUsers();
        if (user && users.find(u => u.id === user.id)) {
            selectedUser = user;
            res.status(200).json({ message: 'Selected user updated successfully' });
        } else {
            res.status(400).json({ message: 'Invalid user' });
        }
    } catch (error) {
        console.error('Error in /selectedUser endpoint:', error);
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
        // Check if selectedUser is set
        if (!selectedUser) {
            res.status(400).json({ message: 'No user selected. Please select a user first.' });
            return;
        }

        const userName = selectedUser.name; // Use the stored selected user's name

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

        const tools = [
            {
                name: "find_booking",
                description: "Find a reservation with the given params",
                parameters: {
                    type: "object",
                    properties: {
                        timeSlot: { type: "string" },
                        date: { type: "string" }
                    },
                    required: []
                }
            },
            {
                name: "create_booking",
                description: "create a reservation with the given params",
                parameters: {
                    type: "object",
                    properties: {
                        roomNumber: { type: "string" },
                        date: { type: "string" },
                        timeSlot: { type: "string" }
                    },
                    required: ["roomNumber", "date", "timeSlot"]
                }
            },
            {
                name: "delete_booking",
                description: "Delete a reservation with the given params",
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
                name: "update_booking",
                description: "Update a reservation with the given params",
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
        ];

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messageHistory,
            functions: tools,
            function_call: "auto" // Let the model decide when to call a function
        });

        const responseMessage = response.choices[0].message;

        // Step 2: check if the model wanted to call a function
        if (responseMessage.function_call) {
            const functionName = responseMessage.function_call.name;
            const functionArgs = JSON.parse(responseMessage.function_call.arguments);
            let functionResponse;

            switch (functionName) {
                case "find_booking":
                    functionResponse = await findBooking(userName, functionArgs);
                    break;
                case "create_booking":
                    functionResponse = await createBooking(userName, functionArgs);
                    break;
                case "update_booking":
                    functionResponse = await updateBooking(userName, functionArgs.query, functionArgs.update);
                    break;
                case "delete_booking":
                    functionResponse = await deleteBooking(userName, functionArgs);
                    break;
                default:
                    throw new Error("Unknown function call");
            }

            messageHistory.push({
                role: "function",
                name: functionName,
                content: JSON.stringify(functionResponse)
            });

            const secondResponse = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: messageHistory,
            });

            messageHistory.push({
                role: "assistant",
                content: secondResponse.choices[0].message.content
            });

            res.json({ message: secondResponse.choices[0].message.content });
        } else {
            messageHistory.push({
                role: "assistant",
                content: responseMessage.content
            });
            res.json({ message: responseMessage.content });
        }
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).send("Internal Server Error");
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

app.listen(PORT, () => {
    console.log(`App listening on ${PORT}`);
});
