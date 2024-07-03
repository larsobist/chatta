import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { io } from 'socket.io-client';
import './Overview.scss';  // Import the CSS file for styling

const columns = [
    { field: 'roomNumber', headerName: 'Room Number', flex: 1, disableColumnMenu: true },
    { field: 'date', headerName: 'Date', flex: 1, disableColumnMenu: true },
    { field: 'timeSlot', headerName: 'Time Slot', flex: 1, disableColumnMenu: true },
];

const Overview = ({ selectedUser }) => {
    const [rows, setRows] = useState([]);

    useEffect(() => {
        const socket = io(process.env.REACT_APP_LOCAL_URL);

        socket.on('connect', () => {
            console.log('Successfully connected to the server');
        });

        socket.on('bookingChanged', () => {
            console.log('Booking data changed, fetching updated bookings...');
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
            const response = await fetch(`${process.env.REACT_APP_LOCAL_URL}/user-bookings`, {
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

    return (
        <div>
            <h1>{selectedUser?.name ?? 'User'}'s Buchungen</h1>
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
