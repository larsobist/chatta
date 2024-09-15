const { GoogleAuth } = require('google-auth-library');

// Decode and format the Google private key from environment variables.
const googlePrivateKey = decodeURIComponent(process.env.GOOGLE_PRIVATE_KEY).replace(/\\n/g, '\n');

// Create the service account credentials object using environment variables.
const SERVICE_ACCOUNT_KEY = {
    type: process.env.GOOGLE_TYPE,
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: googlePrivateKey,
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: process.env.GOOGLE_AUTH_URI,
    token_uri: process.env.GOOGLE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN,
};

// Initialize GoogleAuth client with service account credentials and scope.
const client = new GoogleAuth({
    credentials: SERVICE_ACCOUNT_KEY,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

module.exports = client;
