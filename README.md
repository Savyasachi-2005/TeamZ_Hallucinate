# NichePulse

NichePulse is an AI-powered YouTube creator intelligence tool. It combines the YouTube Data API with Google Gemini to find recent niche trends, analyze channels, compare competitors, and turn metrics into practical growth recommendations.

![NichePulse Channel Analysis](./ref3.png)

## Features

- **Niche Trends**: Find and score recent videos for Coding, Finance, Fitness, Gaming, Education, or a custom keyword.
- **Video Analysis**: Get Gemini-powered explanations of a video's hook, title pattern, emotional driver, and creator angle.
- **Channel Analysis**: Inspect channel health, upload consistency, engagement, themes, missed trends, and optional competitor comparisons.
- **Analytics Dashboard**: Explore channel metrics through interactive charts.
- **AI Copilot**: Ask contextual questions about the latest trend or channel analysis.

## Project Structure

```text
backend/
  server.py                 # Uvicorn compatibility entry point
  app/
    app_factory.py          # FastAPI application and router setup
    config.py               # Environment and application configuration
    models.py               # API request and response models
    domain/                 # Pure scoring and analytics logic
    integrations/           # YouTube and Gemini API clients
    services/                # Feature orchestration
    routes/                 # HTTP route handlers
    state/                  # In-memory cache and Copilot context
frontend/
  src/                     # React application
  plugins/                 # CRACO development plugins
backend_test.py             # Manual backend integration checks
```

## Requirements

- Python 3.10 or newer
- Node.js 18 or newer
- YouTube Data API v3 key
- Google Gemini API key

## Setup

### Backend

From the repository root:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Add your API keys to `backend/.env`, then start the API:

```powershell
python -m uvicorn server:app --reload
```

The backend is available at `http://localhost:8000`. Interactive API documentation is at `http://localhost:8000/docs`.

### Frontend

Open a second terminal at the repository root:

```powershell
cd frontend
npm install
npm run dev
```

The frontend is available at `http://localhost:3000` and uses the local backend by default. To use another backend URL, set `REACT_APP_BACKEND_URL` before starting the frontend.

## API Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/` | API welcome message |
| `GET` | `/api/health` | Configuration health check |
| `POST` | `/api/trends` | Fetch and score niche trends |
| `POST` | `/api/analyse` | Analyze one video with Gemini |
| `POST` | `/api/channel-analyse` | Analyze a channel and optional competitor |
| `POST` | `/api/copilot-chat` | Ask the contextual AI Copilot |

## Frontend Pages

- `/` - Landing page
- `/niche-trends` - Trend discovery and video analysis
- `/channel-analysis` - Channel health and strategic analysis
- `/dashboard` - Interactive channel dashboard

## Validation

Compile the backend and verify its application wiring:

```powershell
python -m py_compile backend/server.py
python -c "import backend.server as s; print(s.app)"
```

The project is stateless: analysis results and Copilot context are held in an in-memory cache and are cleared when the backend restarts.

## Security Notes

- Keep API keys in `backend/.env`; never commit that file or paste its values into screenshots.
- If a key has been exposed, revoke it in Google Cloud or Google AI Studio and create a replacement.
- The Gemini model can be changed with the optional `GEMINI_MODEL` environment variable.

## License

MIT © NichePulse
