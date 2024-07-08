import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { io } from 'socket.io-client';
import './Overview.scss';
import { useTranslation } from 'react-i18next';

const Overview = ({ selectedUser }) => {
    const [rows, setRows] = useState([]);
    const { t } = useTranslation();

    useEffect(() => {
        const socket = io(process.env.REACT_APP_BACKEND_LOCAL_URL);

        socket.on('connect', () => {
            console.log('Successfully connected to the server');
        });

        socket.on('bookingChanged', () => {
            fetchBookings();
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
            setRows(rowsWithId);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [selectedUser]);

    const columns = [
        { field: 'roomNumber', headerName: t('roomNumber'), flex: 1, disableColumnMenu: true },
        { field: 'date', headerName: t('date'), flex: 1, disableColumnMenu: true },
        { field: 'timeSlot', headerName: t('time'), flex: 1, disableColumnMenu: true },
    ];

    return (
        <div>
            <h1>{selectedUser?.name ?? 'User'}'s {t('bookings')}</h1>
            <div className="table">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    disableColumnMenu
                    disableSelectionOnClick
                    hideFooter
                />
            </div>
        </div>
    );
}

export default Overview;
