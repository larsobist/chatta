# Chatta

**Chatta** is a full-stack web application that includes both a backend and frontend. The application uses React for the frontend and Node.js with Express for the backend. This setup allows running both the backend and frontend concurrently during development.

## Project Setup

To set up and run the full-stack project locally, follow these steps:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/chatta.git
    cd chatta
    ```

2. **Install dependencies for the root, backend, and frontend**:
   - Install dependencies for the root project (for running backend and frontend together):
     ```bash
     npm install
     ```

   - Navigate to the `backend` folder and install its dependencies:
     ```bash
     cd backend
     npm install
     ```

   - Navigate to the `frontend` folder and install its dependencies:
     ```bash
     cd ../frontend
     npm install
     ```

3. **Run the project**:
   From the root directory, run:
    ```bash
    npm start
    ```

## Available Scripts

In the root directory, you can run the following script:

### `npm start`

Starts both the backend and frontend concurrently. The frontend will run on [http://localhost:3000](http://localhost:3000), and the backend will run on a different port (e.g., 8080), as configured in your backend.

## Development Guidelines

- **Run both frontend and backend**: Use `npm start` from the root directory to run both the frontend and backend at the same time.
- **Modify backend/frontend independently**: You can still work on either the backend or frontend independently by navigating into their respective directories and running `npm start` or other relevant scripts you can find in the respective ReadMe.
