import React from 'react';
import Chat from "./Chat";
import { useTranslation } from 'react-i18next';

const Generative = ({ selectedUser, language }) => {
    const { t } = useTranslation();

    const fetchResponse = async (selectedUser, text) => {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_LOCAL_URL}/openai`, {
            method: 'POST',
            body: JSON.stringify({ language, text }),
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'chatta/0.0.2'
            }
        });
        const data = await response.json();
        return data.message || 'Unexpected response structure';
    };

    const initialBotMessage = (userName) => t('botMessage', { userName });

    return (
        <Chat
            selectedUser={selectedUser}
            fetchResponse={fetchResponse}
            initialBotMessage={initialBotMessage}
        />
    );
};

export default Generative;
