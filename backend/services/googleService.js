const { findBooking, createBooking, deleteBooking, updateBooking } = require('./bookingService');

const handleDialogflowRequest = async (data) => {
    const intentName = data.fulfillmentInfo.tag;
    const dateObj = data.sessionInfo.parameters.date || {};
    const newDateObj = data.sessionInfo.parameters.new_date || {};

    console.log(data.sessionInfo.parameters)

    const formattedDate = dateObj.year ? `${dateObj.year}-${String(dateObj.month).padStart(2, '0')}-${String(dateObj.day).padStart(2, '0')}` : null;
    const formattedNewDate = newDateObj.year ? `${newDateObj.year}-${String(newDateObj.month).padStart(2, '0')}-${String(newDateObj.day).padStart(2, '0')}` : null;

    const functionArgs = {};
    if (formattedDate) functionArgs.date = formattedDate;
    if (data.sessionInfo.parameters.room) functionArgs.roomNumber = data.sessionInfo.parameters.room.toString();
    if (data.sessionInfo.parameters.timeslot) functionArgs.timeSlot = data.sessionInfo.parameters.timeslot;
    if (formattedNewDate) functionArgs.new_date = formattedNewDate;
    if (data.sessionInfo.parameters.new_room) functionArgs.new_roomNumber = data.sessionInfo.parameters.new_room.toString();
    if (data.sessionInfo.parameters.new_timeslot) functionArgs.new_timeSlot = data.sessionInfo.parameters.new_timeslot;

    try {
        switch (intentName) {
            case 'findBooking':
                return await handleFindBooking(functionArgs);
            case 'createBooking':
                return await handleCreateBooking(functionArgs);
            case 'deleteBooking':
                return await handleDeleteBooking(functionArgs);
            case 'updateBooking':
                return await handleUpdateBooking(functionArgs);
            default:
                return {
                    fulfillment_response: {
                        messages: [
                            {
                                text: {
                                    text: [`Intent ${intentName} not handled in the webhook.`]
                                }
                            }
                        ]
                    }
                };
        }
    } catch (error) {
        console.error(`Error handling intent ${intentName}:`, error);
        return {
            fulfillment_response: {
                messages: [
                    {
                        text: {
                            text: [`Failed to handle intent ${intentName}.`]
                        }
                    }
                ]
            }
        };
    }
};

const handleFindBooking = async (functionArgs) => {
    try {
        const findResult = await findBooking(functionArgs);
        const bookingsText = findResult.map(booking =>
            `Room: ${booking.roomNumber}, Date: ${booking.date}, Time Slot: ${booking.timeSlot}`
        ).join('\n');

        return {
            fulfillment_response: {
                messages: [
                    {
                        text: {
                            text: [`Your bookings:\n${bookingsText}`]
                        }
                    }
                ]
            }
        };
    } catch (error) {
        console.error('Error finding booking:', error);
        return {
            fulfillment_response: {
                messages: [
                    {
                        text: {
                            text: ['Failed to find booking.']
                        }
                    }
                ]
            }
        };
    }
};

const handleCreateBooking = async (functionArgs) => {
    try {
        await createBooking(functionArgs);
        return {
            fulfillment_response: {
                messages: [
                    {
                        text: {
                            text: ['Booking created successfully.']
                        }
                    }
                ]
            }
        };
    } catch (error) {
        console.error('Error creating booking:', error);
        return {
            fulfillment_response: {
                messages: [
                    {
                        text: {
                            text: ['Failed to create booking.']
                        }
                    }
                ]
            }
        };
    }
};

const handleDeleteBooking = async (functionArgs) => {
    try {
        await deleteBooking(functionArgs);
        return {
            fulfillment_response: {
                messages: [
                    {
                        text: {
                            text: ['Booking deleted successfully.']
                        }
                    }
                ]
            }
        };
    } catch (error) {
        console.error('Error deleting booking:', error);
        return {
            fulfillment_response: {
                messages: [
                    {
                        text: {
                            text: ['Failed to delete booking.']
                        }
                    }
                ]
            }
        };
    }
};

const handleUpdateBooking = async (functionArgs) => {
    try {
        await updateBooking(functionArgs);
        return {
            fulfillment_response: {
                messages: [
                    {
                        text: {
                            text: ['Booking updated successfully.']
                        }
                    }
                ]
            }
        };
    } catch (error) {
        console.error('Error updating booking:', error);
        return {
            fulfillment_response: {
                messages: [
                    {
                        text: {
                            text: ['Failed to update booking.']
                        }
                    }
                ]
            }
        };
    }
};

module.exports = {
    handleDialogflowRequest,
};
