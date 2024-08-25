import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';

const Rooms = ({ selectedUser }) => {
    const [roomRows, setRoomRows] = useState([]);
    const { t } = useTranslation();

    const fetchPossibleRooms = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_LOCAL_URL}/user-possible-rooms`, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'chatta/0.0.2'
                },
            });
            const data = await response.json();

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
        fetchPossibleRooms();
    }, [selectedUser]);

    const roomColumns = [
        { field: 'roomNumber', headerName: t('roomNumber'), flex: 1, disableColumnMenu: true },
        { field: 'equipment', headerName: t('equipment'), flex: 3, disableColumnMenu: true },
    ];

    return (
        <div className="table">
            <DataGrid
                rows={roomRows}
                columns={roomColumns}
                disableColumnMenu
                disableSelectionOnClick
                hideFooter
            />
        </div>
    );
};

export default Rooms;
