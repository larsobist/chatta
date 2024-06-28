import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './Chatbots.scss';

const PROJECT_ID = 'masterthesis-413319';
const AGENT_ID = 'b56dc6e2-c2e6-416f-b1e4-31ea739ff566';
const LOCATION = 'europe-west3';
const LANGUAGE_CODE = 'de';

const Rule = ({ selectedUser }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [accessToken, setAccessToken] = useState(null);
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

    const handleSend = async () => {
        if (input.trim() === '') return;

        const newMessages = [...messages, { text: input, sender: 'user' }];
        setMessages(newMessages);
        setInput('');

        const requestBody = {
            queryInput: {
                text: {
                    text: input,
                },
                languageCode: LANGUAGE_CODE,
            },
        };

        console.log('Sending request to Dialogflow:', requestBody);

        try {
            const response = await fetch(
                `https://${LOCATION}-dialogflow.googleapis.com/v3/projects/${PROJECT_ID}/locations/${LOCATION}/agents/${AGENT_ID}/sessions/${sessionId}:detectIntent`,
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

            setMessages([...newMessages, { text: botMessage, sender: 'bot' }]);
        } catch (error) {
            console.error('Error communicating with Dialogflow:', error);
        }
    };

    return (
        <div className="chat-container">
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
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' ? handleSend() : null}
                    placeholder="Type your message here..."
                />
                <button
                    onClick={handleSend}
                    style={{ backgroundColor: selectedUser.color }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Rule;
