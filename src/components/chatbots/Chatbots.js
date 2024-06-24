import React, { useState } from 'react';
import Generative from "./Generative";
import Rule from "./Rule";

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

const Chatbots = ({ selectedAvatar }) => {
    const [chatbot, setChatbot] = useState('rule');

    const handleChatbot = (event, newChatbot) => {
        if (newChatbot !== null) {
            setChatbot(newChatbot);
        }
    };

    return (
        <div>
            <div className="info-container">
            <h1>Chatbots</h1>
            <ToggleButtonGroup
                value={chatbot}
                exclusive
                onChange={handleChatbot}
            >
                <ToggleButton value="rule">
                    Rule Based
                </ToggleButton>
                <ToggleButton value="generative">
                    Generative
                </ToggleButton>
            </ToggleButtonGroup>

            </div>
            {chatbot === 'rule' && (
                <Rule selectedAvatar={selectedAvatar}/>
            )}

            {chatbot === 'generative' && (
                <Generative selectedAvatar={selectedAvatar}/>
            )}

        </div>
    );
}

export default Chatbots;
