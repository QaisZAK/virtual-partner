const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const dotenv = require('dotenv');
dotenv.config();

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

const app = express();
const port = 5500;

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/generate-response', async (req, res) => {
    try {
        console.log('Running generate-response')

        let { message, aiResponses, userResponses } = req.body;

        // userResponses is an array of strings, aiResponses is an array of strings
        // userMessages need to be mapped to { role: "user", content: message }
        // aiMessages need to be mapped to { role: "assistant", content: message }
        let userMessages = userResponses.map(msg => ({ role: "user", content: msg }));
        let aiMessages = aiResponses.map(msg => ({ role: "assistant", content: msg }));
        let organizedMessages = [];
        for (let i = 0; i < userMessages.length; i++) {
            organizedMessages.push(userMessages[i]);
            organizedMessages.push(aiMessages[i]);
        }

        let msgs = [
            { role: "system", content: "You are a virtual girlfriend/boyfriend." },
            ...organizedMessages,
            { role: "user", content: message }
        ];

        let completion = await openai.chat.completions.create({
            messages: msgs,
            model: "gpt-3.5-turbo",
          });

        res.json({ response: completion.choices[0].message.content });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred');
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
