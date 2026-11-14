import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  const port = Number(process.env.PORT) || 3000;

  app.get('/api/health', (_req, res) => {
    const hasGemini = Boolean(getGeminiClient());
    res.json({
      ok: true,
      geminiConfigured: hasGemini,
      mode: hasGemini ? 'live' : 'offline-deterministic',
    });
  });

  app.post('/api/mentor/chat', async (req, res) => {
    const { message, mode, language, learnerContext, lessonContext, history } = req.body ?? {};
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.json({
        source: 'offline',
        notice: 'Offline mentor guidance.',
        reply: null,
      });
      return;
    }

    try {
      const systemInstruction = [
        'You are Pathy, a warm, encouraging college study companion and career mentor for SkillPath AI.',
        'Never guarantee jobs, placements, or salaries.',
        'Keep advice concrete, step-by-step, and adapted to the learner context.',
        `Mentor mode: ${mode || 'Explain'}.`,
        `Language preference: ${language || 'English'} (if Tamil, respond in clear Tamil with technical terms in English; if Tanglish, blend natural conversational Tamil-English).`,
        learnerContext ? `Learner context: ${JSON.stringify(learnerContext)}` : '',
        lessonContext ? `Current lesson context: ${JSON.stringify(lessonContext)}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const promptParts = [
        Array.isArray(history) && history.length > 0
          ? `Recent conversation:\n${history
              .slice(-6)
              .map((h: { role: string; content: string }) => `${h.role}: ${h.content}`)
              .join('\n')}`
          : '',
        `Student message: ${message}`,
      ]
        .filter(Boolean)
        .join('\n\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: promptParts,
        config: {
          systemInstruction,
        },
      });

      res.json({
        source: 'gemini',
        notice: null,
        reply: response.text ?? '',
      });
    } catch (error) {
      console.error('Gemini mentor error:', error);
      res.json({
        source: 'offline',
        notice: 'Offline mentor guidance.',
        reply: null,
      });
    }
  });

  app.post('/api/project-review', async (req, res) => {
    const { projectTitle, description, githubUrl, liveUrl, rubricCriteria, skills } = req.body ?? {};
    const ai = getGeminiClient();
    if (!ai) {
      res.json({
        source: 'offline',
        notice: 'Sample output — connect Gemini for live AI generation.',
        review: null,
      });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Evaluate this student portfolio project against the rubric criteria.
Project: ${projectTitle}
Skills: ${JSON.stringify(skills || [])}
Description: ${description || 'No description provided'}
GitHub URL: ${githubUrl || 'Not provided'}
Live URL: ${liveUrl || 'Not provided'}
Rubric Criteria: ${JSON.stringify(rubricCriteria || [])}`,
        config: {
          systemInstruction:
            'Provide constructive rubric feedback for a college software student. Never guarantee job outcomes.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
              estimatedScore: { type: Type.INTEGER },
            },
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({
        source: 'gemini',
        notice: 'AI feedback — not an official grade.',
        review: parsed,
      });
    } catch (error) {
      console.error('Gemini project review error:', error);
      res.json({
        source: 'offline',
        notice: 'Sample output — connect Gemini for live AI generation.',
        review: null,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`SkillPath AI server running on http://0.0.0.0:${port}`);
  });
}

startServer();
