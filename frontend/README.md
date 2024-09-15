# Chatta

Chatta is a web application built with React that provides real-time interaction features with multilingual support and live data updates via WebSockets. The app utilizes Material UI for the interface and Socket.IO for real-time communication.

## Live Prototype

You can access the prototype in action via https://larsobist.github.io/chatta/

## Project Setup

To set up and run the project locally, follow these steps:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/larsobist/chatta.git
    cd frontend
    ```

2. **Install dependencies**:
   Ensure you have [Node.js](https://nodejs.org/) installed, then run:
    ```bash
    npm install
    ```

3. **Start the application**:
    ```bash
    npm run frontend
    ```

This will start the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Deployment

The project is configured to be deployed on GitHub Pages. To deploy the app:

1. Ensure the `homepage` field in `package.json` points to the correct GitHub Pages URL.
2. Run the following commands:
    ```bash
    npm run deploy
    ```

This will deploy the build folder to GitHub Pages, and the app will be available at [https://larsobist.github.io/chatta](https://larsobist.github.io/chatta).

## Dependencies

### Core Dependencies
- **React**: A JavaScript library for building user interfaces.
- **Material UI**: A popular React UI framework.
- **i18next**: An internationalization framework for React.
- **Socket.IO Client**: Enables real-time, bidirectional communication between web clients and servers.

### Development Dependencies
- **gh-pages**: A utility for deploying the app to GitHub Pages.
- **React Scripts**: A set of scripts and configuration for developing React apps.
## Environment Variables

Create a `.env` file in the root of the project and add the following variables:

```
REACT_APP_BACKEND_URL
REACT_APP_GOOGLE_LOCATION
REACT_APP_GOOGLE_PROJECT_ID
REACT_APP_GOOGLE_AGENT_ID
```