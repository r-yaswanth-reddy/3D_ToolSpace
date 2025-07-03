import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const app = express();
const port = 3000;

// Needed to resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Serve static files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname)));

// ✅ Serve index.html on root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'chatgpt.html'));
});

// ✅ Chat API route
const client = new OpenAI({
  apiKey: process.env.GITHUB_TOKEN,
  baseURL: "https://models.github.ai/inference"
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const completion = await client.chat.completions.create({
      model: "openai/gpt-4o",
      messages: [{ role: "user", content: message }],
      temperature: 0.7,
      max_tokens: 1024
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ error: "Failed to get response from OpenAI" });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
