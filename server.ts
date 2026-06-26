import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from "dotenv";
import fs from "fs";
import * as adminModule from "firebase-admin";

dotenv.config();

const fbAdmin = (adminModule && (adminModule as any).apps) 
  ? adminModule 
  : (((adminModule as any).default && (adminModule as any).default.apps) 
    ? (adminModule as any).default 
    : adminModule) as any;

// Initialize Firebase Admin SDK
try {
  let serviceAccount: any = null;
  const filePath = path.join(process.cwd(), "serviceAccountKey.json");
  if (fs.existsSync(filePath)) {
    serviceAccount = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }

  if (serviceAccount) {
    if (fbAdmin.apps.length === 0) {
      fbAdmin.initializeApp({
        credential: fbAdmin.credential.cert(serviceAccount),
        databaseURL: "https://shaurya-anchor-project-default-rtdb.firebaseio.com"
      });
      console.log("🟢 Firebase Admin SDK successfully initialized! Connecting to shaurya-anchor-project Realtime Database.");
    }
  } else {
    console.warn("⚠️ No serviceAccountKey.json or FIREBASE_SERVICE_ACCOUNT configuration found on the server.");
  }
} catch (e: any) {
  console.error("🔴 Firebase Admin SDK initialization error:", e.message || e);
}

interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing authorization header." });
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    if (fbAdmin.apps.length === 0) {
      return res.status(503).json({ error: "Service unavailable: Database not initialized on the server." });
    }
    const decodedToken = await fbAdmin.auth().verifyIdToken(idToken);
    req.userId = decodedToken.uid;
    req.userEmail = decodedToken.email;
    next();
  } catch (err: any) {
    console.error("Token verification failed:", err.message || err);
    return res.status(401).json({ error: "Unauthorized: Invalid or expired access token." });
  }
};


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
      const { title, description, due, dueTime, currentDate } = req.body;
      
      const now = currentDate ? new Date(currentDate) : new Date();
      let durationStr = "N/A";
      let hours = 0;
      let days = 0;
      
      if (due) {
        const timeStr = dueTime || "23:59";
        const dueObj = new Date(`${due}T${timeStr}`);
        if (!isNaN(dueObj.getTime())) {
          const diffMs = dueObj.getTime() - now.getTime();
          hours = diffMs / (1000 * 60 * 60);
          days = hours / 24;
          if (hours <= 0) {
            durationStr = "Immediate / Overdue (less than 1 hour remaining)";
          } else {
            durationStr = `${hours.toFixed(1)} hours (${days.toFixed(1)} days)`;
          }
        }
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `Evaluate this student task/quest:
- Title: "${title}"
- Description: "${description || "None"}"
- Timeframe/Duration until deadline: ${durationStr}

Calculate the appropriate XP reward based on difficulty, complexity, and deadline scale. Use the XP scaling rules provided.`,
        config: {
          systemInstruction: `You are a smart, rewarding quest XP calculator.
If the task title or description is gibberish, random text, or spam, return 0 XP.

Scale the XP rewards based on both the nature of the task and the duration/deadline (which reflects the scale of work):
- Short-term (due in less than 24 hours, e.g., 3 hours):
  * Easy (e.g. daily habits, quick chores): 10-15 XP
  * Medium (e.g. homework, simple study sessions): 20-35 XP
  * Hard (e.g. writing an essay, preparing a speech): 40-60 XP
- Mid-term (due in 1 to 7 days, e.g., a week):
  * Easy (e.g. weekly review, light reading): 30-50 XP
  * Medium (e.g. lab report, small coding assignment): 60-100 XP
  * Hard (e.g. studying for a midterm exam, major project milestone): 110-160 XP
- Long-term (due in 8 to 30 days, e.g., 2-4 weeks):
  * Easy (e.g. reading a book, steady progress): 80-120 XP
  * Medium (e.g. research paper draft, full software module): 150-250 XP
  * Hard (e.g. major term paper, building a complete app, studying for finals): 280-400 XP
- Epic-term (due in 31 to 90 days, e.g., 1-3 months):
  * Easy (e.g. ongoing semester reading log): 180-250 XP
  * Medium (e.g. mid-term group project, portfolio construction): 300-450 XP
  * Hard (e.g. bachelor/master thesis, major competitive exam prep, end-of-term capstone): 500-800 XP

Ensure your output is an integer strictly matching these rules. Output ONLY JSON with the 'xp' key.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              xp: {
                type: Type.INTEGER,
                description: "Calculated XP points based on effort, difficulty, and timeframe",
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

  app.post("/api/parse-time", async (req, res) => {
    try {
      const { timeString } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `Convert this time duration into total minutes: "${timeString}"`,
        config: {
          systemInstruction: "You are a time parsing assistant. Convert the given time duration string into an integer representing the total minutes. For example, '1 hour and 30 minutes' = 90. If it cannot be parsed or makes no sense, return 0. Output ONLY JSON with the 'minutes' key.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              minutes: {
                type: Type.INTEGER,
                description: "Total minutes represented by the string",
              },
            },
            required: ["minutes"],
          },
        },
      });
      const data = JSON.parse(response.text);
      res.json(data);
    } catch (e: any) {
      console.error("Error parsing time:", e);
      res.status(500).json({ error: e.message || "Failed to parse time" });
    }
  });

  app.post("/api/ai-schedule", async (req, res) => {
    try {
      const { availableMinutes, quests, currentTime } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `I have ${availableMinutes} minutes to focus today.
My uncompleted quests: ${JSON.stringify(quests)}
Current date and time context: ${JSON.stringify(currentTime)}

Based on this context, select and order the best quests for me to complete.
Provide a JSON object containing:
1. 'suggestions': an array of recommended tasks, where each suggestion has 'id' (from the input quest), 'title', 'estTime' (estimated duration in minutes to complete, which must be a realistic estimate e.g. 15-60 mins), 'startTime' (recommended start time string, e.g. '08:30 AM'), and 'reason' (why you chose it and ordered it this way, mentioning if it's due soon, high value, or optimal for the current time).
2. 'summary': a short, supportive summary (1-2 sentences) explaining why this focus plan was generated.`,
        config: {
          systemInstruction: "You are an expert AI productivity planner. Prioritize tasks that are due today, especially those with specific due times (e.g. at 08:00 AM) that are close or slightly overdue, or those matching the current time of day. Ensure the sum of 'estTime' for all suggestions is less than or equal to the availableMinutes. Output ONLY valid JSON matching the schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER, description: "The original quest ID" },
                    title: { type: Type.STRING, description: "The quest title" },
                    estTime: { type: Type.INTEGER, description: "Estimated time in minutes to complete this task" },
                    startTime: { type: Type.STRING, description: "Suggested start time, e.g., '10:15 AM'" },
                    reason: { type: Type.STRING, description: "Explanation of priority" },
                  },
                  required: ["id", "title", "estTime", "startTime", "reason"],
                },
              },
              summary: {
                type: Type.STRING,
                description: "A short, encouraging summary of the plan.",
              },
            },
            required: ["suggestions", "summary"],
          },
        },
      });
      const data = JSON.parse(response.text || '{}');
      res.json(data);
    } catch (e: any) {
      console.error("Error generating AI schedule:", e);
      res.status(500).json({ error: e.message || "Failed to generate AI schedule" });
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
      const { recentHabits, morningHabits } = req.body;
      const contents = `Analyze my completed habits: ${JSON.stringify(recentHabits || [])} and morning routine: ${JSON.stringify(morningHabits || [])}.
Identify MISSING habits and suggest activities that explicitly COMPLEMENT my routine, rather than repeating what I have already completed (e.g., if I drink water, suggest a complementary action like stretching or walking). The three stretch goals must be completely different from each other in meaning and category.
Punchy Formatting: Output every goal as a single, punchy sentence of under 12-15 words. They must be quick and easy to read, and very VERY meaningful. Output in JSON format with a 'goals' array of strings.`;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents,
        config: {
          systemInstruction: "You are a personal growth advisor. Provide 3 highly specific, creative, and distinct complementary micro-habits. Do not provide generic goals or repeat completed habits. Each goal must be a single, punchy sentence under 15 words. Output ONLY JSON with a 'goals' array containing 3 strings.",
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

  // --- Chatbot API ---
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, state } = req.body;
      const historyText = history ? history.map((m: any) => `${m.role}: ${m.content}`).join('\n') : '';
      const stateContext = state ? `\nCurrent App State:\n${JSON.stringify(state, null, 2)}` : '';
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `Previous conversation:\n${historyText}\n\nUser: ${message}${stateContext}`,
        config: {
          systemInstruction: "You are the Anchor AI Assistant inside a productivity and lifestyle app. You can INTERACT WITH THE ENTIRE APP. Use the 'executeActions' array to trigger actions behind the scenes instead of just giving text advice. Actions available: 'checkin_sleep' (when going to bed), 'wakeup' (when waking up), 'navigate' (payload: string page ID like 'dashboard', 'quests', 'stats', 'settings'), 'update_state' (payload: object), 'clear_data' (danger: ALWAYS ask for user confirmation first before doing this! if they confirm, execute 'clear_data'), 'logout' (ask for confirmation first!), 'create_quest' (payload: { title: string, dueRaw: string 'YYYY-MM-DD', dueTime: string 'HH:MM' (24-hour, e.g. '08:00', '22:00') }, ask them for details if not provided, or infer them. Note that quests do not have categories and XP is auto-calculated), 'create_anchor' (schedule blocks/routines, payload: { time: string 'HH:MM AM/PM', title: string, subtitle: string, xp: number, category: string }), 'generate_schedule' (you can create a series of quests or anchors or just output text schedule). ALWAYS confirm what you did in the 'reply'. If they ask to do something, DO IT using executeActions.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING, description: "Your conversational response." },
              executeActions: {
                type: Type.ARRAY,
                description: "Array of actions to execute immediately in the app behind the scenes.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, description: "Action type: 'checkin_sleep', 'wakeup', 'navigate', 'update_state', 'clear_data', 'logout', 'create_quest', 'create_anchor'" },
                    payload: { 
                      type: Type.OBJECT, 
                      description: "Payload for the action.",
                      properties: {
                        pageId: { type: Type.STRING, description: "For 'navigate'" },
                        state: { type: Type.OBJECT, description: "For 'update_state'" },
                        quest: { 
                          type: Type.OBJECT, 
                          description: "For 'create_quest': { title, dueRaw, dueTime }",
                          properties: {
                            title: { type: Type.STRING },
                            dueRaw: { type: Type.STRING, description: "YYYY-MM-DD format" },
                            dueTime: { type: Type.STRING, description: "HH:MM format, 24-hour (optional)" }
                          },
                          required: ["title"]
                        },
                        anchor: { type: Type.OBJECT, description: "For 'create_anchor': { time, title, subtitle, xp, category }" }
                      }
                    }
                  },
                  required: ["type"]
                }
              },
              suggestedAction: {
                type: Type.OBJECT,
                description: "Optional. Set this if you want to show a button for the user to navigate manually.",
                properties: {
                  type: { type: Type.STRING, description: "Must be 'navigate'" },
                  payload: { type: Type.STRING, description: "The page ID (dashboard, quests, stats, leaderboard, loadout, settings)" },
                  label: { type: Type.STRING, description: "The text for the button, e.g. 'Take me there'" }
                }
              },
              suggestedQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "2-3 short suggested next questions or actions the user might want to tap."
              }
            },
            required: ["reply", "suggestedQuestions"]
          }
        }
      });
      
      const data = JSON.parse(response.text || '{}');
      res.json(data);
    } catch (e: any) {
      console.error("Error in chat:", e);
      res.status(500).json({ error: e.message || "Chat error" });
    }
  });

  app.post("/api/chat/autocomplete", async (req, res) => {
    try {
      const { input } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `The user is typing: "${input}". Generate 2-3 short autocomplete suggestions or questions based on what they might be asking in a productivity app context.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["suggestions"]
          }
        }
      });
      const data = JSON.parse(response.text || '{}');
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
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

  // DATABASE STATE SYNC ROUTES
  app.get("/api/user/state", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (fbAdmin.apps.length === 0) {
        return res.status(503).json({ error: "Service unavailable: Database not initialized on the server." });
      }
      const ref = fbAdmin.database().ref(`users/${req.userId}`);
      const snapshot = await ref.once("value");
      const dbState = snapshot.val();
      
      // If user state does not exist in Realtime DB, let client initialize it
      res.json(dbState || {});
    } catch (e: any) {
      console.error("Error fetching state from Realtime Database:", e.message || e);
      res.status(500).json({ error: e.message || "Failed to load state" });
    }
  });

  app.post("/api/user/state", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (fbAdmin.apps.length === 0) {
        return res.status(503).json({ error: "Service unavailable: Database not initialized on the server." });
      }
      const { state } = req.body;
      if (!state) {
        return res.status(400).json({ error: "Missing state payload." });
      }

      const ref = fbAdmin.database().ref(`users/${req.userId}`);
      await ref.set(state);
      res.json({ success: true, message: "Application state successfully synchronized." });
    } catch (e: any) {
      console.error("Error saving state to Realtime Database:", e.message || e);
      res.status(500).json({ error: e.message || "Failed to save state" });
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
