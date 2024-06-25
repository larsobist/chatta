import React, { useState, useRef, useEffect } from 'react';
import './Chatbots.scss';  // Import the CSS file for styling

const Generative = ({ selectedUser }) => {
    const [text, setText] = useState('');
    const [messages, setMessages] = useState([{ type: 'bot', content: `Hi ${selectedUser.name}, how can I help you?` }]);
    const chatBoxRef = useRef(null);

    useEffect(() => {
        // Scroll to the bottom of the chat box when messages change
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    const getCompletion = async () => {
        // Display user's message and add typing indicator
        const userMessage = { type: 'user', content: text };
        const typingIndicator = { type: 'bot', content: 'typing' };
        setMessages([...messages, userMessage, typingIndicator]);
        setText('');

        try {
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                body: JSON.stringify({ text, user: selectedUser.name }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            console.log(data);
            // Remove the typing indicator before adding the bot response
            const updatedMessages = [...messages, userMessage].filter(msg => msg.content !== 'typing');
            if (data.message && data.message.content) {
                setMessages([...updatedMessages, { type: 'bot', content: data.message.content }]);
            } else {
                setMessages([...updatedMessages, { type: 'bot', content: 'Unexpected response structure' }]);
            }
        } catch (error) {
            console.error('Error fetching completion:', error);
            const updatedMessages = [...messages, userMessage].filter(msg => msg.content !== 'typing');
            setMessages([...updatedMessages, { type: 'bot', content: 'Error fetching completion' }]);
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
