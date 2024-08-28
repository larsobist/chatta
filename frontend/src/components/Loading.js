const LoadingScreen = () => {
    return (
        <div className="chat-container">
            <div className="info-container">
                <div className="chatta-name">
                    CHATTA
                </div>
                <div className="chat-box">
                    <div className="chat-message bot">
                        Please wait a few moments to load the backend
                    </div>
                    <div className="chat-message bot">
                        This may take a couple minutes
                    </div>
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