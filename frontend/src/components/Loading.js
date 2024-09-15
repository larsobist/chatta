const LoadingScreen = () => {
    return (
        <div className="chat-container">
            <div className="info-container">
                {/* Branding for the application */}
                <div className="chatta-name">
                    CHATTA
                </div>

                {/* Message box indicating the loading process */}
                <div className="chat-box">
                    <div className="chat-message bot">
                        Please wait a few moments to load the backend
                    </div>
                    <div className="chat-message bot">
                        This may take a couple minutes
                    </div>
                    {/* Typing indicator to simulate activity */}
                    <div className="chat-message bot">
                        <div className="typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoadingScreen;
