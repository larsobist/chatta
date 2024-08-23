const openai = require('../config/openai');
const { findBooking, createBooking, updateBooking, deleteBooking, getAvailableRooms } = require('./bookingService');

let messageHistory = [];

const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
};

const initializeMessageHistory = (language) => {
    console.log(language)
    const currentDate = getCurrentDate();
    messageHistory.push({
        role: "system",
        content: `
        You are a helpful room booking assistant for a company called chatta. 
        Your primary role is to assist users with all necessary information and tasks related to room reservations, 
        including checking room availability, viewing equipment options, and managing room details. 
        You can also help with related queries, such as requests for specific equipment (e.g., a projector) within rooms.
        The functions you can perform include:
        1. find_booking: Find a reservation with the given parameters or display all bookings if no parameters are provided.
        2. create_booking: Create a new reservation with the specified date and time slot. Other parameters are optional.
        3. delete_booking: Delete an existing reservation with the specified parameters.
        4. update_booking: Update an existing reservation with the given parameters.
        5. get_available_rooms: List all rooms available to the user based on the specified parameters. Sometimes the user asks to create a booking with that data.
        When a request like creating a booking, updating, or deleting, send a validation message.
        Today's date is ${currentDate}.
        If a user asks about anything outside the scope of room-related information, gently remind them that your assistance is focused on room reservations and related services.
        Keep your answers compact.
        `
    });
};

const addMessageToHistory = (role, content) => {
    messageHistory.push({
        role: role,
        content: content
    });
};

const handleToolCalls = async (toolCalls) => {
    const availableFunctions = {
        find_booking: findBooking,
        create_booking: createBooking,
        delete_booking: deleteBooking,
        update_booking: updateBooking,
        get_available_rooms: getAvailableRooms
    };

    for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const functionToCall = availableFunctions[functionName];
        const functionArgs = JSON.parse(toolCall.function.arguments);

        try {
            const functionResponse = await functionToCall(functionArgs);
            addMessageToHistory("assistant", JSON.stringify(functionResponse));
        } catch (error) {
            addMessageToHistory("assistant", JSON.stringify({ error: error.message }));
        }
    }
};

const handleOpenAIRequest = async (textInput, language) => {
    initializeMessageHistory(language);
    addMessageToHistory("user", textInput);

    const tools = [
        {
            type: "function",
            function: {
                name: "find_booking",
                description: "Find a reservation with the given params or show all when no params are given",
                parameters: {
                    type: "object",
                    properties: {
                        date: { type: "string", description: "The date of the booking, e.g., 2024-06-26" },
                        timeSlot: { type: "string", description: "The time of the booking, e.g., 11:00, always in HH:MM format" },
                        roomNumber: { type: "string", description: "The room number for the booking" },
                        equipment: { type: "array", items: { type: "string" }, description: "List of equipment needed in the room" }
                    },
                    required: []
                }
            }
        },
        {
            type: "function",
            function: {
                name: "create_booking",
                description: "Create a reservation with the params date and timeslot, after receiving that input, ask if they want a specific room based on the roomnumber or equipment.",
                parameters: {
                    type: "object",
                    properties: {
                        roomNumber: { type: "string", description: "The room number for the booking" },
                        date: { type: "string", description: "The date of the booking, e.g., 2024-06-26" },
                        timeSlot: { type: "string", description: "The time of the booking, e.g., 11:00, always in HH:MM format" },
                        equipment: { type: "array", items: { type: "string" }, description: "List of equipment needed in the room" }
                    },
                    required: ["date", "timeSlot"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "delete_booking",
                description: "Delete a reservation with the given params",
                parameters: {
                    type: "object",
                    properties: {
                        roomNumber: { type: "string", description: "The room number of the booking, e.g., 101" },
                        date: { type: "string", description: "The date of the booking, e.g., 2024-06-26" },
                        timeSlot: { type: "string", description: "The time of the booking, e.g., 11:00, always in HH:MM format" }
                    },
                    required: ["date", "roomNumber", "timeSlot"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "update_booking",
                description: "Update a reservation with the given params",
                parameters: {
                    type: "object",
                    properties: {
                        roomNumber: { type: "string", description: "The room number of the booking, e.g., 101" },
                        date: { type: "string", description: "The current date of the booking, e.g., 2024-06-26" },
                        timeSlot: { type: "string", description: "The current time of the booking, e.g., 11:00, always in HH:MM format" },
                        new_roomNumber: { type: "string", description: "The updated room number of the booking, e.g., 101" },
                        new_date: { type: "string", description: "The updated date of the booking, e.g., 2024-06-27" },
                        new_timeSlot: { type: "string", description: "The updated time of the booking, e.g., 12:00, always in HH:MM format" }
                    },
                    required: ["date", "timeSlot", "new_date", "new_timeSlot"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "get_available_rooms",
                description: "List all rooms available to the user and proceed to create a reservation one after asking",
                parameters: {
                    type: "object",
                    properties: {
                        date: { type: "string", description: "The current date of the booking, e.g., 2024-06-26" },
                        timeSlot: { type: "string", description: "The current time of the booking, e.g., 11:00, always in HH:MM format" },
                        roomNumber: { type: "string", description: "The room number of the booking, e.g., 101" },
                        equipment: { type: "array", items: { type: "string" }, description: "List of equipment required, e.g., PC or Whiteboard"
                        }
                    },
                    required: []
                }
            }
        }
    ];

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messageHistory,
            tools: tools,
            tool_choice: "auto",
            temperature: 0.2
        });

        const responseMessage = response.choices[0].message;

        const toolCalls = responseMessage.tool_calls;
        if (toolCalls && toolCalls.length > 0) {
            await handleToolCalls(toolCalls);

            const secondResponse = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: messageHistory
            });

            addMessageToHistory("assistant", secondResponse.choices[0].message.content);
            return secondResponse.choices[0].message.content;
        } else {
            addMessageToHistory("assistant", responseMessage.content);
            return responseMessage.content;
        }
    } catch (error) {
        addMessageToHistory("assistant", `An error occurred: ${error.message}`);
        return `An error occurred: ${error.message}`;
    }
};

module.exports = { handleOpenAIRequest };
