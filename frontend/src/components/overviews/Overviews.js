import React, { useState } from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useTranslation } from 'react-i18next';
import Bookings from './Bookings';
import Rooms from './Rooms';
import './Overviews.scss';

const Overviews = ({ selectedUser }) => {
    const [view, setView] = useState('bookings');  // State to track the current view ('bookings' or 'rooms')
    const { t } = useTranslation();  // Hook for translations

    // Handle switching between 'bookings' and 'rooms' views
    const handleViewChange = (event, newView) => {
        if (newView !== null) {
            setView(newView);  // Update the view state
        }
    };

    return (
        <div>
            <div className="info-container">
                <h1>{t('overviews')}</h1>
                {/* ToggleButtonGroup to switch between bookings and rooms */}
                <ToggleButtonGroup
                    value={view}
                    exclusive
                    onChange={handleViewChange}
                    aria-label="view toggle"
                >
                    <ToggleButton value="bookings">
                        {t('bookings')}  {/* Translated label for bookings */}
                    </ToggleButton>
                    <ToggleButton value="rooms">
                        {t('rooms')}  {/* Translated label for rooms */}
                    </ToggleButton>
                </ToggleButtonGroup>
            </div>

            {/* Conditionally render Bookings or Rooms component based on the current view */}
            {view === 'bookings' ? <Bookings selectedUser={selectedUser} /> : <Rooms selectedUser={selectedUser} />}
        </div>
    );
};

export default Overviews;
