import React, { useState } from "react";
import './App.scss';
import './i18n';
import General from "./components/chatbots/General";
import Menu from "./components/menu/Menu";
import Overviews from "./components/overviews/Overviews";
import i18n from './i18n';

const App = () => {
    const [selectedUser, setSelectedUser] = useState(null);  // State to manage the selected user
    const [language, setLanguage] = useState(i18n.language);  // State to manage the selected language

    // Handle changes in the selected user
    const handleUserChange = (user) => {
        setSelectedUser(user);
    };

    // Handle changes in the language selection
    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        i18n.changeLanguage(lang);  // Update the i18n language setting
    };

    // Convert RGB color to RGBA with customizable alpha for transparency
    const rgbToRgba = (rgb, alpha = 0.1) => {
        return rgb.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
    };

    return (
        <div>
            {/* Render the Menu component and pass handlers for user and language changes */}
            <Menu selectedUser={selectedUser} setSelectedUser={handleUserChange} setLanguage={handleLanguageChange} />

            {/* Conditionally render content based on the selected user */}
            <div className="app"
                 style={{ backgroundColor: selectedUser ? rgbToRgba(selectedUser.color) : 'transparent' }}>
                {selectedUser && (
                    <div className="container">
                        {/* Render the General chatbot section */}
                        <div className="chatbots">
                            <General key={selectedUser.id} selectedUser={selectedUser} language={language} />
                        </div>

                        {/* Render the Overviews section */}
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
