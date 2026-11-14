# SkillPath AI

**Tagline:** *Learn What You Need. Become What You Want.*

SkillPath AI is a gamified, multi-agent learning and career-guidance platform for college students. It helps learners separate self-reported confidence from verified skill evidence, identify career skill gaps transparently, follow adaptive versioned roadmaps, practice in a multi-format Quiz Arena, build rubric-reviewed projects, and learn alongside **Pathy** (with English, Tamil, and Tanglish support).

## Setup & Commands

```bash
# 1. Install dependencies
npm install

# 2. Optional: configure environment variables
cp .env.example .env
# Add GEMINI_API_KEY in .env (or Secrets panel) for live Gemini mentor & project reviews.
# The app works completely offline / without a key using deterministic local logic.

# 3. Run development server (Express + Vite on port 3000)
npm run dev

# 4. Run unit & end-to-end user journey tests
npm test

# 5. Typecheck and build production bundle
npm run lint
npm run build
```

## Architecture Overview

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router, Zustand (localStorage persistence), Recharts (with accessible data-table toggles), Framer Motion, Zod validation, `vite-plugin-pwa`.
- **Server (`server.ts`)**: Express backend serving `/api/health`, `/api/mentor/chat`, and `/api/project-review` using `@google/genai` (`gemini-4-hydrogen`) strictly on the server side when `GEMINI_API_KEY` is configured, with automatic deterministic fallback when offline or unconfigured.
- **Multi-Agent Orchestrator (`src/services/orchestrator.ts`)**: Coordinates Profile, Skill Analysis, Career Advisor, Learning Planner, Assessment, and AI Mentor agents with Zod schema validation, up to 2 retries, and live logging in the Agent Activity Feed.
- **PWA**: Configured with Web App Manifest, 192x192 / 512x512 / maskable icons, Apple touch icon, service worker precaching, offline lesson caching toggle, and in-app install button.
