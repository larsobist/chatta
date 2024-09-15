import React, { useEffect, useState } from 'react';
import Chat from './Chat';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';

const Rule = ({ selectedUser, language }) => {
    const [accessToken, setAccessToken] = useState(null);  // State to store the access token.
    const [isTokenFetched, setIsTokenFetched] = useState(false);  // State to track if the token has been fetched.
    const sessionId = uuidv4();  // Unique session ID for Dialogflow requests.
    const { t } = useTranslation();  // Hook for translations.

    // Fetch access token when the component mounts or when selectedUser/language changes.
    useEffect(() => {
        setIsTokenFetched(false);
        setAccessToken(null);

        const fetchToken = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-token`, {
                    headers: {
                        'User-Agent': 'chatta/0.0.2'
                    }
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch access token: ${response.statusText}`);
                }
                const data = await response.json();
                setAccessToken(data.token);  // Store the fetched token.
                setIsTokenFetched(true);  // Indicate that the token has been fetched.
            } catch (error) {
                console.error('Error fetching access token:', error);
            }
        };

        fetchToken();  // Call the token fetching function.
    }, [selectedUser, language]);

    // Fetch response from Dialogflow using the access token and user input.
    const fetchResponse = async (selectedUser, text) => {
        if (!accessToken) {
            throw new Error('Access token not available');
        }

        const requestBody = {
            queryInput: {
                text: {
                    text: text,
                },
                languageCode: language,
            },
        };

        try {
            const response = await fetch(
                `https://${process.env.REACT_APP_GOOGLE_LOCATION}-dialogflow.googleapis.com/v3/projects/${process.env.REACT_APP_GOOGLE_PROJECT_ID}/locations/${process.env.REACT_APP_GOOGLE_LOCATION}/agents/${process.env.REACT_APP_GOOGLE_AGENT_ID}/sessions/${sessionId}:detectIntent`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,  // Use the access token for authorization.
                    },
                    body: JSON.stringify(requestBody),  // Send the user message to Dialogflow.
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Dialogflow API response error:', errorText);
                throw new Error(`Failed to send message to Dialogflow: ${response.statusText}`);
            }

            const responseData = await response.json();
            const botMessage = responseData.queryResult.responseMessages
                .map(msg => msg.text.text)
                .join('\n');  // Extract and format the bot's response message.

            return botMessage;  // Return the bot's message.
        } catch (error) {
            console.error('Error fetching response from Dialogflow:', error);
            throw error;
        }
    };

    // Generate the initial bot message using the user's name.
    const initialBotMessage = (userName) => t('botMessage', { userName });

    return (
        <Chat
            selectedUser={selectedUser}
            fetchResponse={fetchResponse}
            initialBotMessage={initialBotMessage}
            isLoading={!isTokenFetched}  // Indicate loading state while the token is being fetched.
        />
    );
};

export default Rule;
