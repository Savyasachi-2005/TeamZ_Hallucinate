# Niche Pulse - PRD

## Original Problem Statement
Build a Niche Trend Intelligence Copilot for YouTube creators that:
1. Allows user to select a niche (Coding, Finance, Fitness, Gaming, Education)
2. Fetches trending YouTube videos within that niche
3. Ranks them using a trend velocity score
4. Displays Top 5 trending videos
5. On click → Gemini explains why the video is trending
6. Gemini suggests one actionable creator content angle

## User Choices
- Dark theme design
- Gemini 2.5 Flash model
- User's own GOOGLE_API_KEY

## Architecture

### Backend (FastAPI)
- **POST /api/trends**: Fetch and rank top 5 trending videos for a niche
- **POST /api/analyse**: AI-powered video analysis using Gemini
- Uses YouTube Data API v3 for video search and statistics
- Uses Gemini 2.5 Flash for trend analysis

### Frontend (React)
- Shadcn UI components (Select, Dialog)
- Dark glassmorphism design
- Bento grid layout for video cards
- Analysis modal with AI insights

## User Personas
- YouTube content creators seeking trend intelligence
- New creators looking for content ideas
- Marketing teams analyzing viral content

## Core Requirements (Static)
- [x] Niche selection dropdown
- [x] Fetch Trends functionality
- [x] Top 5 video display with trend scores
- [x] Video analysis with Gemini AI
- [x] Creator angle suggestions
- [x] Loading states
- [x] Error handling

## What's Been Implemented (Jan 2026)
- Complete backend with YouTube API and Gemini integration
- Dark-themed frontend with glassmorphism design
- Trend velocity scoring algorithm
- AI-powered video analysis
- Responsive bento grid layout
- Analysis modal with hook style, title pattern, emotional driver, why it works
- Creator angle with suggested title, content direction, hook example

## Tech Stack
- Backend: FastAPI, httpx, Pydantic
- Frontend: React, Tailwind CSS, Shadcn UI
- APIs: YouTube Data API v3, Google Gemini 2.5 Flash

## Backlog
### P0 (Done)
- Core trend fetching
- Gemini analysis integration
- UI implementation

### P1 (Future)
- Save favorite videos/analyses
- Export analysis reports
- Compare trends across niches

### P2 (Future)
- Historical trend tracking
- Custom niche keyword inputs
- Batch video analysis

## Next Tasks
- Add ability to customize search keywords per niche
- Implement trend history tracking
- Add export functionality for analysis reports
