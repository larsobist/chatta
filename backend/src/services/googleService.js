const { findBooking, createBooking, deleteBooking, updateBooking, getAvailableRooms } = require('./bookingService');

// Main handler for Dialogflow requests, directing to the appropriate booking functions based on intent.
const handleDialogflowRequest = async (data) => {
    const intentName = data.fulfillmentInfo.tag;
    const dateObj = data.sessionInfo.parameters.date || {};
    const newDateObj = data.sessionInfo.parameters.new_date || {};
    const formattedDate = formatDateString(dateObj);
    const formattedNewDate = formatDateString(newDateObj);
    const functionArgs = createFunctionArgs(data, formattedDate, formattedNewDate);

    try {
        switch (intentName) {
            case 'findBooking':
                return await handleFindBooking(functionArgs);
            case 'createBooking':
                await handleCreateBooking(functionArgs);
                break;
            case 'deleteBooking':
                await handleDeleteBooking(functionArgs);
                break;
            case 'updateBooking':
                await handleUpdateBooking(functionArgs);
                break;
            case 'getAvailableRooms':
                return await handleGetAvailableRooms(functionArgs);
            default:
                console.log(`Intent ${intentName} not handled in the webhook.`);
        }
    } catch (error) {
        console.error(`Error handling intent ${intentName}:`, error);
    }
};

// Format date object into 'YYYY-MM-DD' format.
const formatDateString = (dateObj) => {
    return dateObj.year ? `${dateObj.year}-${String(dateObj.month).padStart(2, '0')}-${String(dateObj.day).padStart(2, '0')}` : null;
};

// Create function arguments based on Dialogflow session parameters.
const createFunctionArgs = (data, formattedDate, formattedNewDate) => {
    const functionArgs = {};
    if (formattedDate) functionArgs.date = formattedDate;
    if (data.sessionInfo.parameters.roomnumber) functionArgs.roomNumber = data.sessionInfo.parameters.roomnumber.toString();
    if (data.sessionInfo.parameters.timeslot) functionArgs.timeSlot = data.sessionInfo.parameters.timeslot;
    if (formattedNewDate) functionArgs.new_date = formattedNewDate;
    if (data.sessionInfo.parameters.new_roomnumber) functionArgs.new_roomNumber = data.sessionInfo.parameters.new_roomnumber.toString();
    if (data.sessionInfo.parameters.new_timeslot) functionArgs.new_timeSlot = data.sessionInfo.parameters.new_timeslot;
    if (data.sessionInfo.parameters.equipment) functionArgs.equipment = data.sessionInfo.parameters.equipment;
    return functionArgs;
};

// Handle the 'findBooking' intent and return a response with booking information.
const handleFindBooking = async (functionArgs) => {
    try {
        const result = await findBooking(functionArgs);
        const text = result.length > 0 ? result.map(booking => {
            return `Nr: ${booking.roomNumber}, ${booking.date}, ${booking.timeSlot}. `;
        }).join('\n') : 'Nichts gefunden für deine Kriterien';
        return {
            fulfillment_response: { messages: [{ text: { text: [`\n${text}`] }}]}
        };
    } catch (error) {
        console.error('Error finding booking:', error);
    }
};

// Handle the 'createBooking' intent.
const handleCreateBooking = async (functionArgs) => {
    try {
        await createBooking(functionArgs);
    } catch (error) {
        console.error('Error creating booking:', error);
    }
};

// Handle the 'deleteBooking' intent.
const handleDeleteBooking = async (functionArgs) => {
    try {
        await deleteBooking(functionArgs);
    } catch (error) {
        return { message: 'Error updating booking:', error };
    }
};

// Handle the 'updateBooking' intent.
const handleUpdateBooking = async (functionArgs) => {
    try {
        await updateBooking(functionArgs);
    } catch (error) {
        return { message: 'Error updating booking:', error };
    }
};

// Handle the 'getAvailableRooms' intent and return available rooms information.
const handleGetAvailableRooms = async (functionArgs) => {
    try {
        const result = await getAvailableRooms(functionArgs);
        const text = result.length > 0 ? result.map(room => {
            const equipmentList = room.equipment.join(', ');
            return `Nr: ${room.roomNumber}, Equipment: ${equipmentList}. `;
        }).join('\n') : 'Nothing found for your criteria';
        return {
            fulfillment_response: { messages: [{ text: { text: [`\n${text}`] }}]}
        };
    } catch (error) {
        return { message: 'Error fetching rooms:', error };
    }
};

module.exports = { handleDialogflowRequest };
