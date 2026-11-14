# SkillPath AI

**Tagline:** *Learn What You Need. Become What You Want.*

SkillPath AI is a gamified, multi-agent learning and career-guidance platform for college students. It helps learners separate self-reported confidence from verified skill evidence, identify career skill gaps transparently, follow adaptive versioned roadmaps, practice in a multi-format Quiz Arena, build rubric-reviewed projects, and learn alongside **Pathy** (with English, Tamil, and Tanglish support).

Final goal: Build a professional, attractive, gamified, AI-powered learning platform that helps students understand their skills, identify what is missing, learn effectively, track real progress, and prepare confidently for the career they want.

## Setup & Commands

```bash
# 1. Install dependencies
npm install

# 2. Optional: configure environment variables
cp .env.example .env
# Add GEMINI_API_KEY in .env (or Secrets panel) for live Gemini mentor & project reviews.
# Optionally set FASTAPI_BACKEND_URL=http://localhost:8000 to proxy AI endpoints to the Python backend.
# The app works completely offline / without a key using deterministic local logic.

# 3. Run development server (Express + Vite on port 3000)
npm run dev

# 4. Run unit & end-to-end user journey tests
npm test

# 5. Typecheck, lint Firestore security rules, and build production bundle
npm run lint
npx eslint firestore.rules
npm run build
```

## Firebase Auth & Firestore Setup

- `firebase-applet-config.json` is provisioned for project `storied-backbone-85gvv` (`firestoreDatabaseId`: `ai-studio-skillpathai-43b63f51-710e-4cf3-b66b-23f7f01b2d55`).
- `firestore.rules` enforces Zero-Trust owner-only access across all 11 collections (`users`, `skills`, `assessments`, `assessment_attempts`, `roadmaps`, `progress`, `projects`, `achievements`, `xp_transactions`, `ai_conversations`, `agent_workflows`) and requires `request.auth.token.email_verified == true` for writes.
- **Google Sign-In** is enabled automatically. To enable **Email/Password** sign-in and password reset emails, open Firebase Console -> **Authentication** -> **Sign-in method** -> enable **Email/Password**.
- Demo Student mode (`Alex`) remains available locally without creating a Firebase account.

## Architecture Overview

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router, Zustand, Firebase Auth + Firestore SDK, Recharts (with accessible data-table toggles), Framer Motion, Zod validation, `vite-plugin-pwa`.
- **Node/Express Server (`server.ts`)**: Serves `/api/health`, `/api/mentor/chat`, and `/api/project-review` using `@google/genai` strictly on the server side (or proxies to Python FastAPI if `FASTAPI_BACKEND_URL` is configured).
- **Python FastAPI Backend (`backend/`)**: Complete server-side FastAPI microservice with Firebase Admin auth (`verify_id_token`), Pydantic v2 structured outputs, 6 specialized agents + sequential orchestrator, sliding-window rate limits, retries, timeouts, Dockerfile, and pytest suite. See `backend/README.md`.
- **Multi-Agent Orchestrator (`src/services/orchestrator.ts`)**: Coordinates Profile, Skill Analysis, Career Advisor, Learning Planner, Assessment, and AI Mentor agents with Zod schema validation, up to 2 retries, and live logging in the Agent Activity Feed.
- **PWA**: Configured with Web App Manifest, 192x192 / 512x512 / maskable icons, Apple touch icon, service worker precaching, offline lesson caching toggle, and in-app install button.
