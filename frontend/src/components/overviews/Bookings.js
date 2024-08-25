import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';

const Bookings = ({ selectedUser }) => {
    const [bookingRows, setBookingRows] = useState([]);
    const { t } = useTranslation();

    const fetchBookings = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_LOCAL_URL}/user-bookings`, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'chatta/0.0.2'
                },
            });
            const data = await response.json();

            const rowsWithId = data.map((item, index) => ({ id: index + 1, ...item }));
            setBookingRows(rowsWithId);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [selectedUser]);

    const bookingColumns = [
        { field: 'roomNumber', headerName: t('roomNumber'), flex: 1, disableColumnMenu: true },
        { field: 'date', headerName: t('date'), flex: 1, disableColumnMenu: true },
        { field: 'timeSlot', headerName: t('time'), flex: 1, disableColumnMenu: true },
    ];

    return (
        <div className="table">
            <DataGrid
                rows={bookingRows}
                columns={bookingColumns}
                disableColumnMenu
                disableSelectionOnClick
                hideFooter
            />
        </div>
    );
};

export default Bookings;
