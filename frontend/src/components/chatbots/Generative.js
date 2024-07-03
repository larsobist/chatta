import React, {useState, useRef, useEffect} from 'react';
import './Chatbots.scss';
import {Button, TextField} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";  // Import the CSS file for styling

const Generative = ({selectedUser}) => {
    const [text, setText] = useState('');
    const [messages, setMessages] = useState([{type: 'bot', content: `Hi ${selectedUser.name}, how can I help you?`}]);
    const [showFadeOut, setShowFadeOut] = useState(false); // New state for fade-out visibility
    const chatBoxRef = useRef(null);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
            setShowFadeOut(chatBoxRef.current.scrollHeight > chatBoxRef.current.clientHeight);
        }
    }, [messages]);

    useEffect(() => {
        setMessages([{type: 'bot', content: `Hi ${selectedUser.name}, how can I help you?`}]);
    }, [selectedUser]);

    const getCompletion = async () => {
        const userMessage = {type: 'user', content: text};
        const typingIndicator = {type: 'bot', content: 'typing'};
        setMessages(prevMessages => [...prevMessages, userMessage, typingIndicator]);
        setText('');

        try {
            const response = await fetch(`${process.env.REACT_APP_LOCAL_URL}/openai`, {
                method: 'POST',
                body: JSON.stringify({ selectedUser: selectedUser, text }),
                //body: JSON.stringify({ text }),
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'chatta/0.0.2'
                }
            });
            const data = await response.json();
            setMessages(prevMessages => prevMessages.filter(msg => msg.content !== 'typing'));
            setMessages(prevMessages => [...prevMessages, {
                type: 'bot',
                content: data.message || 'Unexpected response structure'
            }]);
        } catch (error) {
            console.error('Error fetching completion:', error);
            setMessages(prevMessages => prevMessages.filter(msg => msg.content !== 'typing'));
            setMessages(prevMessages => [...prevMessages, {type: 'bot', content: 'Error fetching completion'}]);
        }
    }

    return (
        <div className="chat-container">
            {showFadeOut && <div className="fade-out"></div>}
            <div className="chat-box" ref={chatBoxRef}>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`chat-message ${message.type}`}
                        style={message.type === 'user' ? {backgroundColor: selectedUser.color} : {}}
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
                <TextField id="input" placeholder="Schreib deine Nachricht hier..."
                           variant="outlined" value={text}
                           onChange={e => setText(e.target.value)}
                           onKeyPress={e => e.key === 'Enter' ? getCompletion() : null}
                           className="input-field"
                />
                <Button variant="contained"
                        onClick={getCompletion}
                        style={{backgroundColor: selectedUser.color}}
                        className="send-button"
                ><SendRoundedIcon></SendRoundedIcon></Button>
            </div>
        </div>
    );
}

export default Generative;