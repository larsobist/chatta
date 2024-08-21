const openai = require('../config/openai');
const { findBooking, createBooking, updateBooking, deleteBooking, findRooms } = require('./bookingService');

let messageHistory = [];

const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
};

const initializeMessageHistory = (language) => {
    console.log(language)
    const currentDate = getCurrentDate();
    messageHistory.push({
        role: "system",
        content: `You are a helpful room booking assistant for a company. The current date is ${currentDate}. Help the user with all necessary information and questions related to room reservations, including room availability, equipment, and details. You can only answer in the language ${language}. You only work within the context of a booking service, so if the user asks something unrelated to reservations or room details, respond that you can only assist with room reservations and information related to them.`
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
        find_rooms: findRooms
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
                description: "Create a reservation with the given params date and timeslot, the other params are optional",
                parameters: {
                    type: "object",
                    properties: {
                        roomNumber: { type: "string", description: "Optional: The room number for the booking" },
                        date: { type: "string", description: "The date of the booking, e.g., 2024-06-26" },
                        timeSlot: { type: "string", description: "The time of the booking, e.g., 11:00, always in HH:MM format" },
                        equipment: { type: "array", items: { type: "string" }, description: "Optional: List of equipment needed in the room" }
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
                        roomNumber: { type: "string", description: "The room number of the booking to delete, e.g., 101" },
                        date: { type: "string", description: "The date of the booking to delete, e.g., 2024-06-26" },
                        timeSlot: { type: "string", description: "The time of the booking to delete, e.g., 11:00, always in HH:MM format" }
                    },
                    required: ["date"]
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
                        roomNumber: { type: "string", description: "The room number of the booking to delete, e.g., 101" },
                        date: { type: "string", description: "The current date of the booking, e.g., 2024-06-26" },
                        timeSlot: { type: "string", description: "The current time of the booking, e.g., 11:00, always in HH:MM format" },
                        new_roomNumber: { type: "string", description: "The updated room number of the booking to delete, e.g., 101" },
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
                name: "find_rooms",
                description: "List all rooms available to the user",
                parameters: {
                    type: "object",
                    properties: {
                        roomNumber: { type: "string", description: "The room number of the booking to delete, e.g., 101" },
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
