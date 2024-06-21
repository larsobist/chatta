import './App.scss';
import Chatbots from "./components/chatbots/Chatbots";
import AvatarGroup from "@mui/material/AvatarGroup";
import Avatar from "@mui/material/Avatar";
import { blue, cyan, indigo, lightBlue } from "@mui/material/colors";
import React, { useState } from "react";

const App = () => {
    const initialAvatar = { initial: "L", name: "Lars", color: indigo[500] };

    const [selectedAvatar, setSelectedAvatar] = useState(initialAvatar);

    const avatars = [
        { initial: "L", name: "Lars", color: indigo[500] },
        { initial: "P", name: "Peter", color: blue[500] },
        { initial: "N", name: "Niels", color: lightBlue[500] },
        { initial: "O", name: "Olaf", color: cyan[500] }
    ];

    const handleAvatarClick = (index) => {
        setSelectedAvatar(avatars[index]);
    };

    const getMenuStyle = () => {
        if (selectedAvatar) {
            return { backgroundColor: selectedAvatar.color };
        }
        return {};
    };

    return (
        <div>
            <div className="menu" style={getMenuStyle()}>
                <div className="logo">
                    chatta
                    {selectedAvatar && (
                        <span> for {selectedAvatar.name}</span>
                    )}
                </div>

                <div className="user-selection">
                    <div className="vertical-center">
                        Anderer Nutzer:
                    </div>
                    <AvatarGroup max={4} className="avatar-group">
                        {avatars.map((avatar, index) => (
                            <Avatar
                                key={index}
                                sx={{ bgcolor: avatar.color }}
                                className="avatar"
                                onClick={() => handleAvatarClick(index)}
                            >
                                {avatar.initial}
                            </Avatar>
                        ))}
                    </AvatarGroup>
                </div>
            </div>

            <div className="app">
                <Chatbots />
            </div>
        </div>
    );
}

export default App;
