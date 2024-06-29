require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { OpenAI } = require('openai');
const { GoogleAuth } = require('google-auth-library');

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());

// MongoDB setup
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.nbzpr4r.mongodb.net/?retryWrites=true&w=majority&appName=${process.env.MONGO_APP_NAME}`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const connectClient = async () => {
    if (!client.topology || !client.topology.isConnected()) {
        await client.connect();
        console.log("Connected to DB");
    }
};

const getCollection = (collectionName) => {
    return client.db(process.env.MONGO_DB_NAME).collection(collectionName);
};

// User selection in-memory store
let selectedUser = null;

app.get('/users', async (req, res) => {
    try {
        await connectClient();
        const usersCollection = getCollection('users');
        const users = await usersCollection.find().toArray();
        res.json(users);
    } catch (error) {
        console.error('Error in /users endpoint:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/selectedUser', async (req, res) => {
    const { selectedUser: user } = req.body;
    try {
        await connectClient();
        const usersCollection = getCollection('users');
        const users = await usersCollection.find().toArray();
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

const findBooking = async (userName, functionArgs) => {
    await connectClient();
    const bookingsCollection = getCollection('bookings');
    const query = { userName: userName, ...functionArgs };
    const result = await bookingsCollection.find(query).toArray();
    console.log('findBooking result:', result);
    return result;
}


const createBooking = async (userName, functionArgs) => {
    await connectClient();
    const bookingsCollection = getCollection('bookings');
    const result = await bookingsCollection.insertOne({ userName, ...functionArgs });
    console.log('createBooking result:', result);
    return result;
}

const updateBooking = async (userName, functionArgs) => {
    await connectClient();
    const bookingsCollection = getCollection('bookings');
    const result = await bookingsCollection.updateOne(
        { userName, ...functionArgs.query },
        { $set: functionArgs.update }
    );
    console.log('updateBooking result:', result);
    return result;
}

const deleteBooking = async (userName, functionArgs) => {
    await connectClient();
    const bookingsCollection = getCollection('bookings');
    const result = await bookingsCollection.deleteOne({ userName, ...functionArgs });
    console.log('deleteBooking result:', result);
    return result;
}

// OpenAI setup
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// In-memory message history
let messageHistory = [];

app.post('/openai', async (req, res) => {
    const textInput = req.body.text;
    const currentDate = new Date().toISOString().split('T')[0];

    try {
        if (!selectedUser) {
            return res.status(400).json({ message: 'No user selected. Please select a user first.' });
        }

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
                type: "function",
                function: {
                    name: "find_booking",
                    description: "Find a reservation with the given params",
                    parameters: {
                        type: "object",
                        properties: {
                            date: { type: "string", description: "The date of the booking, e.g., 2024-06-26" },
                            timeSlot: { type: "string", description: "The time of the booking, e.g., 11:00, always in HH:MM format" }
                        },
                        required: []
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "create_booking",
                    description: "Create a reservation with the given params",
                    parameters: {
                        type: "object",
                        properties: {
                            roomNumber: { type: "string", description: "The room number for the booking" },
                            date: { type: "string", description: "The date of the booking, e.g., 2024-06-26" },
                            timeSlot: { type: "string", description: "The time of the booking, e.g., 11:00, always in HH:MM format" }
                        },
                        required: ["date", "timeSlot"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "delete_booking",
                    description: "Delete a reservation with the given params",
                    parameters: {
                        type: "object",
                        properties: {
                            date: { type: "string", description: "The date of the booking to delete, e.g., 2024-06-26" },
                            timeSlot: { type: "string", description: "The time of the booking to delete, e.g., 11:00, always in HH:MM format" }
                        },
                        required: ["date", "timeSlot"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "update_booking",
                    description: "Update a reservation with the given params",
                    parameters: {
                        type: "object",
                        properties: {
                            date: { type: "string", description: "The current date of the booking, e.g., 2024-06-26" },
                            timeSlot: { type: "string", description: "The current time of the booking, e.g., 11:00, always in HH:MM format" },
                            new_date: { type: "string", description: "The new date of the booking, e.g., 2024-06-27" },
                            new_timeSlot: { type: "string", description: "The new time of the booking, e.g., 12:00, always in HH:MM format" }
                        },
                        required: ["date", "timeSlot", "new_date", "new_timeSlot"]
                    }
                }
            }
        ];

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messageHistory,
            tools: tools,
            tool_choice: "auto"
        });

        const responseMessage = response.choices[0].message;

        const toolCalls = responseMessage.tool_calls;
        if (toolCalls) {
            const availableFunctions = {
                find_booking: findBooking,
                create_booking: createBooking,
                delete_booking: deleteBooking,
                update_booking: updateBooking
            }

            messageHistory.push(responseMessage)

            for (const toolCall of toolCalls) {
                const functionName = toolCall.function.name;
                const functionToCall = availableFunctions[functionName];
                const functionArgs = JSON.parse(toolCall.function.arguments);
                const functionResponse = await functionToCall(
                    selectedUser.name,  // Correctly passing the userName
                    functionArgs
                );
                messageHistory.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: functionName,
                    content: JSON.stringify(functionResponse),
                }); // extend conversation with function response
            }

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

// Google Auth setup
const SERVICE_ACCOUNT_KEY = {
    type: process.env.GOOGLE_TYPE,
    project_id: process.env.REACT_APP_GOOGLE_PROJECT_ID,
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

app.post('/dialogflow', (req, res) => {
    const data = req.body;
    console.log(JSON.stringify(data));
    const intentName = data.fulfillmentInfo.tag;
    console.log(intentName);

    switch (intentName) {
        case 'welcome':
            res.json({
                fulfillment_response: {
                    messages: [
                        {
                            text: {
                                text: ['This is a sample response WELCOME.']
                            }
                        }
                    ]
                }
            });
            break;
        case 'findBooking':
            //findBooking(req, res);
            res.json({
                fulfillment_response: {
                    messages: [
                        {
                            text: {
                                text: ['This is a sample response FINDING.']
                            }
                        }
                    ]
                }
            });
            break;
        case 'createBooking':
            //createBooking(req, res);
            res.json({
                fulfillment_response: {
                    messages: [
                        {
                            text: {
                                text: ['This is a sample response BOOKING.']
                            }
                        }
                    ]
                }
            });
            break;
        case 'delteBooking':
            //deleteBooking(req, res);
            res.json({
                fulfillment_response: {
                    messages: [
                        {
                            text: {
                                text: ['This is a sample response DELTE.']
                            }
                        }
                    ]
                }
            });
            break;
        default:
            res.json({
                fulfillmentText: `Intent ${intentName} not handled in the webhook.`
            });
    }
});

app.listen(PORT, () => {
    console.log(`App listening on ${PORT}`);
});
