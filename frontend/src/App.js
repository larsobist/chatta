import React, { useState } from "react";
import './App.scss';
import './i18n';
import Chatbots from "./components/chatbots/Chatbots";
import Menu from "./components/menu/Menu";
import Overview from "./components/overview/Overview";

const App = () => {
    const [selectedUser, setSelectedUser] = useState(null);

    const handleUserChange = (user) => {
        setSelectedUser(user);
    };

    return (
        <div>
            <Menu selectedUser={selectedUser} setSelectedUser={handleUserChange} />
            <div className="app">
                {selectedUser && (
                    <div className="container">
                        <div className="overview">
                            <Overview key={selectedUser.id} selectedUser={selectedUser} />
                        </div>
                        <div className="chatbots">
                            <Chatbots key={selectedUser.id} selectedUser={selectedUser} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;