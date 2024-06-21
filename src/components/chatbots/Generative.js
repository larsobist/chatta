import React, { useState } from 'react';

const GenerativeChatbot = () => {
    const [text, setText] = useState('');
    const [response, setResponse] = useState('');

    const getCompletion = async () => {
        const response = await fetch('http://localhost:8000/chat', {
            method: 'POST',
            body: JSON.stringify({ text }),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        console.log(data);
        setResponse(data.message.content);
    }

    const noMessages = true;
    return (
        <div>
            {noMessages ? (
                <>
                    <p>The Ultimate place for Star Wars super fans!
                        Ask StarGPT anything about the fantastic topic of Star Wars and it will come back with the most
                        up-to-date answers.
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
