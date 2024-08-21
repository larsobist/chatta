import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import AvatarGroup from "@mui/material/AvatarGroup";
import Avatar from "@mui/material/Avatar";
import './Menu.scss';
import LoadingScreen from '../Loading.js';

const Menu = ({ selectedUser, setSelectedUser, setLanguage }) => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true); // Track loading state
    const [error, setError] = useState(null); // Track error state
    const colors = useMemo(() => [
        "rgb(63, 81, 181)",  // #3f51b5
        "rgb(33, 150, 243)", // #2196f3
        "rgb(3, 169, 244)",  // #03a9f4
        "rgb(0, 188, 212)"   // #00bcd4
    ], []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                console.log('Fetching users...');

                // Fetch users and delay by 5 seconds in parallel
                const fetchPromise = fetch(`${process.env.REACT_APP_BACKEND_LOCAL_URL}/users`, {
                    headers: {
                        'User-Agent': 'chatta/0.0.2'
                    }
                });

                // Introduce a 5-second delay
                const delayPromise = new Promise(resolve => setTimeout(resolve, 5000));

                // Wait for both the fetch and the delay to complete
                const [response] = await Promise.all([fetchPromise, delayPromise]);

                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }

                const data = await response.json();
                console.log('Fetched data:', data);
                const usersWithColors = data.map((user, index) => ({
                    ...user,
                    color: colors[index % colors.length]
                }));
                setUsers(usersWithColors);
                console.log('Users set:', usersWithColors);

                if (usersWithColors.length > 0 && !selectedUser) {
                    const initialUser = usersWithColors[0];
                    setSelectedUser(initialUser);
                    await updateSelectedUser(initialUser);
                }

            } catch (error) {
                console.error('Error fetching users:', error);
                setError(error.message);
            } finally {
                setLoading(false); // Set loading to false after the delay and fetch are complete
            }
        };

        fetchUsers();
    }, [setSelectedUser, colors]);

    const handleUserClick = async (index) => {
        const user = users[index];
        setSelectedUser(user);
        await updateSelectedUser(user);
    };

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

    const handleLanguageSwitch = (code) => {
        setLanguage(code);
    };

    const languages = [
        { code: 'en', color: 'rgb(189, 189, 189)' },
        { code: 'de', color: 'rgb(224, 224, 224)' }
    ];

    if (loading || error) {
        return <LoadingScreen />;
    }

    return (
        <div className="menu">
            <div className="lang-selection">
                <div className="section-description">
                    {t('lang')}
                </div>
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
            <div className="user-selection">
                <div className="section-description">
                    {t('user')}
                </div>
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