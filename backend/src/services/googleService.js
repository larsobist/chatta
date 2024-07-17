const { findBooking, createBooking, deleteBooking, updateBooking } = require('./bookingService');

const handleDialogflowRequest = async (data) => {
    const intentName = data.fulfillmentInfo.tag;
    const dateObj = data.sessionInfo.parameters.date || {};
    const newDateObj = data.sessionInfo.parameters.new_date || {};

    console.log(data.sessionInfo.parameters);

    const formattedDate = formatDateString(dateObj);
    const formattedNewDate = formatDateString(newDateObj);

    const functionArgs = createFunctionArgs(data, formattedDate, formattedNewDate);

    try {
        switch (intentName) {
            case 'findBooking':
                await handleFindBooking(functionArgs);
                break;
            case 'createBooking':
                await handleCreateBooking(functionArgs);
                break;
            case 'deleteBooking':
                await handleDeleteBooking(functionArgs);
                break;
            case 'updateBooking':
                await handleUpdateBooking(functionArgs);
                break;
            default:
                console.log(`Intent ${intentName} not handled in the webhook.`);
        }
    } catch (error) {
        console.error(`Error handling intent ${intentName}:`, error);
    }
};

const formatDateString = (dateObj) => {
    return dateObj.year ? `${dateObj.year}-${String(dateObj.month).padStart(2, '0')}-${String(dateObj.day).padStart(2, '0')}` : null;
};

const createFunctionArgs = (data, formattedDate, formattedNewDate) => {
    const functionArgs = {};
    if (formattedDate) functionArgs.date = formattedDate;
    if (data.sessionInfo.parameters.room) functionArgs.roomNumber = data.sessionInfo.parameters.room.toString();
    if (data.sessionInfo.parameters.timeslot) functionArgs.timeSlot = data.sessionInfo.parameters.timeslot;
    if (formattedNewDate) functionArgs.new_date = formattedNewDate;
    if (data.sessionInfo.parameters.new_room) functionArgs.new_roomNumber = data.sessionInfo.parameters.new_room.toString();
    if (data.sessionInfo.parameters.new_timeslot) functionArgs.new_timeSlot = data.sessionInfo.parameters.new_timeslot;
    return functionArgs;
};

const handleFindBooking = async (functionArgs) => {
    try {
        await findBooking(functionArgs);
    } catch (error) {
        console.error('Error finding booking:', error);
    }
};

const handleCreateBooking = async (functionArgs) => {
    try {
        await createBooking(functionArgs);
    } catch (error) {
        console.error('Error creating booking:', error);
    }
};

const handleDeleteBooking = async (functionArgs) => {
    try {
        await deleteBooking(functionArgs);
    } catch (error) {
        return { message: 'Error updating booking:', error };
    }
};

const handleUpdateBooking = async (functionArgs) => {
    try {
        await updateBooking(functionArgs);
    } catch (error) {
        return { message: 'Error updating booking:', error };
    }
};

module.exports = { handleDialogflowRequest };
