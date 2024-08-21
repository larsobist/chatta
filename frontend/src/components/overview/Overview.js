import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { io } from 'socket.io-client';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import './Overview.scss';
import { useTranslation } from 'react-i18next';

const Overview = ({ selectedUser }) => {
    const [bookingRows, setBookingRows] = useState([]);
    const [roomRows, setRoomRows] = useState([]);
    const [view, setView] = useState('bookings'); // State to track the current view
    const { t } = useTranslation();

    useEffect(() => {
        const socket = io(process.env.REACT_APP_BACKEND_LOCAL_URL);

        socket.on('connect', () => {
            console.log('Successfully connected to the server');
        });

        socket.on('bookingChanged', () => {
            fetchBookings();
        });
        socket.on('userChanged', () => {
            fetchBookings();
            fetchPossibleRooms()
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from the server');
        });

        // Cleanup on component unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_LOCAL_URL}/user-bookings`, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'chatta/0.0.2'
                },
            });
            const data = await response.json();

            // Map _id to id
            const rowsWithId = data.map((item, index) => ({ id: index + 1, ...item }));
            setBookingRows(rowsWithId);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const fetchPossibleRooms = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_LOCAL_URL}/user-possible-rooms`, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'chatta/0.0.2'
                },
            });
            const data = await response.json();

            console.log(data);
            // Map _id to id and translate equipment
            const rowsWithId = data.map((item, index) => ({
                id: index + 1,
                ...item,
                equipment: item.equipment.map(equip => t(equip)).join(', ')
            }));
            setRoomRows(rowsWithId);
        } catch (error) {
            console.error('Error fetching possible rooms:', error);
        }
    };

    useEffect(() => {
        if (view === 'bookings') {
            fetchBookings();
        } else if (view === 'rooms') {
            fetchPossibleRooms();
        }
    }, [selectedUser, view]);

    const handleViewChange = (event, newView) => {
        if (newView !== null) {
            setView(newView);
        }
    };

    // Define columns based on the view
    const bookingColumns = [
        { field: 'roomNumber', headerName: t('roomNumber'), flex: 1, disableColumnMenu: true },
        { field: 'date', headerName: t('date'), flex: 1, disableColumnMenu: true },
        { field: 'timeSlot', headerName: t('time'), flex: 1, disableColumnMenu: true },
    ];

    const roomColumns = [
        { field: 'roomNumber', headerName: t('roomNumber'), flex: 1, disableColumnMenu: true },
        { field: 'equipment', headerName: t('equipment'), flex: 3, disableColumnMenu: true },
    ];

    return (
        <div>
            <div className="info-container">
                <h1>{t('overviews')}</h1>
                <ToggleButtonGroup
                    value={view}
                    exclusive
                    onChange={handleViewChange}
                    aria-label="view toggle"
                >
                    <ToggleButton value="bookings">
                        {t('bookings')}
                    </ToggleButton>
                    <ToggleButton value="rooms">
                        {t('rooms')}
                    </ToggleButton>
                </ToggleButtonGroup>
            </div>
            <div className="table">
                <DataGrid
                    rows={view === 'bookings' ? bookingRows : roomRows}
                    columns={view === 'bookings' ? bookingColumns : roomColumns}
                    disableColumnMenu
                    disableSelectionOnClick
                    hideFooter
                />
            </div>
        </div>
    );
}

export default Overview;
