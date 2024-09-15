const { MongoClient, ServerApiVersion } = require('mongodb');

// Construct MongoDB URI using environment variables for credentials and settings.
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.nbzpr4r.mongodb.net/?retryWrites=true&w=majority&appName=${process.env.MONGO_APP_NAME}`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Connect to MongoDB if not already connected.
const connectClient = async () => {
    if (!client.topology || !client.topology.isConnected()) {
        await client.connect();
        console.log("Connected to DB");
    }
};

// Get a collection from the specified database.
const getCollection = (collectionName) => {
    return client.db(process.env.MONGO_DB_NAME).collection(collectionName);
};

module.exports = { connectClient, getCollection };
