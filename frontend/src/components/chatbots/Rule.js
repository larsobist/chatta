import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './Chatbots.scss';
import {Button, TextField} from "@mui/material";
import SendRoundedIcon from '@mui/icons-material/SendRounded';

const Rule = ({ selectedUser }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [accessToken, setAccessToken] = useState(null);
    const [showFadeOut, setShowFadeOut] = useState(false); // New state for fade-out visibility
    const chatBoxRef = useRef(null);

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
            } catch (error) {
                console.error('Error fetching access token:', error);
            }
        };

        fetchToken();
    }, []);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
            setShowFadeOut(chatBoxRef.current.scrollHeight > chatBoxRef.current.clientHeight);
        }
    }, [messages]);

    const handleSend = async () => {
        if (input.trim() === '') return;

        const newMessages = [...messages, { text: input, sender: 'user' }, { text: 'typing', sender: 'bot' }];
        setMessages(newMessages);
        setInput('');

        const requestBody = {
            queryInput: {
                text: {
                    text: input,
                },
                languageCode: process.env.REACT_APP_GOOGLE_LANGUAGE_CODE,
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

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Dialogflow API response error:', errorText);
                throw new Error('Failed to send message to Dialogflow');
            }

            const responseData = await response.json();
            console.log('Dialogflow response:', responseData);

            const botMessage = responseData.queryResult.responseMessages
                .map(msg => msg.text.text)
                .join('\n');

            setMessages(prevMessages => [
                ...prevMessages.slice(0, -1), // Remove the 'typing' indicator
                { text: botMessage, sender: 'bot' }
            ]);
        } catch (error) {
            console.error('Error communicating with Dialogflow:', error);
            setMessages(prevMessages => [
                ...prevMessages.slice(0, -1), // Remove the 'typing' indicator
                { text: 'Error communicating with Dialogflow', sender: 'bot' }
            ]);
        }
    };

    return (
        <div className="chat-container">
            {showFadeOut && <div className="fade-out"></div>}
            <div className="chat-box" ref={chatBoxRef}>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`chat-message ${message.sender}`}
                        style={message.sender === 'user' ? { backgroundColor: selectedUser.color } : {}}
                    >
                        {message.text === 'typing' ? (
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        ) : message.text}
                    </div>
                ))}
            </div>
            <div className="input-container">
                <TextField id="outlined-basic"
                           placeholder="Schreib deine Nachricht hier..."
                           variant="outlined"
                           value={input}
                           onChange={e => setInput(e.target.value)}
                           onKeyPress={e => e.key === 'Enter' ? handleSend() : null}
                           className="input-field"
                />
                <Button variant="contained"
                        onClick={handleSend}
                        style={{ backgroundColor: selectedUser.color }}
                        className="send-button"
                ><SendRoundedIcon></SendRoundedIcon></Button>
            </div>
        </div>
    );
};

export default Rule;
