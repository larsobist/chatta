import React, { useEffect, useState } from 'react';
import Chat from './Chat';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';

const Rule = ({ selectedUser, language }) => {
    const [accessToken, setAccessToken] = useState(null);
    const [isTokenFetched, setIsTokenFetched] = useState(false);
    const sessionId = uuidv4();
    const { t } = useTranslation();

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
                console.log('Backend URL:', process.env.REACT_APP_BACKEND_URL);
                if (!response.ok) {
                    throw new Error(`Failed to fetch access token: ${response.statusText}`);
                }
                const data = await response.json();
                console.log('Access token fetched:', data.token);  // Logging the fetched token
                setAccessToken(data.token);
                setIsTokenFetched(true);
            } catch (error) {
                console.error('Error fetching access token:', error);
            }
        };

        fetchToken();
    }, [selectedUser, language]);

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
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(requestBody),
                }
            );
            console.log('Backend URL:', process.env.REACT_APP_BACKEND_URL);


            if (!response.ok) {
                const errorText = await response.text();
                console.error('Dialogflow API response error:', errorText);
                throw new Error(`Failed to send message to Dialogflow: ${response.statusText}`);
            }

            const responseData = await response.json();
            const botMessage = responseData.queryResult.responseMessages
                .map(msg => msg.text.text)
                .join('\n');

            return botMessage;
        } catch (error) {
            console.error('Error fetching response from Dialogflow:', error);
            throw error;
        }
    };

    const initialBotMessage = (userName) => t('botMessage', { userName });

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
