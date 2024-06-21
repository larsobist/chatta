const PORT = 8000
const express  = require('express')
const cors  = require('cors')
const app = express()
const OpenAI  = require('openai');
const openai = new OpenAI( {apiKey: process.env.OPENAI_API_KEY})
require('dotenv').config()

app.use(express.json())
app.use(cors())

app.post('/chat',  async (req, res) => {
    const textInput = req.body.text;
    console.log(textInput)

    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: "You are a helpful assistant." },
            { role: "user", content: textInput}],
        model: "gpt-3.5-turbo",
    })

    res.send(completion.choices[0])
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`))