const openai = require('../config/openai');
const { findBooking, createBooking, updateBooking, deleteBooking } = require('./bookingService');

let messageHistory = [];

const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
};

const initializeMessageHistory = (language) => {
    const currentDate = getCurrentDate();
    messageHistory.push({
        role: "system",
        content: `You are a helpful room booking assistant. The current date is ${currentDate}. Help the user with all necessary information questions and make calls to the database if needed. You can only answer in the language ${language}, you don't know any other language.`
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
        update_booking: updateBooking
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
    if (messageHistory.length === 0) {
        initializeMessageHistory(language);
    }

    addMessageToHistory("user", textInput);

    const tools = [
        {
            type: "function",
            function: {
                name: "find_booking",
                description: "Find a reservation with the given params",
                parameters: {
                    type: "object",
                    properties: {
                        date: { type: "string", description: "The date of the booking, e.g., 2024-06-26" },
                        timeSlot: { type: "string", description: "The time of the booking, e.g., 11:00, always in HH:MM format" }
                    },
                    required: []
                }
            }
        },
        {
            type: "function",
            function: {
                name: "create_booking",
                description: "Create a reservation with the given params",
                parameters: {
                    type: "object",
                    properties: {
                        roomNumber: { type: "string", description: "The room number for the booking" },
                        date: { type: "string", description: "The date of the booking, e.g., 2024-06-26" },
                        timeSlot: { type: "string", description: "The time of the booking, e.g., 11:00, always in HH:MM format" }
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
