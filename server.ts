import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/xp", async (req, res) => {
    try {
      const { title, description } = req.body;
      let promptTask = description && description.trim() !== "" ? description : title;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `Evaluate this task/quest for a student: "${promptTask}". Respond with a JSON object containing an "xp" integer between 10 and 45 based on effort and difficulty, or 0 if it is gibberish.`,
        config: {
          systemInstruction: "You are a quest XP calculator. If the task is gibberish, random letters, spam, or makes no sense, return 0 XP. Easy tasks = 10-15 XP. Medium tasks = 20-30 XP. Hard tasks = 35-45 XP. Ensure your output is an integer strictly between 10 and 45, or 0. Output ONLY JSON with the 'xp' key.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              xp: {
                type: Type.INTEGER,
                description: "Estimated XP points: 0 if gibberish, or between 10 and 45",
              },
            },
            required: ["xp"],
          },
        },
      });
      const data = JSON.parse(response.text);
      res.json(data);
    } catch (e: any) {
      console.error("Error generating XP:", e);
      res.status(500).json({ error: e.message || "Failed to calculate XP" });
    }
  });

  app.post("/api/reflective-prompt", async (req, res) => {
    try {
      const { recentHabits } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `Based on my recently completed habits over the past week: ${JSON.stringify(recentHabits)}, generate a short, insightful, single-sentence journaling question to help me reflect on my personal growth and challenges.`,
        config: {
          systemInstruction: "You are an insightful journal guide. Give only the single question without any intro, markdown or formatting. Make it deep, encouraging, and highly specific to the given habits.",
        },
      });
      res.json({ prompt: response.text });
    } catch (e: any) {
      console.error("Error generating Reflective Prompt:", e);
      res.status(500).json({ error: e.message || "Failed to generate prompt" });
    }
  });

  app.post("/api/stretch-goals", async (req, res) => {
    try {
      const { recentHabits } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `Based on my recently completed habits and schedule: ${JSON.stringify(recentHabits)}, suggest 3 completely new, personalized 'stretch goals' or micro-habits for the week to improve my personal growth. Output in JSON format with a 'goals' array of strings.`,
        config: {
          systemInstruction: "You are a personal growth advisor. Provide 3 highly specific, creative, and distinct micro-habits. Do not provide generic goals like 'drink more water' if it's already a habit. Output ONLY JSON with a 'goals' array containing 3 strings.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              goals: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of 3 stretch goal strings",
              },
            },
            required: ["goals"],
          },
        },
      });
      const data = JSON.parse(response.text);
      res.json(data);
    } catch (e: any) {
      console.error("Error generating Stretch Goals:", e);
      res.status(500).json({ error: e.message || "Failed to generate goals" });
    }
  });

  // SPOTIFY OAUTH ROUTES
  app.get('/api/auth/spotify/url', (req, res) => {
    const redirectUri = `${process.env.APP_URL}/auth/spotify/callback`;
    const params = new URLSearchParams({
      client_id: process.env.SPOTIFY_CLIENT_ID || '',
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: 'user-read-playback-state user-modify-playback-state user-read-currently-playing',
    });
    res.json({ url: `https://accounts.spotify.com/authorize?${params.toString()}` });
  });

  app.get(['/auth/spotify/callback', '/auth/spotify/callback/'], async (req, res) => {
    const { code } = req.query;
    const redirectUri = `${process.env.APP_URL}/auth/spotify/callback`;

    try {
      const authString = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${authString}`
        },
        body: new URLSearchParams({
          code: code as string,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });
      const data = await response.json();
      
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_SPOTIFY_SUCCESS', token: '${data.access_token || ''}' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. Window will close automatically.</p>
          </body>
        </html>
      `);
    } catch (e) {
      res.send('OAuth Error');
    }
  });

  // DISCORD OAUTH ROUTES
  app.get('/api/auth/discord/url', (req, res) => {
    const redirectUri = `${process.env.APP_URL}/auth/discord/callback`;
    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'identify',
    });
    res.json({ url: `https://discord.com/api/oauth2/authorize?${params.toString()}` });
  });

  app.get(['/auth/discord/callback', '/auth/discord/callback/'], async (req, res) => {
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_DISCORD_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. Window will close automatically.</p>
        </body>
      </html>
    `);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
