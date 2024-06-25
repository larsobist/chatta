import './App.scss';
import Chatbots from "./components/chatbots/Chatbots";
import AvatarGroup from "@mui/material/AvatarGroup";
import Avatar from "@mui/material/Avatar";
import { blue, cyan, indigo, lightBlue } from "@mui/material/colors";
import React, { useState, useEffect } from "react";

const App = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);

    // Define a set of colors
    const colors = [indigo[500], blue[500], lightBlue[500], cyan[500]];

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:8000/users');
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await response.json();
                // Assign colors to users
                const usersWithColors = data.map((user, index) => ({
                    ...user,
                    color: colors[index % colors.length] // Cycle through colors
                }));
                console.log(usersWithColors);
                setUsers(usersWithColors);
                if (usersWithColors.length > 0) {
                    setSelectedUser(usersWithColors[0]); // Set the first user as the selected user
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    const handleUserClick = (index) => {
        setSelectedUser(users[index]);
    };

    const getMenuStyle = () => {
        if (selectedUser) {
            return { backgroundColor: selectedUser.color };
        }
        return {};
    };

    return (
        <div>
            <div className="menu" style={getMenuStyle()}>
                <div className="logo">
                    chatta
                    {selectedUser && (
                        <span> for {selectedUser.name}</span>
                    )}
                </div>

                <div className="user-selection">
                    <div className="vertical-center">
                        Anderer Nutzer:
                    </div>
                    <AvatarGroup max={4} className="avatar-group">
                        {users.map((user, index) => (
                            <Avatar
                                key={index}
                                sx={{ bgcolor: user.color }}
                                className="avatar"
                                onClick={() => handleUserClick(index)}
                            >
                                {user.initial}
                            </Avatar>
                        ))}
                    </AvatarGroup>
                </div>
            </div>

            <div className="app">
                {selectedUser && <Chatbots selectedUser={selectedUser} />}
            </div>
        </div>
    );
}

export default App;
