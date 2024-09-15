import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import AvatarGroup from "@mui/material/AvatarGroup";
import Avatar from "@mui/material/Avatar";
import './Menu.scss';
import LoadingScreen from '../Loading.js';

const Menu = ({ selectedUser, setSelectedUser, setLanguage }) => {
    const { t } = useTranslation();  // Hook for translations
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);  // Track loading state
    const [error, setError] = useState(null);  // Track error state

    // Memoize color array for consistent user avatar colors
    const colors = useMemo(() => [
        "rgb(63, 81, 181)",  // #3f51b5
        "rgb(33, 150, 243)", // #2196f3
        "rgb(0, 188, 212)"   // #00bcd4
    ], []);

    // Fetch users from the backend and set colors to each user
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Fetch users and introduce a 5-second delay
                const fetchPromise = fetch(`${process.env.REACT_APP_BACKEND_LOCAL_URL}/users`, {
                    headers: { 'User-Agent': 'chatta/0.0.2' }
                });

                const delayPromise = new Promise(resolve => setTimeout(resolve, 5000));
                const [response] = await Promise.all([fetchPromise, delayPromise]);

                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }

                const data = await response.json();
                const usersWithColors = data.map((user, index) => ({
                    ...user,
                    color: colors[index % colors.length]  // Assign colors in a loop
                }));
                setUsers(usersWithColors);

                // Set the initial user if no user is selected
                if (usersWithColors.length > 0 && !selectedUser) {
                    const initialUser = usersWithColors[0];
                    setSelectedUser(initialUser);
                    await updateSelectedUser(initialUser);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
                setError(error.message);
            } finally {
                setLoading(false);  // Stop loading after fetch and delay
            }
        };

        fetchUsers();
    }, [setSelectedUser, colors]);

    // Handle user avatar click to select a user
    const handleUserClick = async (index) => {
        const user = users[index];
        setSelectedUser(user);
        await updateSelectedUser(user);  // Update selected user in the backend
    };

    // Update the selected user in the backend
    const updateSelectedUser = async (user) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_LOCAL_URL}/selectedUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'chatta/0.0.2'
                },
                body: JSON.stringify({ selectedUser: user })
            });
            if (!response.ok) {
                throw new Error('Failed to update selected user');
            }
        } catch (error) {
            console.error('Error updating selected user:', error);
        }
    };

    // Switch language based on selected avatar
    const handleLanguageSwitch = (code) => {
        setLanguage(code);
    };

    // Language options for switching
    const languages = [
        { code: 'de', color: 'rgb(189, 189, 189)' },
        { code: 'en', color: 'rgb(224, 224, 224)' }
    ];

    // Show loading screen or error if necessary
    if (loading || error) {
        return <LoadingScreen />;
    }

    return (
        <div className="menu">
            {/* Language selection section */}
            <div className="lang-selection">
                <div className="section-description">{t('lang')}</div>
                <AvatarGroup className="language-group">
                    {languages.map((language, index) => (
                        <Avatar
                            key={index}
                            sx={{ bgcolor: language.color }}
                            className="avatar"
                            onClick={() => handleLanguageSwitch(language.code)}
                        >
                            {language.code.toUpperCase()}
                        </Avatar>
                    ))}
                </AvatarGroup>
            </div>

            {/* User selection section */}
            <div className="user-selection">
                <div className="section-description">{t('user')}</div>
                <AvatarGroup max={4} className="avatar-group">
                    {users.map((user, index) => (
                        <Avatar
                            key={index}
                            sx={{ bgcolor: user.color }}
                            className="avatar"
                            onClick={() => handleUserClick(index)}
                        >
                            {user.name[0]}
                        </Avatar>
                    ))}
                </AvatarGroup>
            </div>
        </div>
    );
};

export default Menu;
