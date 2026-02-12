# Niche Pulse - PRD

## Original Problem Statement
Build a Niche Trend Intelligence Copilot for YouTube creators with two modes:
1. **Niche Trends**: Select niche, fetch top 5 trending videos, click to analyze with Gemini
2. **Channel Analysis**: Paste YouTube channel URL, get full channel analysis with AI strategic insights

## User Choices
- Dark theme design
- Gemini 2.5 Flash model
- User's own GOOGLE_API_KEY

## Architecture

### Backend (FastAPI)
**Existing Endpoints:**
- `POST /api/trends` - Fetch and rank top 5 trending videos for a niche
- `POST /api/analyse` - AI-powered video analysis using Gemini

**New Endpoint (Feb 2026):**
- `POST /api/channel-analyse` - Full channel analysis including:
  - Channel metadata (name, subscribers, video count)
  - Analytics (engagement rate, upload frequency, top themes)
  - Recent videos with engagement metrics
  - AI strategic insights (niche, style, growth pattern, strengths, weaknesses, recommendations)

### Frontend (React)
- Tabs for switching between Niche Trends and Channel Analysis
- Shadcn UI components (Select, Dialog, Tabs, Input)
- Dark glassmorphism design
- Bento grid layout for video cards
- Analytics cards for channel metrics
- AI insights panel with strategic recommendations

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

## What's Been Implemented

### Phase 1 (Jan 2026)
- Complete backend with YouTube API and Gemini integration
- Dark-themed frontend with glassmorphism design
- Trend velocity scoring algorithm
- AI-powered video analysis
- Responsive bento grid layout

### Phase 2 (Feb 2026)
- **NEW: Channel Analysis Mode**
  - Channel URL parsing (multiple formats supported)
  - Channel metadata fetching via YouTube API
  - Analytics computation (engagement rate, upload frequency)
  - Topic/theme extraction from video titles
  - AI strategic analysis via Gemini
  - Full UI for channel results display

## Tech Stack
- Backend: FastAPI, httpx, Pydantic
- Frontend: React, Tailwind CSS, Shadcn UI
- APIs: YouTube Data API v3, Google Gemini 2.5 Flash

## Backlog
### P0 (Done)
- Core trend fetching
- Gemini analysis integration
- UI implementation
- Channel Analysis feature

### P1 (Future)
- Save favorite videos/analyses
- Export analysis reports
- Compare trends across niches
- Channel comparison mode

### P2 (Future)
- Historical trend tracking
- Custom niche keyword inputs
- Batch video analysis
- Multi-channel comparison

## Next Tasks
1. Add ability to save channel analysis results
2. Implement channel comparison feature
3. Add export functionality for reports
4. Create historical trend tracking
