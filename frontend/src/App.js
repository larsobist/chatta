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

    const hexToRgba = (hex, alpha = 0.1) => {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex[1] + hex[2], 16);
            g = parseInt(hex[3] + hex[4], 16);
            b = parseInt(hex[5] + hex[6], 16);
        }
        return `rgba(${r},${g},${b},${alpha})`;
    };

    return (
        <div>
            <Menu selectedUser={selectedUser} setSelectedUser={handleUserChange} language={language} setLanguage={handleLanguageChange} />
            <div className="app"
                 style={{backgroundColor: selectedUser ? hexToRgba(selectedUser.color) : 'transparent'}}>
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
