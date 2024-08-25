import React, { useState } from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useTranslation } from 'react-i18next';
import Bookings from './Bookings';
import Rooms from './Rooms';
import './Overviews.scss';

const Overviews = ({ selectedUser }) => {
    const [view, setView] = useState('bookings');
    const { t } = useTranslation();

    const handleViewChange = (event, newView) => {
        if (newView !== null) {
            setView(newView);
        }
    };

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
            {view === 'bookings' ? <Bookings selectedUser={selectedUser} /> : <Rooms selectedUser={selectedUser} />}
        </div>
    );
};

export default Overviews;
