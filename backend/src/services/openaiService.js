const openai = require('../config/openai');
const { findBooking, createBooking, updateBooking, deleteBooking, getAvailableRooms } = require('./bookingService');

let messageHistory = [];

// Get the current date in 'YYYY-MM-DD' format.
const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
};

// Initialize message history with a system message for the assistant's context.
const initializeMessageHistory = (language) => {
    const currentDate = getCurrentDate();
    messageHistory.push({
        role: "system",
        content: `
        You are a helpful room booking assistant for a company called chatta. Today's date is ${currentDate} and the 
        language you communicate is ${language}. Your main responsibility is to assist users with all aspects of room 
        reservations and call functions. This includes checking the availability of rooms, providing details on equipment 
        options, and fulfilling requests. You can help with any related queries. The functions you can perform include:
        1. find_booking: Find a reservation with the given parameters or display all bookings if no parameters are provided.
        2. create_booking: Create a new reservation for a specified date and time. Bookings can only be made at the top of the hour 
        (e.g., 10:00). If a user provides a time like "8" or "8:00," automatically transform it to "08:00" and validate it.
        3. delete_booking: Delete an existing reservation with the specified parameters.
        4. update_booking: Update an existing reservation with the given parameters.
        5. get_available_rooms: List all rooms available to the user based on the specified parameters. Sometimes the user asks to create 
        a booking with that data.All outputs must be in plain text only. Do not use any markdown formatting, such as **, bullet points (-) 
        or numbered lists.If a user attempts to book a time slot that is not on the hour (e.g., 09:30), respond with an error message asking 
        them to provide a valid time slot. When a request like creating a booking, updating, or deleting, send a validation message and call 
        the function once the information is confirmed. If a user asks about anything outside the scope of room-related information, gently 
        remind them that your assistance is focused on room reservations and related services. Keep your answers very compact.
        `
    });
};

// Add a message to the conversation history.
const addMessageToHistory = (role, content) => {
    messageHistory.push({ role: role, content: content });
};

// Handle the tool calls (e.g., find_booking, create_booking) and execute corresponding functions.
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

// Main function to handle OpenAI API requests.
const handleOpenAIRequest = async (textInput, language) => {
    initializeMessageHistory(language);
    addMessageToHistory("user", textInput);

    // Function descriptions
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
                        timeSlot: { type: "string", description: "The time of the booking, e.g., 11:00, always transform to HH:00 format" },
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
                description: "Create a reservation with the params date and timeslot, after receiving that input, ask if they want a specific room based on the roomnumber or equipment. Only allow bookings at full hours (e.g., 09:00, 10:00). And return an answer with all booking values (Date, Time, Roomnumber, Equipment)",
                parameters: {
                    type: "object",
                    properties: {
                        roomNumber: { type: "string", description: "The room number for the booking" },
                        date: { type: "string", description: "The date of the booking, e.g., 2024-06-26" },
                        timeSlot: { type: "string", description: "The time of the booking, e.g., 11:00, always transform to HH:00 format" },
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
                        timeSlot: { type: "string", description: "The time of the booking, e.g., 11:00, always in HH:00 format" }
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
                        timeSlot: { type: "string", description: "The current time of the booking, e.g., 11:00, always transform to HH:00 format" },
                        new_roomNumber: { type: "string", description: "The updated room number of the booking, e.g., 101" },
                        new_date: { type: "string", description: "The updated date of the booking, e.g., 2024-06-27" },
                        new_timeSlot: { type: "string", description: "The updated time of the booking, e.g., 12:00, always transform to HH:00 format" }
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
                        timeSlot: { type: "string", description: "The current time of the booking, e.g., 11:00, always transform to HH:00 formatf" },
                        roomNumber: { type: "string", description: "The room number of the booking, e.g., 101" },
                        equipment: { type: "array", items: { type: "string" }, description: "List of equipment required, e.g., PC or Whiteboard" }
                    },
                    required: []
                }
            }
        }
    ];

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: messageHistory,
            tools: tools,
            tool_choice: "auto",
            temperature: 0.2
        });

        const responseMessage = response.choices[0].message;

        const toolCalls = responseMessage.tool_calls;
        if (toolCalls && toolCalls.length > 0) {
            await handleToolCalls(toolCalls);
            // Parse result to new response
            const secondResponse = await openai.chat.completions.create({
                model: "gpt-4o",
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
