Here’s a README for your backend project based on the provided `package.json`:

---

# Chatta Backend

The backend service for the **Chatta** application, built using Node.js, Express, and MongoDB. This backend provides APIs for handling user data, bookings, and integration with external services like OpenAI and Google services. It also supports real-time communication using Socket.IO.

## Live Prototype

You can access the prototype in action via https://larsobist.github.io/chatta/

## Project Setup

To set up and run the backend server locally, follow these steps:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/larsobist/chatta-backend.git
    cd backend
    ```

2. **Install dependencies**:
   Ensure you have [Node.js](https://nodejs.org/) installed, then run:
    ```bash
    npm install
    ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and configure it with the necessary environment variables. (See [Environment Variables](#environment-variables) for details.)

4. **Start the server**:
    ```bash
    npm run backend
    ```

This will start the backend server in development mode using `nodemon`.

## Other Available Scripts

In the project directory, you can run the following scripts:

### `npm run backend`
Starts the server in development mode using `nodemon`. The server will automatically restart when changes are detected.

### `npm run deploy`
Runs a deployment script (`deploy.sh`). Ensure this script is correctly set up to handle your deployment.

## Dependencies

### Core Dependencies
- **Express**: A web framework for Node.js, used to build the RESTful API.
- **MongoDB**: A NoSQL database used for storing and managing data.
- **Socket.IO**: Enables real-time, bidirectional communication between the server and connected clients.
- **OpenAI**: Provides integration with OpenAI's API for natural language processing.
- **Google Auth Library**: For authenticating and working with Google services.
- **CORS**: Middleware for enabling Cross-Origin Resource Sharing (CORS).

## Environment Variables

Create a `.env` file in the root of the project and add the following variables:

```
MONGO_USER
MONGO_PASSWORD
MONGO_APP_NAME
MONGO_DB_NAME
OPENAI_API_KEY
GOOGLE_TYPE
GOOGLE_PROJECT_ID
GOOGLE_PRIVATE_KEY_ID
GOOGLE_PRIVATE_KEY
GOOGLE_CLIENT_EMAIL
GOOGLE_CLIENT_ID
GOOGLE_AUTH_URI
GOOGLE_TOKEN_URI
GOOGLE_AUTH_PROVIDER_X509_CERT_URL
GOOGLE_CLIENT_X509_CERT_URL
GOOGLE_UNIVERSE_DOMAIN
```

## Deployment

To deploy the backend, you can run the following command:

```bash
npm run deploy
```

Make sure the `deploy.sh` script is configured to handle the deployment process to your server or cloud provider.