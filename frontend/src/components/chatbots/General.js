import React, { useState } from 'react';
import Generative from "./Generative";
import Rule from "./Rule";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useTranslation } from 'react-i18next';

const General = ({ selectedUser, language }) => {
    const [chatbot, setChatbot] = useState('rule');  // State to track which chatbot is selected ('rule' or 'generative').
    const { t } = useTranslation();  // Hook for translations.

    // Handle chatbot toggle button selection.
    const handleChatbot = (event, newChatbot) => {
        if (newChatbot !== null) {
            setChatbot(newChatbot);
        }
    };

    return (
        <div>
            <div className="info-container">
                <div className="info-header">
                    <h1> {selectedUser?.name ?? 'User'}'s </h1>
                    <div className="chatta-name">
                        CHATTA
                    </div>
                </div>

                {/* Toggle buttons to switch between rule-based and generative chatbots */}
                <ToggleButtonGroup
                    value={chatbot}
                    exclusive
                    onChange={handleChatbot}
                >
                    <ToggleButton value="rule">
                        {t('ruleBased')} {/* Translate the label for rule-based chatbot */}
                    </ToggleButton>
                    <ToggleButton value="generative">
                        {t('generative')} {/* Translate the label for generative chatbot */}
                    </ToggleButton>
                </ToggleButtonGroup>
            </div>

            {/* Render either the Rule-based or Generative component based on the selected chatbot */}
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
