import React, { useState } from 'react';
import Generative from "./Generative";
import Rule from "./Rule";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useTranslation } from 'react-i18next';

const General = ({ selectedUser, language }) => {
    const [chatbot, setChatbot] = useState('rule');
    const { t } = useTranslation();

    const handleChatbot = (event, newChatbot) => {
        if (newChatbot !== null) {
            setChatbot(newChatbot);
        }
    };

    return (
        <div>
            <div className="info-container">
                <h1>{selectedUser?.name ?? 'User'}'s chatta</h1>
                <ToggleButtonGroup
                    value={chatbot}
                    exclusive
                    onChange={handleChatbot}
                >
                    <ToggleButton value="rule">
                        {t('ruleBased')}
                    </ToggleButton>
                    <ToggleButton value="generative">
                        {t('generative')}
                    </ToggleButton>
                </ToggleButtonGroup>
            </div>
            {chatbot === 'rule' && (
                <Rule key={selectedUser.id} selectedUser={selectedUser} language={language} />
            )}
            {chatbot === 'generative' && (
                <Generative key={selectedUser.id} selectedUser={selectedUser} language={language} />
            )}
        </div>
    );
}

export default General;
