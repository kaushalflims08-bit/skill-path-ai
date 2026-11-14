# SkillPath AI — Python FastAPI Backend

Production-ready FastAPI service providing Firebase Admin token verification, server-side Gemini AI structured generation, six coordinated learning agents, sliding-window rate limits, retries, and timeouts.

## Security Guarantees

- **Zero Client Keys:** The frontend never stores or transmits `GEMINI_API_KEY`. Requests containing `x-gemini-api-key` or `x-api-key` headers are explicitly rejected with HTTP `400`.
- **Firebase Admin Auth:** Protected endpoints verify the `Authorization: Bearer <Firebase ID Token>` header via `firebase_admin.auth.verify_id_token`.
- **Rate Limiting & Resilience:** Per-user sliding window rate limiting (`429 Too Many Requests` with `Retry-After`), `asyncio.wait_for` timeouts, exponential backoff retries, and deterministic Pydantic-validated fallbacks.

## Local Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Set GEMINI_API_KEY and FIREBASE_CREDENTIALS_JSON (or GOOGLE_APPLICATION_CREDENTIALS) in .env

uvicorn app.main:app --reload --port 8000
```

To connect the Node/Express frontend proxy (`server.ts`) to this FastAPI backend, set `FASTAPI_BACKEND_URL=http://localhost:8000` in the root `.env`.

## Docker Deployment

```bash
cd backend
docker build -t skillpath-fastapi .
docker run -p 8000:8000 --env-file .env skillpath-fastapi
```

## API Documentation

Interactive OpenAPI docs are available at `/docs` and `/redoc` when running.

### `GET /health` · `GET /api/v1/health`
Returns service readiness and whether `GEMINI_API_KEY` is configured (`live` vs `offline-deterministic`).

### `POST /api/v1/agents/orchestrate` *(Auth Required)*
Runs all 6 agents sequentially (`Profile Agent` -> `Skill Analysis Agent` -> `Career Advisor Agent` -> `Learning Planner Agent` -> `Assessment Agent` -> `AI Mentor Agent`), returning validated Pydantic JSON and step traces.

### `POST /api/v1/mentor/chat` *(Auth Required)*
Handles **Pathy** mentor chats across 6 modes (`Explain`, `Socratic`, `Debug my code`, `Mock interviewer`, `Study planner`, `Motivation coach`) and 3 languages (`English`, `Tamil`, `Tanglish`).

### `POST /api/v1/assessments/analyze` *(Auth Required)*
Evaluates quiz performance and returns adaptive actions (`remediation`, `switch_format_remediation`, `unlock_advanced`, `steady_progress`).

### `POST /api/v1/projects/review` *(Auth Required)*
Generates structured rubric feedback (`summary`, `strengths`, `improvements`, `estimatedScore`) for student portfolio projects.
