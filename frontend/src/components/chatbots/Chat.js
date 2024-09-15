import React, { useState, useEffect, useRef } from 'react';
import './Chatbots.scss';
import { Button, TextField } from "@mui/material";
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { useTranslation } from 'react-i18next';

const Chat = ({ selectedUser, fetchResponse, initialBotMessage, isLoading }) => {
    const { t } = useTranslation();
    // Manage state for messages, input text, fade-out effect, and message sent flag.
    const [messages, setMessages] = useState([{ type: 'bot', content: isLoading ? 'loading' : initialBotMessage(selectedUser.name) }]);
    const [text, setText] = useState('');
    const [showFadeOut, setShowFadeOut] = useState(false);
    const [hasMessageBeenSent, setHasMessageBeenSent] = useState(false);
    const chatBoxRef = useRef(null);

    // Sample bot messages to be shown before a user sends a message.
    const sampleMessages = [
        t('findRoom'),
        t('addBooking'),
        t('updateBooking'),
        t('deleteBooking')
    ];

    // Scroll to the bottom when messages are updated and toggle fade-out effect.
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
            setShowFadeOut(chatBoxRef.current.scrollHeight > chatBoxRef.current.clientHeight);
        }
    }, [messages]);

    // Reset messages when the selected user changes or the loading state changes.
    useEffect(() => {
        setMessages([{ type: 'bot', content: isLoading ? 'loading' : initialBotMessage(selectedUser.name) }]);
        setHasMessageBeenSent(false);
    }, [selectedUser, initialBotMessage, isLoading]);

    // Handle message sending by updating message state and invoking the fetch response.
    const handleSend = async (messageText = text) => {
        if (messageText.trim() === '') return;

        const userMessage = { type: 'user', content: messageText };
        const typingIndicator = { type: 'bot', content: 'typing' };
        setMessages(prevMessages => [...prevMessages, userMessage, typingIndicator]);
        setText('');
        setHasMessageBeenSent(true);

        try {
            const response = await fetchResponse(selectedUser, messageText);
            setMessages(prevMessages => prevMessages.filter(msg => msg.content !== 'typing'));
            setMessages(prevMessages => [...prevMessages, { type: 'bot', content: response }]);
        } catch (error) {
            console.error('Error fetching response:', error);
            setMessages(prevMessages => prevMessages.filter(msg => msg.content !== 'typing'));
            setMessages(prevMessages => [...prevMessages, { type: 'bot', content: 'Error fetching response' }]);
        }
    };

    // Send a predefined sample message when clicked.
    const handleSampleMessageClick = (message) => {
        handleSend(message);
    };

    // Convert RGB color string to RGBA for transparency.
    const rgbToRgba = (rgb, alpha) => {
        return rgb.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
    };

    return (
        <div className="chat-container">
            {showFadeOut && <div className="fade-out"></div>}
            <div className="chat-box" ref={chatBoxRef}>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`chat-message ${message.type}`}
                        style={message.type === 'user'
                            ? { backgroundColor: selectedUser.color }
                            : { backgroundColor: rgbToRgba(selectedUser.color, 0.1) }}
                    >
                        {message.content === 'typing' || message.content === 'loading' ? (
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        ) : message.content}
                    </div>
                ))}
            </div>
            {!hasMessageBeenSent && !isLoading && (
                <div className="sample-messages">
                    {sampleMessages.map((sampleMessage, index) => (
                        <Button
                            key={index}
                            variant="outlined"
                            onClick={() => handleSampleMessageClick(sampleMessage)}
                            className="sample-message-button"
                            sx={{
                                borderColor: selectedUser.color,
                                color: selectedUser.color,
                                '&:hover': {
                                    borderColor: selectedUser.color,
                                    backgroundColor: rgbToRgba(selectedUser.color, 0.1)
                                }
                            }}
                        >
                            {sampleMessage}
                        </Button>
                    ))}
                </div>
            )}
            <div className="input-container">
                <TextField id="input"
                           placeholder={t('typeMessage')}
                           variant="outlined"
                           value={text}
                           onChange={e => setText(e.target.value)}
                           onKeyPress={e => e.key === 'Enter' && !isLoading ? handleSend() : null}
                           className="input-field"
                           disabled={isLoading}
                />
                <Button variant="contained"
                        onClick={() => handleSend()}
                        style={{ backgroundColor: selectedUser.color }}
                        className="send-button"
                        disabled={isLoading}
                ><SendRoundedIcon /></Button>
            </div>
        </div>
    );
};

export default Chat;
