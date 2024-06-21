import React, { useState } from 'react';

const GenerativeChatbot = () => {
    const [text, setText] = useState('');
    const [response, setResponse] = useState('');

    const getCompletion = async () => {
        try {
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                body: JSON.stringify({ text }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            console.log(data);
            if (data.message && data.message.content) {
                setResponse(data.message.content);
            } else {
                setResponse('Unexpected response structure');
            }
        } catch (error) {
            console.error('Error fetching completion:', error);
            setResponse('Error fetching completion');
        }
    }

    const noMessages = true;
    return (
        <div>
            {noMessages ? (
                <>
                    <p>The Ultimate place for booking rooms!
                        We hope you enjoy!
                    </p>
                    <br/>
                    {/*<PromptSuggestionRow />*/}
                    {/* Show the messages here */}
                    {/* <LoadingBubble /> */}
                </>
            ) : null}

            <input onChange={e => setText(e.target.value)}></input>
            <button onClick={getCompletion}>Submit</button>
            <span>Response: {response}</span>
        </div>
    );
}

export default GenerativeChatbot;
