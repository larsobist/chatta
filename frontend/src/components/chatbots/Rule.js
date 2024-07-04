import React, { useEffect, useState } from 'react';
import Chat from './Chat';
import { v4 as uuidv4 } from 'uuid';

const Rule = ({ selectedUser }) => {
    const [accessToken, setAccessToken] = useState(null);
    const [isTokenFetched, setIsTokenFetched] = useState(false);
    const sessionId = uuidv4();

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-token`, {
                    headers: {
                        'User-Agent': 'chatta/0.0.2'
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch access token');
                }
                const data = await response.json();
                setAccessToken(data.token);
                setIsTokenFetched(true);  // Set the done state here
            } catch (error) {
                console.error('Error fetching access token:', error);
            }
        };

        fetchToken();
    }, []);

    const fetchResponse = async (selectedUser, text) => {
        if (!accessToken) {
            throw new Error('Access token not available');
        }

        const requestBody = {
            queryInput: {
                text: {
                    text: text,
                },
                languageCode: process.env.REACT_APP_GOOGLE_LANGUAGE_CODE,
            },
        };

        const response = await fetch(
            `https://${process.env.REACT_APP_GOOGLE_LOCATION}-dialogflow.googleapis.com/v3/projects/${process.env.REACT_APP_GOOGLE_PROJECT_ID}/locations/${process.env.REACT_APP_GOOGLE_LOCATION}/agents/${process.env.REACT_APP_GOOGLE_AGENT_ID}/sessions/${sessionId}:detectIntent`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(requestBody),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Dialogflow API response error:', errorText);
            throw new Error('Failed to send message to Dialogflow');
        }

        const responseData = await response.json();
        const botMessage = responseData.queryResult.responseMessages
            .map(msg => msg.text.text)
            .join('\n');

        return botMessage;
    };

    const initialBotMessage = (userName) => `Hallo ${userName}! Ich bin ein Regelbasierter Chatbot der für dich in der Lage ist, dir bei deiner Verwaltung deiner Raumbuchungen zu helfen. Sag mir nur wie ich dir helfen kann!`;

    return (
        <Chat
            selectedUser={selectedUser}
            fetchResponse={fetchResponse}
            initialBotMessage={initialBotMessage}
            isLoading={!isTokenFetched}
        />
    );
};

export default Rule;
