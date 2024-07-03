import React from 'react';
import Chat from "./Chat";

const Generative = ({ selectedUser }) => {
    const fetchResponse = async (selectedUser, text) => {
        const response = await fetch(`${process.env.REACT_APP_LOCAL_URL}/openai`, {
            method: 'POST',
            body: JSON.stringify({ selectedUser: selectedUser, text }),
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'chatta/0.0.2'
            }
        });
        const data = await response.json();
        return data.message || 'Unexpected response structure';
    };

    const initialBotMessage = (userName) => `Moin ${userName}! Ich bin ein generativer Chatbot der für dich in der Lage ist, dir bei deiner Verwaltung deiner Raumbuchungen zu helfen. Sag mir nur wie ich dir helfen kann!`;

    return (
        <Chat
            selectedUser={selectedUser}
            fetchResponse={fetchResponse}
            initialBotMessage={initialBotMessage}
        />
    );
};

export default Generative;
