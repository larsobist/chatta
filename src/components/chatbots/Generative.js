import React, { useState, useRef, useEffect } from 'react';
import './Chatbots.scss';  // Import the CSS file for styling

const Generative = ({ selectedUser }) => {
    const [text, setText] = useState('');
    const [messages, setMessages] = useState([{ type: 'bot', content: `Hi ${selectedUser.name}, how can I help you?` }]);
    const chatBoxRef = useRef(null);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        setMessages([{ type: 'bot', content: `Hi ${selectedUser.name}, how can I help you?` }]);
    }, [selectedUser]);

    const getCompletion = async () => {
        const userMessage = { type: 'user', content: text };
        const typingIndicator = { type: 'bot', content: 'typing' };
        setMessages(prevMessages => [...prevMessages, userMessage, typingIndicator]);
        setText('');

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/openai`, {
                method: 'POST',
                body: JSON.stringify({ text }),
                headers: { 'Content-Type': 'application/json',
                    'User-Agent': 'chatta/0.0.2'
                }
            });
            const data = await response.json();
            setMessages(prevMessages => prevMessages.filter(msg => msg.content !== 'typing'));
            setMessages(prevMessages => [...prevMessages, { type: 'bot', content: data.message || 'Unexpected response structure' }]);
        } catch (error) {
            console.error('Error fetching completion:', error);
            setMessages(prevMessages => prevMessages.filter(msg => msg.content !== 'typing'));
            setMessages(prevMessages => [...prevMessages, { type: 'bot', content: 'Error fetching completion' }]);
        }
    }

    return (
        <div className="chat-container">
            <div className="chat-box" ref={chatBoxRef}>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`chat-message ${message.type}`}
                        style={message.type === 'user' ? { backgroundColor: selectedUser.color } : {}}
                    >
                        {message.content === 'typing' ? (
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        ) : message.content}
                    </div>
                ))}
            </div>
            <div className="input-container">
                <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' ? getCompletion() : null}
                    placeholder="Type your message here..."
                />
                <button
                    onClick={getCompletion}
                    style={{ backgroundColor: selectedUser.color }}
                >
                    Send
                </button>
            </div>
        </div>
    );
}

export default Generative;
