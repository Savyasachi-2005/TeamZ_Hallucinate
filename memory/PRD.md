# Niche Pulse - PRD

## Original Problem Statement
Build a Niche Trend Intelligence Copilot for YouTube creators with multiple modes:
1. **Niche Trends**: Select niche, fetch top 5 trending videos, click to analyze with Gemini
2. **Channel Analysis**: Paste YouTube channel URL, get full channel analysis with AI strategic insights
3. **Analytics Dashboard**: Interactive charts and visualizations for channel data

## User Choices
- Light theme design with professional SaaS aesthetic
- Gemini AI model for strategic analysis
- User's own GOOGLE_API_KEY
- Recharts library for data visualization

## Architecture

### Backend (FastAPI)
**Existing Endpoints:**
- `POST /api/trends` - Fetch and rank top 5 trending videos for a niche
- `POST /api/analyse` - AI-powered video analysis using Gemini
- `POST /api/channel-analyse` - Full channel analysis with health dashboard, missed trends, competitor comparison
- `POST /api/copilot-chat` - Contextual AI assistant

### Frontend (React)
**Pages:**
- `/` - Landing page with feature cards
- `/niche-trends` - Niche trend exploration
- `/channel-analysis` - Detailed channel analysis with AI insights
- `/dashboard` - **NEW: Interactive Analytics Dashboard**

**UI Components:**
- Tubelight navbar for navigation
- Expandable chat widget for AI copilot
- Magnetize buttons with particle animation
- Glowing effect cards
- Recharts visualizations (Bar, Line, Area, Pie, RadialBar)

## User Personas
- YouTube content creators seeking trend intelligence
- New creators looking for content ideas
- Marketing teams analyzing viral content
- Creators researching competitor channels

## Core Requirements (Static)
- [x] Niche selection dropdown (5 niches)
- [x] Fetch Trends functionality
- [x] Top 5 video display with trend scores
- [x] Video analysis with Gemini AI
- [x] Creator angle suggestions
- [x] Channel URL input (supports @username, /channel/ID, /c/name, /user/name)
- [x] Channel overview display
- [x] Engagement metrics visualization
- [x] Top themes extraction
- [x] Recent videos list
- [x] AI strategic insights
- [x] Loading states
- [x] Error handling
- [x] **NEW: Interactive Analytics Dashboard with charts**

## What's Been Implemented

### Phase 1 (Jan 2026)
- Complete backend with YouTube API and Gemini integration
- Dark-themed frontend with glassmorphism design
- Trend velocity scoring algorithm
- AI-powered video analysis
- Responsive bento grid layout

### Phase 2 (Feb 2026)
- **Channel Analysis Mode**
  - Channel URL parsing (multiple formats supported)
  - Channel metadata fetching via YouTube API
  - Analytics computation (engagement rate, upload frequency)
  - Topic/theme extraction from video titles
  - AI strategic analysis via Gemini
  - Health dashboard with scores
  - Missed trends detection
  - Competitor comparison

### Phase 3 (Feb 2026) - CURRENT
- **UI/UX Overhaul to Light Theme**
  - Professional minimal SaaS aesthetic
  - Tubelight navbar with animated indicator
  - Expandable chat widget
  - Magnetize button animations
  - Glowing effect cards

- **NEW: Separate Analytics Dashboard Page** (`/dashboard`)
  - Radial gauge charts for health scores (Consistency, Stability, Focus, Momentum)
  - Horizontal bar chart for recent video views
  - Area chart for engagement trends over time
  - Donut chart for content theme distribution
  - Vertical bar chart for video engagement rates
  - Quick stats summary cards (Subscribers, Avg Engagement, Videos/Month, Total Videos)
  - Competitor comparison bar chart (when competitor URL provided)

## Tech Stack
- Backend: FastAPI, httpx, Pydantic, cachetools
- Frontend: React, Tailwind CSS, Shadcn UI, Recharts, D3-shape
- Animation: Framer Motion, Motion library
- Icons: Lucide React
- APIs: YouTube Data API v3, Google Gemini AI

## Backlog
### P0 (Done)
- Core trend fetching
- Gemini analysis integration
- UI implementation
- Channel Analysis feature
- Interactive Analytics Dashboard

### P1 (Future)
- User-configurable filter for video age (30/60/90 days) in trend analysis
- Search history for custom niches
- Save favorite videos/analyses
- Export analysis reports

### P2 (Future)
- Historical trend tracking
- Trend-over-time visualization
- Batch video analysis
- Multi-channel comparison

## Files of Reference
- `/app/backend/server.py` - Backend API (monolithic, needs refactoring)
- `/app/frontend/src/pages/DashboardPage.jsx` - Analytics Dashboard page
- `/app/frontend/src/components/AnalyticsDashboard.jsx` - Dashboard charts component
- `/app/frontend/src/components/ChannelAnalysisTab.jsx` - Channel analysis UI
- `/app/frontend/src/components/Navigation.jsx` - Tubelight navbar
- `/app/frontend/src/components/ui/` - Reusable UI components

## Next Tasks
1. Add user-configurable filter for video age in trend analysis
2. Implement search history for niches
3. Add export functionality for dashboard/reports
4. Refactor server.py into smaller modules
