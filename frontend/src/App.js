import React, { useState } from "react";
import './App.scss';
import './i18n';
import General from "./components/chatbots/General";
import Menu from "./components/menu/Menu";
import Overviews from "./components/overviews/Overviews";
import i18n from './i18n';

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

    const rgbToRgba = (rgb, alpha = 0.1) => {
        return rgb.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
    };

    return (
        <div>
            <Menu selectedUser={selectedUser} setSelectedUser={handleUserChange} setLanguage={handleLanguageChange} />
            <div className="app"
                 style={{ backgroundColor: selectedUser ? rgbToRgba(selectedUser.color) : 'transparent' }}>
                {selectedUser && (
                    <div className="container">
                        <div className="chatbots">
                            <General key={selectedUser.id} selectedUser={selectedUser} language={language} />
                        </div>
                        <div className="overview">
                            <Overviews key={selectedUser.id} selectedUser={selectedUser} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
