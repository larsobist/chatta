import React, { useState } from "react";
import './App.scss';
import './i18n';
import Chatbots from "./components/chatbots/Chatbots";
import Menu from "./components/menu/Menu";
import Overview from "./components/overview/Overview";
import i18n from './i18n'; // Import the i18n instance

const App = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [language, setLanguage] = useState(i18n.language); // Manage language state here

    const handleUserChange = (user) => {
        setSelectedUser(user);
    };

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        i18n.changeLanguage(lang); // Change the language in i18n instance
    };

    return (
        <div>
            <Menu selectedUser={selectedUser} setSelectedUser={handleUserChange} language={language} setLanguage={handleLanguageChange} />
            <div className="app">
                {selectedUser && (
                    <div className="container">
                        <div className="chatbots">
                            <Chatbots key={selectedUser.id} selectedUser={selectedUser}
                                      language={language}/> {/* Pass language here */}
                        </div>
                        <div className="overview">
                            <Overview key={selectedUser.id} selectedUser={selectedUser}/>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
