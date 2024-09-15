import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { io } from "socket.io-client";

const Rooms = ({ selectedUser }) => {
    const [roomRows, setRoomRows] = useState([]);  // State to store room data
    const { t } = useTranslation();  // Hook for translations

    // Fetch the possible rooms accessible to the current user
    const fetchPossibleRooms = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_LOCAL_URL}/user-possible-rooms`, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'chatta/0.0.2'
                },
            });
            const data = await response.json();

            // Map room data and translate equipment list
            const rowsWithId = data.map((item, index) => ({
                id: index + 1,
                ...item,
                equipment: item.equipment.map(equip => t(equip)).join(', ')  // Translate and join equipment array
            }));
            setRoomRows(rowsWithId);  // Update state with room data
        } catch (error) {
            console.error('Error fetching possible rooms:', error);
        }
    };

    // Set up WebSocket connection to refetch rooms when the user changes
    useEffect(() => {
        const socket = io(process.env.REACT_APP_BACKEND_URL);

        socket.on('userChanged', () => {
            fetchPossibleRooms();  // Refetch rooms when user changes
        });

        // Cleanup: disconnect the socket when the component unmounts
        return () => {
            socket.disconnect();
        };
    }, []);

    // Fetch possible rooms when the selected user changes
    useEffect(() => {
        fetchPossibleRooms();
    }, [selectedUser]);

    // Define columns for the DataGrid
    const roomColumns = [
        { field: 'roomNumber', headerName: t('roomNumber'), flex: 1, disableColumnMenu: true },
        { field: 'equipment', headerName: t('equipment'), flex: 3, disableColumnMenu: true },
    ];

    return (
        <div className="table">
            <DataGrid
                rows={roomRows}  // Data to be displayed in the table
                columns={roomColumns}  // Column definitions
                disableColumnMenu  // Disable column menu
                disableSelectionOnClick  // Prevent row selection on click
                hideFooter  // Hide the pagination footer
            />
        </div>
    );
};

export default Rooms;
