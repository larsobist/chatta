import React, {useState, useEffect, useMemo} from "react";
import {useTranslation} from 'react-i18next';
import AvatarGroup from "@mui/material/AvatarGroup";
import Avatar from "@mui/material/Avatar";
import {blue, cyan, indigo, lightBlue} from "@mui/material/colors";
import './Menu.scss';

const Menu = ({selectedUser, setSelectedUser, language, setLanguage}) => {
    const {t} = useTranslation();
    const [users, setUsers] = useState([]);
    const colors = useMemo(() => [indigo[500], blue[500], lightBlue[500], cyan[500]], []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_LOCAL_URL}/users`, {
                    headers: {
                        'User-Agent': 'chatta/0.0.2'
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await response.json();
                const usersWithColors = data.map((user, index) => ({
                    ...user,
                    color: colors[index % colors.length]
                }));
                setUsers(usersWithColors);

                // Set the initial selected user to the first element and call the backend
                if (usersWithColors.length > 0 && !selectedUser) {
                    const initialUser = usersWithColors[0];
                    setSelectedUser(initialUser);
                    await updateSelectedUser(initialUser);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, [selectedUser, setSelectedUser, colors]);

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
                body: JSON.stringify({selectedUser: user})
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
        {code: 'en', color: blue[500]},
        {code: 'de', color: cyan[500]}
    ];

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
                            sx={{bgcolor: language.color}}
                            className="avatar"
                            onClick={() => handleLanguageSwitch(language.code)}
                        >
                            {language.code.toUpperCase()} {/* Display language code */}
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
                            sx={{bgcolor: user.color}}
                            className="avatar"
                            onClick={() => handleUserClick(index)}
                        >
                            {user.name[0]} {/* Assuming user object has a 'name' property */}
                        </Avatar>
                    ))}
                </AvatarGroup>
            </div>
        </div>
    );
};

export default Menu;
