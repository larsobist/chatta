import './App.scss';
import Chatbots from "./components/chatbots/Chatbots";
import Menu from "./components/header/Menu";
import React, { useState } from "react";

const App = () => {
    const [selectedUser, setSelectedUser] = useState(null);

    const handleUserChange = (user) => {
        setSelectedUser(user);
    };

    return (
        <div>
            <Menu selectedUser={selectedUser} setSelectedUser={handleUserChange} />
            <div className="app">
                {selectedUser && <Chatbots key={selectedUser.id} selectedUser={selectedUser} />}
            </div>
        </div>
    );
}

export default App;
