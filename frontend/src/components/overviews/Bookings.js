import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { DataGrid } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';

const Bookings = ({ selectedUser }) => {
    const [bookingRows, setBookingRows] = useState([]);  // State to store booking data rows
    const { t } = useTranslation();  // Hook for translations

    // Fetch bookings from the backend
    const fetchBookings = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_LOCAL_URL}/user-bookings`, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'chatta/0.0.2'
                },
            });
            const data = await response.json();

            // Add a unique `id` field to each booking item for DataGrid
            const rowsWithId = data.map((item, index) => ({ id: index + 1, ...item }));
            setBookingRows(rowsWithId);  // Update state with the fetched bookings
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    // Set up WebSocket connection to listen for booking or user changes
    useEffect(() => {
        const socket = io(process.env.REACT_APP_BACKEND_URL);

        socket.on('connect', () => {
            console.log('Successfully connected to the server');
        });

        // Refetch bookings when a booking is changed or the user is changed
        socket.on('bookingChanged', () => {
            fetchBookings();
        });

        socket.on('userChanged', () => {
            fetchBookings();
        });

        // Cleanup: disconnect the WebSocket when the component is unmounted
        return () => {
            socket.disconnect();
        };
    }, []);

    // Fetch bookings whenever the selected user changes
    useEffect(() => {
        fetchBookings();
    }, [selectedUser]);

    // Define the columns for the DataGrid
    const bookingColumns = [
        { field: 'roomNumber', headerName: t('roomNumber'), flex: 1, disableColumnMenu: true },
        { field: 'date', headerName: t('date'), flex: 1, disableColumnMenu: true },
        { field: 'timeSlot', headerName: t('time'), flex: 1, disableColumnMenu: true },
    ];

    return (
        <div className="table">
            <DataGrid
                rows={bookingRows}  // Data to be displayed in the table
                columns={bookingColumns}  // Column definitions
                disableColumnMenu
                disableSelectionOnClick
                hideFooter  // Hide the pagination footer
            />
        </div>
    );
};

export default Bookings;
