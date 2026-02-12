from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
import httpx
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Get Google API Key
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Niche keyword mapping
NICHE_KEYWORDS = {
    "Coding": ["programming tutorial", "coding tips", "software development"],
    "Finance": ["personal finance tips", "investing strategy", "stock market news"],
    "Fitness": ["workout routine", "fat loss tips", "muscle building"],
    "Gaming": ["gameplay walkthrough", "gaming tips", "new game release"],
    "Education": ["study tips", "exam preparation", "learning strategies"]
}

# Pydantic models
class TrendRequest(BaseModel):
    niche: str

class TrendVideo(BaseModel):
    video_id: str
    title: str
    channel: str
    views: int
    published_at: str
    trend_score: float
    youtube_url: str

class TrendResponse(BaseModel):
    niche: str
    top_trends: List[TrendVideo]

class AnalyseRequest(BaseModel):
    video_id: str
    niche: str

class AnalysisDetails(BaseModel):
    hook_style: str
    title_pattern: str
    emotional_driver: str
    why_it_works: str

class CreatorAngle(BaseModel):
    suggested_title: str
    content_direction: str
    hook_example: str

class AnalyseResponse(BaseModel):
    analysis: AnalysisDetails
    creator_angle: CreatorAngle

# Helper function to check API key
def check_api_key():
    if not GOOGLE_API_KEY:
        raise HTTPException(
            status_code=500,
            detail={"error": "GOOGLE_API_KEY environment variable is not set"}
        )

# YouTube API functions
async def search_youtube_videos(keywords: List[str], max_results: int = 15) -> List[dict]:
    """Search YouTube for videos matching keywords"""
    check_api_key()
    
    all_videos = []
    videos_per_keyword = max(5, max_results // len(keywords))
    
    async with httpx.AsyncClient() as client:
        for keyword in keywords:
            try:
                search_url = "https://www.googleapis.com/youtube/v3/search"
                params = {
                    "part": "snippet",
                    "q": keyword,
                    "type": "video",
                    "order": "viewCount",
                    "maxResults": videos_per_keyword,
                    "key": GOOGLE_API_KEY
                }
                
                response = await client.get(search_url, params=params)
                response.raise_for_status()
                data = response.json()
                
                for item in data.get("items", []):
                    video_info = {
                        "video_id": item["id"]["videoId"],
                        "title": item["snippet"]["title"],
                        "channel": item["snippet"]["channelTitle"],
                        "published_at": item["snippet"]["publishedAt"]
                    }
                    # Avoid duplicates
                    if not any(v["video_id"] == video_info["video_id"] for v in all_videos):
                        all_videos.append(video_info)
                        
            except httpx.HTTPError as e:
                logger.error(f"YouTube search error for keyword '{keyword}': {e}")
                continue
    
    return all_videos[:max_results]

async def get_video_statistics(video_ids: List[str]) -> dict:
    """Get statistics for multiple videos"""
    check_api_key()
    
    stats = {}
    
    async with httpx.AsyncClient() as client:
        # YouTube API allows up to 50 video IDs per request
        for i in range(0, len(video_ids), 50):
            batch_ids = video_ids[i:i+50]
            
            try:
                stats_url = "https://www.googleapis.com/youtube/v3/videos"
                params = {
                    "part": "statistics",
                    "id": ",".join(batch_ids),
                    "key": GOOGLE_API_KEY
                }
                
                response = await client.get(stats_url, params=params)
                response.raise_for_status()
                data = response.json()
                
                for item in data.get("items", []):
                    video_id = item["id"]
                    statistics = item.get("statistics", {})
                    stats[video_id] = {
                        "views": int(statistics.get("viewCount", 0)),
                        "likes": int(statistics.get("likeCount", 0)),
                        "comments": int(statistics.get("commentCount", 0))
                    }
                    
            except httpx.HTTPError as e:
                logger.error(f"YouTube statistics error: {e}")
                continue
    
    return stats

async def get_video_details(video_id: str) -> dict:
    """Get detailed info for a single video"""
    check_api_key()
    
    async with httpx.AsyncClient() as client:
        try:
            url = "https://www.googleapis.com/youtube/v3/videos"
            params = {
                "part": "snippet,statistics",
                "id": video_id,
                "key": GOOGLE_API_KEY
            }
            
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data.get("items"):
                item = data["items"][0]
                return {
                    "title": item["snippet"]["title"],
                    "description": item["snippet"].get("description", "")[:500],
                    "channel": item["snippet"]["channelTitle"],
                    "tags": item["snippet"].get("tags", [])[:10],
                    "views": int(item["statistics"].get("viewCount", 0)),
                    "likes": int(item["statistics"].get("likeCount", 0)),
                    "comments": int(item["statistics"].get("commentCount", 0))
                }
        except httpx.HTTPError as e:
            logger.error(f"YouTube video details error: {e}")
            
    return None

def calculate_trend_score(video: dict, stats: dict) -> float:
    """Calculate trend velocity score for a video"""
    views = stats.get("views", 0)
    likes = stats.get("likes", 0)
    comments = stats.get("comments", 0)
    
    # Parse published date
    try:
        published_dt = datetime.fromisoformat(video["published_at"].replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        hours_since_published = max((now - published_dt).total_seconds() / 3600, 1)
    except Exception:
        hours_since_published = 24  # Default to 24 hours
    
    # Calculate view velocity
    view_velocity = views / hours_since_published
    
    # Normalize velocity for scoring (cap at reasonable values)
    normalized_velocity = min(view_velocity / 1000, 100)
    
    # Calculate engagement ratios
    like_ratio = (likes / max(views, 1)) * 100
    comment_ratio = (comments / max(views, 1)) * 100
    
    # Compute trend score
    trend_score = (normalized_velocity * 0.6) + (like_ratio * 0.2) + (comment_ratio * 0.2)
    
    return round(trend_score, 2)

async def analyze_with_gemini(video_details: dict, niche: str) -> dict:
    """Use Gemini to analyze why a video is trending"""
    check_api_key()
    
    prompt = f"""Analyze this YouTube video and explain why it's trending in the {niche} niche.

Video Title: {video_details['title']}
Channel: {video_details['channel']}
Description: {video_details['description']}
Tags: {', '.join(video_details.get('tags', []))}
Views: {video_details['views']:,}
Likes: {video_details['likes']:,}
Comments: {video_details['comments']:,}

You MUST respond with ONLY valid JSON in this exact format, no markdown, no extra text:
{{
  "analysis": {{
    "hook_style": "Describe the hook style used in the title/thumbnail",
    "title_pattern": "Identify the title pattern or formula used",
    "emotional_driver": "What emotional trigger makes viewers click",
    "why_it_works": "Explain why this content works in the {niche} niche"
  }},
  "creator_angle": {{
    "suggested_title": "A specific title idea for a creator to use",
    "content_direction": "What specific content should they create",
    "hook_example": "An opening hook script example"
  }}
}}"""

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            # Use gemini-2.5-flash for analysis
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GOOGLE_API_KEY}"
            
            payload = {
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 1024
                }
            }
            
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            
            # Extract text from Gemini response
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            logger.info(f"Gemini raw response: {text[:500]}...")
            
            # Clean up the response - remove markdown code blocks if present
            text = text.strip()
            if text.startswith("```json"):
                text = text[7:]
            elif text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            
            # Parse JSON
            try:
                result = json.loads(text)
            except json.JSONDecodeError:
                # Try to find JSON object in the response
                import re
                json_match = re.search(r'\{[\s\S]*\}', text)
                if json_match:
                    result = json.loads(json_match.group())
                else:
                    raise
            
            return result
            
        except httpx.HTTPError as e:
            logger.error(f"Gemini API error: {e}")
            raise HTTPException(status_code=500, detail={"error": f"Gemini API error: {str(e)}"})
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response: {e}")
            raise HTTPException(status_code=500, detail={"error": "Failed to parse Gemini response as JSON"})

# API Endpoints
@api_router.get("/")
async def root():
    return {"message": "Niche Trend Intelligence Copilot API"}

@api_router.get("/health")
async def health():
    return {"status": "healthy", "api_key_configured": bool(GOOGLE_API_KEY)}

@api_router.post("/trends", response_model=TrendResponse)
async def get_trends(request: TrendRequest):
    """Fetch trending YouTube videos for a niche"""
    
    # Validate niche
    if request.niche not in NICHE_KEYWORDS:
        raise HTTPException(
            status_code=400,
            detail={"error": f"Invalid niche. Choose from: {list(NICHE_KEYWORDS.keys())}"}
        )
    
    check_api_key()
    
    # Get keywords for the niche
    keywords = NICHE_KEYWORDS[request.niche]
    
    # Search for videos
    videos = await search_youtube_videos(keywords, max_results=15)
    
    if not videos:
        raise HTTPException(
            status_code=404,
            detail={"error": "No videos found for this niche"}
        )
    
    # Get statistics for all videos
    video_ids = [v["video_id"] for v in videos]
    stats = await get_video_statistics(video_ids)
    
    # Calculate trend scores and build response
    trend_videos = []
    for video in videos:
        video_id = video["video_id"]
        video_stats = stats.get(video_id, {"views": 0, "likes": 0, "comments": 0})
        
        trend_score = calculate_trend_score(video, video_stats)
        
        trend_videos.append(TrendVideo(
            video_id=video_id,
            title=video["title"],
            channel=video["channel"],
            views=video_stats["views"],
            published_at=video["published_at"],
            trend_score=trend_score,
            youtube_url=f"https://youtube.com/watch?v={video_id}"
        ))
    
    # Sort by trend score descending and take top 5
    trend_videos.sort(key=lambda x: x.trend_score, reverse=True)
    top_5 = trend_videos[:5]
    
    return TrendResponse(niche=request.niche, top_trends=top_5)

@api_router.post("/analyse", response_model=AnalyseResponse)
async def analyse_video(request: AnalyseRequest):
    """Analyze why a video is trending using Gemini"""
    
    check_api_key()
    
    # Get video details
    video_details = await get_video_details(request.video_id)
    
    if not video_details:
        raise HTTPException(
            status_code=404,
            detail={"error": "Video not found"}
        )
    
    # Analyze with Gemini
    analysis = await analyze_with_gemini(video_details, request.niche)
    
    return AnalyseResponse(
        analysis=AnalysisDetails(**analysis["analysis"]),
        creator_angle=CreatorAngle(**analysis["creator_angle"])
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
