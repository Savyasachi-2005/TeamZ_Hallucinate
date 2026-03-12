# 🚀 NichePulse

> **AI-powered YouTube analytics platform** that analyzes channels, detects trending topics, and delivers strategic growth recommendations - so creators grow smarter, not harder.

🔗 **Live :** [growth-intel-2.emergent.host](https://growth-intel-2.emergent.host)



## Overview

NichePulse is an AI copilot built for YouTube creators who want to make data-driven decisions. It connects to the **YouTube Data API** and **Google Gemini AI** to surface channel health scores, emerging niche trends, missed topic opportunities, and competitor benchmarks — all in one place.

---

## Features

### Niche Trends Explorer `/niche-trends`
- Discover trending videos in your niche from the **last 5 days**
- AI-powered **momentum scoring** to identify what's gaining traction early
- Click any video to receive an AI analysis with creator angle suggestions

### Channel Analysis `/channel-analysis`
- Paste any YouTube channel URL for comprehensive insights
- **Growth Health Dashboard** with 4 key scores:

  | Score | What It Measures |
  |-------|-----------------|
  | Consistency Score | Upload regularity |
  | Engagement Stability | Audience interaction patterns |
  | Topic Focus Score | Content coherence across videos |
  | Growth Momentum | Channel trajectory indicator |

- **Missed Trend Detection** - topics in your niche you haven't covered yet
- **Competitor Comparison** - side-by-side benchmarking against rivals
- **AI Strategic Summary** - risks, opportunities, and action plans

### Interactive Dashboard `/dashboard`
- Visual charts and graphs for channel metrics
- Radial gauges for health scores
- Bar / Line / Pie charts for views, engagement, and themes
- Quick stats cards: Subscribers, Engagement Rate, Videos/Month

### AI Copilot Chat *(Global)*
- Contextual AI assistant available on **every page**
- Ask questions about your current analysis
- Get personalized, real-time growth recommendations

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Tailwind CSS, Recharts, Framer Motion |
| Backend | FastAPI (Python) |
| AI | Google Gemini AI |
| External API | YouTube Data API v3 |
| Database | None (Stateless) |

---

## User Flow

```
1. Creator visits NichePulse
         ↓
2. Enters YouTube channel URL or selects a niche
         ↓
3. System fetches data from YouTube Data API v3
         ↓
4. Google Gemini AI analyzes and generates insights
         ↓
5. Creator sees health scores, trends, and recommendations
         ↓
6. Views interactive dashboard with charts
         ↓
7. Takes action based on the AI strategic plan
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.10
- YouTube Data API v3 key
- Google Gemini API key

### Installation

```bash
# Clone the repository
git clone https://github.com/Savyasachi-2005/TeamZ_Hallucinate.git
cd nichepulse
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
YOUTUBE_API_KEY=your_youtube_data_api_key
GEMINI_API_KEY=your_google_gemini_api_key
```

---

## Pages & Routes

| Route | Feature |
|-------|---------|
| `/` | Landing / Home |
| `/niche-trends` | Niche Trends Explorer |
| `/channel-analysis` | Channel Health Analysis |
| `/dashboard` | Interactive Metrics Dashboard |

---

## Value Propositions

| Benefit | Description |
|---------|-------------|
| Stop Guessing | Data-driven content decisions replace intuition |
| Find Trends Early | 5-day recency filter catches momentum before it peaks |
| Know Your Health | Clear scores across consistency, engagement, and focus |
| Beat Competitors | Side-by-side comparison insights |
| Never Miss Trends | Auto-detect topics your channel hasn't covered |
| AI Strategy | Personalized growth action plans on demand |

---

## License

MIT © NichePulse
