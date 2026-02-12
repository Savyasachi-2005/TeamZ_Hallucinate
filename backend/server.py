from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import re
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from collections import Counter
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

# Stopwords for theme extraction
STOPWORDS = {
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once',
    'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
    'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now', 'i', 'me',
    'my', 'you', 'your', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who',
    'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'doing', 'would', 'could',
    'ought', 'im', 'youre', 'hes', 'shes', 'its', 'were', 'theyre', 'ive', 'youve',
    'weve', 'theyve', 'id', 'youd', 'hed', 'shed', 'wed', 'theyd', 'ill', 'youll',
    'hell', 'shell', 'well', 'theyll', 'isnt', 'arent', 'wasnt', 'werent', 'hasnt',
    'havent', 'hadnt', 'doesnt', 'dont', 'didnt', 'wont', 'wouldnt', 'shouldnt',
    'cant', 'couldnt', 'mustnt', 'lets', 'thats', 'whos', 'whats', 'heres', 'theres',
    'whens', 'wheres', 'whys', 'hows', 'new', 'get', 'got', 'make', 'made', 'full',
    'video', 'watch', 'see', 'like', 'subscribe', 'channel', 'part', 'episode', 'ep'
}

# Niche keyword mapping
NICHE_KEYWORDS = {
    "Coding": ["programming tutorial", "coding tips", "software development"],
    "Finance": ["personal finance tips", "investing strategy", "stock market news"],
    "Fitness": ["workout routine", "fat loss tips", "muscle building"],
    "Gaming": ["gameplay walkthrough", "gaming tips", "new game release"],
    "Education": ["study tips", "exam preparation", "learning strategies"]
}

def sanitize_keyword(keyword: str) -> str:
    """Sanitize custom keyword input"""
    if not keyword:
        return ""
    # Strip whitespace
    keyword = keyword.strip()
    # Remove HTML tags
    keyword = re.sub(r'<[^>]+>', '', keyword)
    # Limit length
    keyword = keyword[:100]
    # Remove potentially dangerous characters
    keyword = re.sub(r'[<>"\';\\]', '', keyword)
    return keyword

# ==================== PYDANTIC MODELS ====================

# Existing Trend Models
class TrendRequest(BaseModel):
    niche: Optional[str] = None
    custom_keyword: Optional[str] = None

class TrendVideo(BaseModel):
    video_id: str
    title: str
    channel: str
    views: int
    published_at: str
    trend_score: float
    youtube_url: str
    # New enhanced metrics
    views_per_day: float
    engagement_rate: float
    recency_days: int
    competition_level: str

class TrendResponse(BaseModel):
    niche: str
    top_trends: List[TrendVideo]
    trending_topics: Optional[List[str]] = None

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

# New Channel Analysis Models
class ChannelAnalyseRequest(BaseModel):
    channel_url: str

class ChannelInfo(BaseModel):
    name: str
    subscribers: int
    total_videos: int
    channel_id: str
    thumbnail: Optional[str] = None

class ChannelAnalytics(BaseModel):
    average_engagement_rate: float
    upload_frequency_per_month: float
    top_themes: List[str]

class RecentVideo(BaseModel):
    title: str
    views: int
    engagement_rate: float
    published_at: str
    video_id: str

class ChannelSummary(BaseModel):
    primary_niche: str
    content_style: str
    growth_pattern: str
    strength: str
    weakness: str

class AIAnalysis(BaseModel):
    channel_summary: ChannelSummary
    strategic_recommendations: List[str]

class ChannelAnalyseResponse(BaseModel):
    channel_info: ChannelInfo
    analytics: ChannelAnalytics
    recent_videos: List[RecentVideo]
    ai_analysis: AIAnalysis

# ==================== HELPER FUNCTIONS ====================

def check_api_key():
    if not GOOGLE_API_KEY:
        raise HTTPException(
            status_code=500,
            detail={"error": "GOOGLE_API_KEY environment variable is not set"}
        )

def extract_channel_identifier(url: str) -> tuple:
    """Extract channel identifier and type from URL"""
    url = url.strip()
    
    # Handle @username format
    match = re.search(r'youtube\.com/@([^/?]+)', url)
    if match:
        return match.group(1), 'handle'
    
    # Handle /channel/ID format
    match = re.search(r'youtube\.com/channel/([^/?]+)', url)
    if match:
        return match.group(1), 'id'
    
    # Handle /c/customname format
    match = re.search(r'youtube\.com/c/([^/?]+)', url)
    if match:
        return match.group(1), 'custom'
    
    # Handle /user/username format
    match = re.search(r'youtube\.com/user/([^/?]+)', url)
    if match:
        return match.group(1), 'user'
    
    # Handle bare @username
    if url.startswith('@'):
        return url[1:], 'handle'
    
    raise HTTPException(
        status_code=400,
        detail={"error": "Invalid YouTube channel URL. Supported formats: @username, /channel/ID, /c/name, /user/name"}
    )

def extract_themes_from_titles(titles: List[str]) -> List[str]:
    """Extract top themes from video titles"""
    words = []
    for title in titles:
        # Tokenize and clean
        tokens = re.findall(r'\b[a-zA-Z]{3,}\b', title.lower())
        words.extend([w for w in tokens if w not in STOPWORDS])
    
    # Count occurrences
    word_counts = Counter(words)
    
    # Return top 5 themes
    return [word for word, _ in word_counts.most_common(5)]

# ==================== YOUTUBE API FUNCTIONS ====================

async def search_youtube_videos(keywords: List[str], max_results: int = 50) -> List[dict]:
    """Search YouTube for videos matching keywords"""
    check_api_key()
    
    all_videos = []
    videos_per_keyword = max(15, max_results // len(keywords))
    
    async with httpx.AsyncClient() as client:
        for keyword in keywords:
            try:
                search_url = "https://www.googleapis.com/youtube/v3/search"
                params = {
                    "part": "snippet",
                    "q": keyword,
                    "type": "video",
                    "order": "relevance",  # Changed from viewCount for better trend detection
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

async def resolve_channel_id(identifier: str, id_type: str) -> str:
    """Resolve various channel identifier types to channel ID"""
    check_api_key()
    
    async with httpx.AsyncClient() as client:
        try:
            if id_type == 'id':
                return identifier
            
            url = "https://www.googleapis.com/youtube/v3/search"
            
            if id_type == 'handle':
                # Search for @handle
                params = {
                    "part": "snippet",
                    "q": f"@{identifier}",
                    "type": "channel",
                    "maxResults": 1,
                    "key": GOOGLE_API_KEY
                }
            else:
                # Search for custom URL or username
                params = {
                    "part": "snippet",
                    "q": identifier,
                    "type": "channel",
                    "maxResults": 1,
                    "key": GOOGLE_API_KEY
                }
            
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data.get("items"):
                return data["items"][0]["snippet"]["channelId"]
            
            # Try channels endpoint with forHandle
            if id_type == 'handle':
                url = "https://www.googleapis.com/youtube/v3/channels"
                params = {
                    "part": "id",
                    "forHandle": identifier,
                    "key": GOOGLE_API_KEY
                }
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                if data.get("items"):
                    return data["items"][0]["id"]
            
            raise HTTPException(
                status_code=404,
                detail={"error": f"Channel not found: {identifier}"}
            )
            
        except httpx.HTTPError as e:
            logger.error(f"Channel resolution error: {e}")
            raise HTTPException(
                status_code=500,
                detail={"error": f"Failed to resolve channel: {str(e)}"}
            )

async def get_channel_metadata(channel_id: str) -> dict:
    """Fetch channel metadata including uploads playlist"""
    check_api_key()
    
    async with httpx.AsyncClient() as client:
        try:
            url = "https://www.googleapis.com/youtube/v3/channels"
            params = {
                "part": "snippet,statistics,contentDetails",
                "id": channel_id,
                "key": GOOGLE_API_KEY
            }
            
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if not data.get("items"):
                raise HTTPException(
                    status_code=404,
                    detail={"error": "Channel not found"}
                )
            
            item = data["items"][0]
            return {
                "channel_id": channel_id,
                "title": item["snippet"]["title"],
                "thumbnail": item["snippet"]["thumbnails"].get("medium", {}).get("url"),
                "subscriber_count": int(item["statistics"].get("subscriberCount", 0)),
                "video_count": int(item["statistics"].get("videoCount", 0)),
                "uploads_playlist_id": item["contentDetails"]["relatedPlaylists"]["uploads"]
            }
            
        except httpx.HTTPError as e:
            logger.error(f"Channel metadata error: {e}")
            raise HTTPException(
                status_code=500,
                detail={"error": f"Failed to fetch channel data: {str(e)}"}
            )

async def get_playlist_videos(playlist_id: str, max_results: int = 20) -> List[dict]:
    """Fetch videos from a playlist (uploads playlist)"""
    check_api_key()
    
    videos = []
    
    async with httpx.AsyncClient() as client:
        try:
            url = "https://www.googleapis.com/youtube/v3/playlistItems"
            params = {
                "part": "snippet,contentDetails",
                "playlistId": playlist_id,
                "maxResults": max_results,
                "key": GOOGLE_API_KEY
            }
            
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            for item in data.get("items", []):
                videos.append({
                    "video_id": item["contentDetails"]["videoId"],
                    "title": item["snippet"]["title"],
                    "published_at": item["snippet"]["publishedAt"]
                })
            
            # Fetch statistics for all videos
            if videos:
                video_ids = [v["video_id"] for v in videos]
                stats = await get_video_statistics(video_ids)
                
                for video in videos:
                    vid_stats = stats.get(video["video_id"], {})
                    video["views"] = vid_stats.get("views", 0)
                    video["likes"] = vid_stats.get("likes", 0)
                    video["comments"] = vid_stats.get("comments", 0)
            
            return videos
            
        except httpx.HTTPError as e:
            logger.error(f"Playlist videos error: {e}")
            raise HTTPException(
                status_code=500,
                detail={"error": f"Failed to fetch videos: {str(e)}"}
            )

# ==================== ANALYTICS FUNCTIONS ====================

# ==================== TRENDING DETECTION ENGINE ====================
# TRUE Trending = High Growth Momentum + High Engagement + Strong Recency + Low Competition
# Old viral videos are filtered out - only recent, fast-growing content qualifies

import math

def extract_title_keywords(title: str, top_n: int = 3) -> List[str]:
    """Extract top N keywords from a title"""
    tokens = re.findall(r'\b[a-zA-Z]{3,}\b', title.lower())
    filtered = [w for w in tokens if w not in STOPWORDS]
    return filtered[:top_n]

def calculate_days_since_upload(published_at: str) -> int:
    """Calculate days since video was uploaded"""
    try:
        published_dt = datetime.fromisoformat(published_at.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        days = (now - published_dt).days
        return max(days, 1)
    except Exception:
        return 1

def calculate_engagement_rate(views: int, likes: int, comments: int) -> float:
    """Calculate engagement rate: (likes + comments) / views"""
    return (likes + comments) / max(views, 1)

def calculate_adjusted_velocity(views: int, days: int) -> float:
    """
    Calculate momentum-adjusted velocity with recency multiplier.
    adjusted_velocity = views_per_day * (1 / sqrt(days_since_upload))
    This naturally penalizes older videos.
    """
    views_per_day = views / max(days, 1)
    recency_multiplier = 1 / math.sqrt(max(days, 1))
    return views_per_day * recency_multiplier

def calculate_competition_score(video_keywords: List[str], all_keywords_list: List[List[str]]) -> tuple:
    """
    Calculate competition score based on title similarity.
    Returns (score, level_string)
    """
    if not video_keywords or not all_keywords_list:
        return 100, "Low"
    
    similar_count = 0
    video_keywords_set = set(video_keywords)
    
    for other_keywords in all_keywords_list:
        other_set = set(other_keywords)
        if video_keywords_set & other_set:
            similar_count += 1
    
    similar_count = max(0, similar_count - 1)
    
    if similar_count >= 8:
        return 30, "High"
    elif similar_count >= 4:
        return 60, "Medium"
    else:
        return 100, "Low"

def calculate_recency_penalty_score(days: int) -> float:
    """
    Calculate recency penalty score.
    Formula: clip(100 - days * 2, 0, 100)
    Recent videos score high, old videos score low.
    """
    return min(100, max(0, 100 - days * 2))

def normalize_scores(values: List[float]) -> List[float]:
    """Normalize a list of values to 0-100 scale"""
    if not values:
        return []
    
    max_val = max(values)
    if max_val == 0:
        return [0.0] * len(values)
    
    return [min(100, max(0, (v / max_val) * 100)) for v in values]

def calculate_median(values: List[float]) -> float:
    """Calculate median of a list"""
    if not values:
        return 0
    sorted_vals = sorted(values)
    n = len(sorted_vals)
    if n % 2 == 0:
        return (sorted_vals[n//2 - 1] + sorted_vals[n//2]) / 2
    return sorted_vals[n//2]

def apply_hard_filters(videos: List[dict], stats: dict, max_days: int = 30) -> List[dict]:
    """
    Apply hard filters to remove non-trending videos.
    
    Filters:
    1. Exclude views < 100
    2. Exclude engagement_rate < 0.01 (1%)
    3. Exclude days_since_upload > max_days
    """
    filtered = []
    
    for video in videos:
        video_id = video["video_id"]
        video_stats = stats.get(video_id, {"views": 0, "likes": 0, "comments": 0})
        
        views = video_stats.get("views", 0)
        likes = video_stats.get("likes", 0)
        comments = video_stats.get("comments", 0)
        
        # Filter 1: Minimum views
        if views < 100:
            continue
        
        # Filter 2: Minimum engagement rate (1%)
        engagement_rate = calculate_engagement_rate(views, likes, comments)
        if engagement_rate < 0.01:
            continue
        
        # Filter 3: Maximum age
        days = calculate_days_since_upload(video["published_at"])
        if days > max_days:
            continue
        
        filtered.append({
            **video,
            "stats": video_stats,
            "days": days,
            "engagement_rate": engagement_rate
        })
    
    return filtered

def calculate_trend_scores_batch(videos: List[dict], stats: dict) -> List[dict]:
    """
    Calculate trend scores using TRUE Trending Detection Engine.
    
    Formula: trend_score = 
        (normalized_velocity * 0.50) + 
        (normalized_engagement * 0.25) + 
        (recency_penalty_score * 0.15) + 
        (competition_score * 0.10)
    
    Old viral videos are filtered out - only recent, fast-growing content qualifies.
    """
    
    # Step 1: Apply hard filters (30 days max)
    filtered_videos = apply_hard_filters(videos, stats, max_days=30)
    
    # If fewer than 5 videos, relax to 60 days
    if len(filtered_videos) < 5:
        logger.info("Relaxing recency filter to 60 days due to insufficient results")
        filtered_videos = apply_hard_filters(videos, stats, max_days=60)
    
    if not filtered_videos:
        return []
    
    # Step 2: Calculate adjusted velocity for all videos
    for video in filtered_videos:
        views = video["stats"]["views"]
        days = video["days"]
        video["adjusted_velocity"] = calculate_adjusted_velocity(views, days)
        video["views_per_day"] = views / max(days, 1)
        video["title_keywords"] = extract_title_keywords(video["title"])
    
    # Step 3: Apply velocity threshold (exclude below median)
    velocities = [v["adjusted_velocity"] for v in filtered_videos]
    median_velocity = calculate_median(velocities)
    
    # Keep videos above median velocity (or all if too few remain)
    above_median = [v for v in filtered_videos if v["adjusted_velocity"] >= median_velocity]
    if len(above_median) < 5:
        # Keep at least 5 videos even if below median
        above_median = sorted(filtered_videos, key=lambda x: x["adjusted_velocity"], reverse=True)[:max(5, len(filtered_videos))]
    
    if not above_median:
        return []
    
    # Step 4: Normalize velocity and engagement
    adj_velocities = [v["adjusted_velocity"] for v in above_median]
    engagements = [v["engagement_rate"] for v in above_median]
    
    normalized_velocities = normalize_scores(adj_velocities)
    normalized_engagements = normalize_scores(engagements)
    
    # Collect all keywords for competition calculation
    all_title_keywords = [v["title_keywords"] for v in above_median]
    
    # Step 5: Calculate final trend scores
    results = []
    
    for i, video in enumerate(above_median):
        video_stats = video["stats"]
        days = video["days"]
        
        # Get normalized values
        norm_velocity = normalized_velocities[i]
        norm_engagement = normalized_engagements[i]
        
        # Calculate recency penalty score: clip(100 - days * 2, 0, 100)
        recency_score = calculate_recency_penalty_score(days)
        
        # Calculate competition score
        competition_score, competition_level = calculate_competition_score(
            video["title_keywords"], 
            all_title_keywords
        )
        
        # Final trend score calculation
        # trend_score = (velocity * 0.50) + (engagement * 0.25) + (recency * 0.15) + (competition * 0.10)
        trend_score = (
            (norm_velocity * 0.50) +
            (norm_engagement * 0.25) +
            (recency_score * 0.15) +
            (competition_score * 0.10)
        )
        
        # Clamp and round
        trend_score = round(min(100, max(0, trend_score)), 2)
        
        results.append({
            "video_id": video["video_id"],
            "title": video["title"],
            "channel": video["channel"],
            "views": video_stats["views"],
            "published_at": video["published_at"],
            "trend_score": trend_score,
            "views_per_day": round(video["views_per_day"], 2),
            "engagement_rate": round(video["engagement_rate"], 4),
            "recency_days": days,
            "competition_level": competition_level
        })
    
    # Sort by trend_score descending
    results.sort(key=lambda x: x["trend_score"], reverse=True)
    
    return results

def extract_trending_topics(videos: List[dict], top_n: int = 3) -> List[str]:
    """
    Extract trending topics from video titles.
    Group similar 2-3 word phrases and return top by average trend score.
    """
    if not videos:
        return []
    
    # Extract bigrams and trigrams from titles
    phrase_scores = {}
    
    for video in videos:
        title = video.get("title", "")
        score = video.get("trend_score", 0)
        
        # Tokenize
        tokens = re.findall(r'\b[a-zA-Z]{3,}\b', title.lower())
        filtered = [w for w in tokens if w not in STOPWORDS]
        
        # Generate bigrams
        for i in range(len(filtered) - 1):
            phrase = f"{filtered[i]} {filtered[i+1]}"
            if phrase not in phrase_scores:
                phrase_scores[phrase] = []
            phrase_scores[phrase].append(score)
    
    # Calculate average score per phrase
    phrase_avg = {}
    for phrase, scores in phrase_scores.items():
        if len(scores) >= 2:  # Only phrases appearing in 2+ videos
            phrase_avg[phrase] = sum(scores) / len(scores)
    
    # Sort by average score
    sorted_phrases = sorted(phrase_avg.items(), key=lambda x: x[1], reverse=True)
    
    return [phrase for phrase, _ in sorted_phrases[:top_n]]

# Legacy function for backward compatibility (channel analysis uses this)
def calculate_trend_score(video: dict, stats: dict) -> float:
    """Legacy trend score calculation - kept for channel analysis compatibility"""
    views = stats.get("views", 0)
    likes = stats.get("likes", 0)
    comments = stats.get("comments", 0)
    
    try:
        published_dt = datetime.fromisoformat(video["published_at"].replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        hours_since_published = max((now - published_dt).total_seconds() / 3600, 1)
    except Exception:
        hours_since_published = 24
    
    view_velocity = views / hours_since_published
    normalized_velocity = min(view_velocity / 1000, 100)
    like_ratio = (likes / max(views, 1)) * 100
    comment_ratio = (comments / max(views, 1)) * 100
    trend_score = (normalized_velocity * 0.6) + (like_ratio * 0.2) + (comment_ratio * 0.2)
    
    return round(trend_score, 2)

def compute_channel_analytics(videos: List[dict]) -> dict:
    """Compute channel analytics from recent videos"""
    if not videos:
        return {
            "average_engagement_rate": 0,
            "upload_frequency_per_month": 0,
            "top_themes": []
        }
    
    engagement_rates = []
    publish_dates = []
    titles = []
    
    for video in videos:
        views = video.get("views", 0)
        likes = video.get("likes", 0)
        comments = video.get("comments", 0)
        
        # Engagement rate per video
        engagement = (likes + comments) / max(views, 1)
        engagement_rates.append(engagement)
        
        # Collect publish dates and titles
        titles.append(video.get("title", ""))
        try:
            pub_date = datetime.fromisoformat(video["published_at"].replace("Z", "+00:00"))
            publish_dates.append(pub_date)
        except:
            pass
    
    # Average engagement rate
    avg_engagement = sum(engagement_rates) / len(engagement_rates) if engagement_rates else 0
    
    # Upload frequency (videos per month)
    upload_frequency = 0
    if len(publish_dates) >= 2:
        publish_dates.sort()
        date_range = (publish_dates[-1] - publish_dates[0]).days
        if date_range > 0:
            months = date_range / 30
            upload_frequency = len(publish_dates) / max(months, 1)
    
    # Top themes
    top_themes = extract_themes_from_titles(titles)
    
    return {
        "average_engagement_rate": round(avg_engagement, 4),
        "upload_frequency_per_month": round(upload_frequency, 1),
        "top_themes": top_themes
    }

# ==================== GEMINI AI FUNCTIONS ====================

async def analyze_with_gemini(video_details: dict, niche: str) -> dict:
    """Use Gemini to analyze why a video is trending"""
    check_api_key()
    
    prompt = f"""Analyze this YouTube video trending in {niche}:

Title: {video_details['title']}
Channel: {video_details['channel']}
Views: {video_details['views']:,}

Return ONLY this JSON (no markdown):
{{"analysis":{{"hook_style":"brief description","title_pattern":"pattern used","emotional_driver":"trigger","why_it_works":"reason"}},"creator_angle":{{"suggested_title":"title idea","content_direction":"what to create","hook_example":"opening line"}}}}"""

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GOOGLE_API_KEY}"
            
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 2048,
                    "responseMimeType": "application/json"
                }
            }
            
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            text = text.strip()
            if text.startswith("```json"):
                text = text[7:]
            elif text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            
            try:
                result = json.loads(text)
            except json.JSONDecodeError:
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

async def analyze_channel_with_gemini(channel_data: dict, analytics: dict, recent_titles: List[str]) -> dict:
    """Use Gemini to analyze a YouTube channel"""
    check_api_key()
    
    titles_text = "\n".join([f"- {t}" for t in recent_titles[:10]])
    themes_text = ", ".join(analytics.get("top_themes", []))
    
    prompt = f"""Analyze this YouTube channel:

Channel: {channel_data['title']}
Subscribers: {channel_data['subscriber_count']:,}
Total Videos: {channel_data['video_count']}
Average Engagement Rate: {analytics['average_engagement_rate']:.2%}
Upload Frequency: {analytics['upload_frequency_per_month']:.1f} videos/month
Top Themes: {themes_text}

Recent Video Titles:
{titles_text}

Return ONLY this JSON (no markdown):
{{"channel_summary":{{"primary_niche":"main content category","content_style":"description of style","growth_pattern":"assessment of growth trajectory","strength":"key strength","weakness":"area to improve"}},"strategic_recommendations":["recommendation 1","recommendation 2","recommendation 3"]}}"""

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GOOGLE_API_KEY}"
            
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 2048,
                    "responseMimeType": "application/json"
                }
            }
            
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            logger.info(f"Channel Gemini response: {text[:300]}...")
            
            text = text.strip()
            if text.startswith("```json"):
                text = text[7:]
            elif text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            
            try:
                result = json.loads(text)
            except json.JSONDecodeError:
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

# ==================== API ENDPOINTS ====================

@api_router.get("/")
async def root():
    return {"message": "Niche Trend Intelligence Copilot API"}

@api_router.get("/health")
async def health():
    return {"status": "healthy", "api_key_configured": bool(GOOGLE_API_KEY)}

@api_router.post("/trends", response_model=TrendResponse)
async def get_trends(request: TrendRequest):
    """Fetch trending YouTube videos using robust Trending Detection Engine"""
    
    check_api_key()
    
    # Determine search keywords
    search_label = ""
    keywords = []
    
    # Priority: custom_keyword > niche
    if request.custom_keyword:
        sanitized = sanitize_keyword(request.custom_keyword)
        if len(sanitized) < 3:
            raise HTTPException(
                status_code=400,
                detail={"error": "Custom keyword must be at least 3 characters"}
            )
        keywords = [sanitized]
        search_label = sanitized
    elif request.niche:
        if request.niche not in NICHE_KEYWORDS:
            raise HTTPException(
                status_code=400,
                detail={"error": f"Invalid niche. Choose from: {list(NICHE_KEYWORDS.keys())}"}
            )
        keywords = NICHE_KEYWORDS[request.niche]
        search_label = request.niche
    else:
        raise HTTPException(
            status_code=400,
            detail={"error": "Please provide either a niche or custom keyword"}
        )
    
    # Fetch 30-50 videos for better trend analysis
    videos = await search_youtube_videos(keywords, max_results=40)
    
    if not videos:
        raise HTTPException(
            status_code=404,
            detail={"error": "No videos found for this search"}
        )
    
    # Get statistics for all videos
    video_ids = [v["video_id"] for v in videos]
    stats = await get_video_statistics(video_ids)
    
    # Use new Trending Detection Engine
    scored_videos = calculate_trend_scores_batch(videos, stats)
    
    if not scored_videos:
        raise HTTPException(
            status_code=404,
            detail={"error": "No qualifying videos found (minimum 100 views required)"}
        )
    
    # Extract trending topics
    trending_topics = extract_trending_topics(scored_videos)
    
    # Build response with top 5 videos
    top_videos = scored_videos[:5]
    trend_videos = [
        TrendVideo(
            video_id=v["video_id"],
            title=v["title"],
            channel=v["channel"],
            views=v["views"],
            published_at=v["published_at"],
            trend_score=v["trend_score"],
            youtube_url=f"https://youtube.com/watch?v={v['video_id']}",
            views_per_day=v["views_per_day"],
            engagement_rate=v["engagement_rate"],
            recency_days=v["recency_days"],
            competition_level=v["competition_level"]
        )
        for v in top_videos
    ]
    
    return TrendResponse(
        niche=search_label, 
        top_trends=trend_videos,
        trending_topics=trending_topics if trending_topics else None
    )

@api_router.post("/analyse", response_model=AnalyseResponse)
async def analyse_video(request: AnalyseRequest):
    """Analyze why a video is trending using Gemini"""
    
    check_api_key()
    
    video_details = await get_video_details(request.video_id)
    
    if not video_details:
        raise HTTPException(
            status_code=404,
            detail={"error": "Video not found"}
        )
    
    analysis = await analyze_with_gemini(video_details, request.niche)
    
    return AnalyseResponse(
        analysis=AnalysisDetails(**analysis["analysis"]),
        creator_angle=CreatorAngle(**analysis["creator_angle"])
    )

@api_router.post("/channel-analyse", response_model=ChannelAnalyseResponse)
async def analyse_channel(request: ChannelAnalyseRequest):
    """Analyze a YouTube channel"""
    
    check_api_key()
    
    # Step 1: Extract channel identifier
    identifier, id_type = extract_channel_identifier(request.channel_url)
    logger.info(f"Extracted identifier: {identifier}, type: {id_type}")
    
    # Step 2: Resolve to channel ID
    channel_id = await resolve_channel_id(identifier, id_type)
    logger.info(f"Resolved channel ID: {channel_id}")
    
    # Step 3: Fetch channel metadata
    channel_data = await get_channel_metadata(channel_id)
    
    # Step 4: Fetch recent videos
    videos = await get_playlist_videos(channel_data["uploads_playlist_id"], max_results=20)
    
    if not videos:
        raise HTTPException(
            status_code=404,
            detail={"error": "No videos found for this channel"}
        )
    
    # Step 5: Compute analytics
    analytics = compute_channel_analytics(videos)
    
    # Step 6: AI Analysis
    recent_titles = [v["title"] for v in videos[:10]]
    ai_analysis = await analyze_channel_with_gemini(channel_data, analytics, recent_titles)
    
    # Build recent videos response (top 5)
    recent_videos_response = []
    for video in videos[:5]:
        views = video.get("views", 0)
        likes = video.get("likes", 0)
        comments = video.get("comments", 0)
        engagement = (likes + comments) / max(views, 1)
        
        recent_videos_response.append(RecentVideo(
            title=video["title"],
            views=views,
            engagement_rate=round(engagement, 4),
            published_at=video["published_at"],
            video_id=video["video_id"]
        ))
    
    return ChannelAnalyseResponse(
        channel_info=ChannelInfo(
            name=channel_data["title"],
            subscribers=channel_data["subscriber_count"],
            total_videos=channel_data["video_count"],
            channel_id=channel_id,
            thumbnail=channel_data.get("thumbnail")
        ),
        analytics=ChannelAnalytics(
            average_engagement_rate=analytics["average_engagement_rate"],
            upload_frequency_per_month=analytics["upload_frequency_per_month"],
            top_themes=analytics["top_themes"]
        ),
        recent_videos=recent_videos_response,
        ai_analysis=AIAnalysis(
            channel_summary=ChannelSummary(**ai_analysis["channel_summary"]),
            strategic_recommendations=ai_analysis["strategic_recommendations"]
        )
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
