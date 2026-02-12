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
import hashlib
from functools import wraps
from cachetools import TTLCache

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Get Google API Key
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')

# ==================== ENHANCED CACHING SYSTEM ====================
# Global cache structure with separate TTLs per data type
from time import time

global_cache = {}
context_memory = []  # FIFO queue, max 5 items

# Cache TTL rules (in seconds)
CACHE_TTL = {
    "trends": 600,        # 10 minutes
    "channel": 1200,      # 20 minutes
    "analysis": 1800,     # 30 minutes
    "youtube_api": 900    # 15 minutes for raw API calls
}

def get_from_cache(key: str) -> Optional[Any]:
    """Retrieve data from cache if not expired"""
    if key not in global_cache:
        return None
    
    cache_entry = global_cache[key]
    if time() > cache_entry["expiry"]:
        # Expired - remove from cache
        del global_cache[key]
        logger.info(f"Cache EXPIRED: {key}")
        return None
    
    logger.info(f"Cache HIT: {key}")
    return cache_entry["data"]

def set_cache(key: str, data: Any, ttl_seconds: int):
    """Store data in cache with TTL"""
    global_cache[key] = {
        "data": data,
        "expiry": time() + ttl_seconds
    }
    logger.info(f"Cache SET: {key} (TTL={ttl_seconds}s)")

def add_to_context_memory(context_type: str, data: Dict[str, Any]):
    """Add item to context memory queue (FIFO, max 5)"""
    global context_memory
    
    memory_item = {
        "type": context_type,
        "timestamp": time(),
        "data": data
    }
    
    # Maintain max size of 5
    if len(context_memory) >= 5:
        removed = context_memory.pop(0)  # Remove oldest
        logger.info(f"Context memory full - removed oldest: {removed['type']}")
    
    context_memory.append(memory_item)
    logger.info(f"Context memory added: {context_type} (total: {len(context_memory)})")

def build_context_summary() -> Dict[str, Any]:
    """Build structured context summary from recent memory"""
    if not context_memory:
        return {"message": "No context available", "items": []}
    
    summary = {
        "total_items": len(context_memory),
        "oldest_timestamp": context_memory[0]["timestamp"] if context_memory else None,
        "newest_timestamp": context_memory[-1]["timestamp"] if context_memory else None,
        "items": []
    }
    
    for item in context_memory:
        summary_item = {
            "type": item["type"],
            "timestamp": item["timestamp"],
            "preview": {}
        }
        
        # Extract key information based on type
        if item["type"] == "channel_analysis":
            summary_item["preview"] = {
                "channel_name": item["data"].get("channel_info", {}).get("name"),
                "subscribers": item["data"].get("channel_info", {}).get("subscribers"),
                "health_score_avg": (
                    item["data"].get("health_dashboard", {}).get("consistency_score", 0) +
                    item["data"].get("health_dashboard", {}).get("engagement_stability", 0)
                ) // 2 if item["data"].get("health_dashboard") else 0
            }
        elif item["type"] == "trends":
            summary_item["preview"] = {
                "niche": item["data"].get("niche"),
                "total_trends": len(item["data"].get("top_trends", []))
            }
        elif item["type"] == "comparison":
            summary_item["preview"] = {
                "competitor": item["data"].get("competitor_name"),
                "engagement_gap": item["data"].get("engagement_gap")
            }
        
        summary["items"].append(summary_item)
    
    return summary

# Legacy decorator for backwards compatibility with existing cached functions
def cached_api_call(func):
    """Decorator for YouTube API caching with optimized TTL"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # Generate cache key
        key_data = str(args) + str(sorted(kwargs.items()))
        cache_key_hash = hashlib.md5(key_data.encode()).hexdigest()
        key = f"youtube_api:{func.__name__}:{cache_key_hash}"
        
        # Check cache
        cached_data = get_from_cache(key)
        if cached_data is not None:
            return cached_data
        
        # Call function and cache result
        logger.info(f"Cache MISS for {func.__name__} - calling YouTube API")
        result = await func(*args, **kwargs)
        set_cache(key, result, CACHE_TTL["youtube_api"])
        return result
    
    return wrapper

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
    filtered_videos_count: int
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
    competitor_url: Optional[str] = None

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

# New Growth Health Dashboard Models
class HealthDashboard(BaseModel):
    consistency_score: int
    engagement_stability: int
    topic_focus_score: int
    growth_momentum: str

# New Competitor Comparison Models
class CompetitorComparison(BaseModel):
    competitor_name: str
    engagement_gap: str
    posting_gap: str
    theme_overlap_percentage: int
    missed_topics: List[str]

# New Missed Trend Models
class MissedTrend(BaseModel):
    keyword: str
    trend_score: float
    reason: str

# Enhanced AI Strategic Summary
class StrategicSummary(BaseModel):
    main_risk: str
    growth_opportunity: str
    recommended_action_plan: List[str]

class EnhancedAIAnalysis(BaseModel):
    channel_summary: ChannelSummary
    strategic_summary: StrategicSummary

class ChannelAnalyseResponse(BaseModel):
    channel_info: ChannelInfo
    analytics: ChannelAnalytics
    recent_videos: List[RecentVideo]
    ai_analysis: EnhancedAIAnalysis
    health_dashboard: HealthDashboard
    missed_trends: List[MissedTrend]
    competitor_comparison: Optional[CompetitorComparison] = None

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

# ==================== GROWTH HEALTH DASHBOARD FUNCTIONS ====================

def calculate_consistency_score(upload_dates: List[str]) -> int:
    """
    Calculate consistency score based on upload frequency variance and gaps.
    Returns score 0-100.
    """
    if len(upload_dates) < 3:
        return 50  # Insufficient data
    
    # Parse dates and sort
    dates = sorted([datetime.fromisoformat(d.replace('Z', '+00:00')) for d in upload_dates])
    
    # Calculate gaps between uploads (in days)
    gaps = []
    for i in range(1, len(dates)):
        gap = (dates[i] - dates[i-1]).days
        gaps.append(gap)
    
    if not gaps:
        return 50
    
    # Calculate variance
    avg_gap = sum(gaps) / len(gaps)
    variance = sum((g - avg_gap) ** 2 for g in gaps) / len(gaps)
    std_dev = variance ** 0.5
    
    # Check for long inactivity periods (> 30 days)
    long_gaps = sum(1 for g in gaps if g > 30)
    
    # Score calculation
    # Lower variance = higher consistency
    consistency = 100
    
    # Penalize high variance
    if avg_gap > 0:
        cv = std_dev / avg_gap  # Coefficient of variation
        consistency -= min(cv * 30, 40)  # Max 40 point penalty
    
    # Penalize long gaps
    consistency -= long_gaps * 15  # 15 points per long gap
    
    return max(0, min(100, int(consistency)))

def calculate_engagement_stability(engagement_rates: List[float]) -> int:
    """
    Calculate engagement stability based on variance in recent videos.
    Returns score 0-100.
    """
    if len(engagement_rates) < 5:
        return 50  # Insufficient data
    
    # Use last 15-20 videos
    recent_rates = engagement_rates[:20]
    
    if not recent_rates or len(recent_rates) < 5:
        return 50
    
    # Calculate variance
    avg_rate = sum(recent_rates) / len(recent_rates)
    if avg_rate == 0:
        return 50
    
    variance = sum((r - avg_rate) ** 2 for r in recent_rates) / len(recent_rates)
    std_dev = variance ** 0.5
    cv = std_dev / avg_rate  # Coefficient of variation
    
    # Check trend direction (improving/declining)
    recent_half = recent_rates[:len(recent_rates)//2]
    older_half = recent_rates[len(recent_rates)//2:]
    
    recent_avg = sum(recent_half) / len(recent_half) if recent_half else 0
    older_avg = sum(older_half) / len(older_half) if older_half else 0
    
    trend_bonus = 0
    if recent_avg > older_avg * 1.1:  # 10% improvement
        trend_bonus = 10
    elif recent_avg < older_avg * 0.9:  # 10% decline
        trend_bonus = -10
    
    # Score calculation
    stability = 100
    stability -= min(cv * 100, 50)  # Max 50 point penalty for variance
    stability += trend_bonus
    
    return max(0, min(100, int(stability)))

def calculate_topic_focus_score(themes: List[str], all_titles: List[str]) -> int:
    """
    Calculate topic focus based on theme concentration and drift.
    Returns score 0-100.
    """
    if len(all_titles) < 5:
        return 50
    
    # Extract themes from last 5 videos vs all videos
    recent_titles = all_titles[:5]
    older_titles = all_titles[5:]
    
    recent_themes = extract_themes_from_titles(recent_titles)
    older_themes = extract_themes_from_titles(older_titles) if older_titles else []
    
    # Theme concentration (how focused on top themes)
    theme_words = [w.lower() for w in themes]
    all_words = []
    for title in all_titles:
        tokens = re.findall(r'\b[a-zA-Z]{3,}\b', title.lower())
        all_words.extend([w for w in tokens if w not in STOPWORDS])
    
    if not all_words:
        return 50
    
    # Count how often top themes appear
    theme_count = sum(1 for w in all_words if w in theme_words)
    concentration_ratio = theme_count / len(all_words)
    
    # Topic drift detection
    if older_themes:
        overlap = len(set(recent_themes) & set(older_themes))
        drift_penalty = (5 - overlap) * 5  # Penalize if recent themes are completely different
    else:
        drift_penalty = 0
    
    # Score calculation
    focus_score = concentration_ratio * 100
    focus_score -= drift_penalty
    
    return max(0, min(100, int(focus_score)))

def determine_growth_momentum(engagement_rates: List[float], upload_dates: List[str]) -> str:
    """
    Determine overall growth momentum: Improving, Stable, or Declining.
    """
    if len(engagement_rates) < 10 or len(upload_dates) < 10:
        return "Stable"  # Insufficient data
    
    # Split into recent vs older periods
    recent = engagement_rates[:5]
    older = engagement_rates[5:10]
    
    recent_avg = sum(recent) / len(recent)
    older_avg = sum(older) / len(older)
    
    # Calculate percentage change
    if older_avg == 0:
        return "Stable"
    
    change = (recent_avg - older_avg) / older_avg
    
    if change > 0.15:  # 15% improvement
        return "Improving"
    elif change < -0.15:  # 15% decline
        return "Declining"
    else:
        return "Stable"

# ==================== COMPETITOR COMPARISON FUNCTIONS ====================

def compute_competitor_gap(
    creator_analytics: dict,
    creator_themes: List[str],
    competitor_analytics: dict,
    competitor_themes: List[str]
) -> dict:
    """
    Compute gap analysis between creator and competitor.
    """
    # Engagement gap
    creator_engagement = creator_analytics.get('average_engagement_rate', 0)
    competitor_engagement = competitor_analytics.get('average_engagement_rate', 0)
    
    engagement_diff = competitor_engagement - creator_engagement
    engagement_gap = f"+{engagement_diff:.1f}%" if engagement_diff > 0 else f"{engagement_diff:.1f}%"
    
    # Posting frequency gap
    creator_freq = creator_analytics.get('upload_frequency_per_month', 0)
    competitor_freq = competitor_analytics.get('upload_frequency_per_month', 0)
    
    if creator_freq > 0:
        freq_ratio = competitor_freq / creator_freq
        if freq_ratio > 1.2:
            posting_gap = f"Competitor posts {freq_ratio:.1f}x more frequently"
        elif freq_ratio < 0.8:
            posting_gap = f"You post {1/freq_ratio:.1f}x more frequently"
        else:
            posting_gap = "Similar posting frequency"
    else:
        posting_gap = "Insufficient data"
    
    # Theme overlap
    creator_theme_set = set([t.lower() for t in creator_themes])
    competitor_theme_set = set([t.lower() for t in competitor_themes])
    
    overlap = len(creator_theme_set & competitor_theme_set)
    total_unique = len(creator_theme_set | competitor_theme_set)
    
    overlap_percentage = int((overlap / total_unique * 100)) if total_unique > 0 else 0
    
    # Missed topics (topics competitor covers but creator doesn't)
    missed = list(competitor_theme_set - creator_theme_set)[:5]  # Top 5 missed topics
    
    return {
        "engagement_gap": engagement_gap,
        "posting_gap": posting_gap,
        "theme_overlap_percentage": overlap_percentage,
        "missed_topics": missed
    }

# ==================== MISSED TREND DETECTOR ====================

def detect_missed_trends(creator_themes: List[str], niche_keywords: List[str], trending_videos: List[dict]) -> List[dict]:
    """
    Detect trending topics the creator hasn't covered - IMPROVED LOGIC
    """
    if not trending_videos or not creator_themes:
        return []
    
    # Extract meaningful themes from trending video titles (not single generic words)
    trending_titles = [v.get('title', '') for v in trending_videos]
    
    # Extract multi-word phrases and meaningful topics
    trending_topics = {}
    
    for title in trending_titles:
        # Clean and tokenize title
        title_lower = title.lower()
        words = re.findall(r'\b[a-zA-Z]{4,}\b', title_lower)  # Min 4 chars
        
        # Look for 2-3 word phrases (more meaningful than single words)
        for i in range(len(words) - 1):
            phrase = f"{words[i]} {words[i+1]}"
            # Skip if contains creator's existing themes
            if not any(theme.lower() in phrase for theme in creator_themes):
                if phrase not in STOPWORDS and len(phrase) > 8:  # Min phrase length
                    trending_topics[phrase] = trending_topics.get(phrase, 0) + 1
    
    # Also consider single meaningful words (if they appear frequently)
    word_counts = Counter()
    for title in trending_titles:
        words = re.findall(r'\b[a-zA-Z]{5,}\b', title.lower())  # Min 5 chars for single words
        word_counts.update([w for w in words if w not in STOPWORDS])
    
    # Filter out creator's existing themes
    creator_theme_set = set([t.lower() for t in creator_themes])
    
    missed = []
    
    # Add phrase-based trends
    for phrase, count in sorted(trending_topics.items(), key=lambda x: x[1], reverse=True):
        if count >= 2:  # Must appear in at least 2 videos
            trend_score = min(95, (count / len(trending_videos)) * 400)
            missed.append({
                "keyword": phrase.title(),
                "trend_score": round(trend_score, 1),
                "reason": f"Trending topic appearing in {count} videos, not covered in your channel"
            })
    
    # Add high-frequency single word trends (only if very popular)
    for word, count in word_counts.most_common(15):
        if word not in creator_theme_set and count >= 3:
            # Skip if already covered by phrases
            if not any(word in m["keyword"].lower() for m in missed):
                trend_score = min(90, (count / len(trending_videos)) * 350)
                missed.append({
                    "keyword": word.title(),
                    "trend_score": round(trend_score, 1),
                    "reason": f"High-frequency keyword in {count} trending videos"
                })
    
    # Sort by trend score and return top 5
    missed.sort(key=lambda x: x["trend_score"], reverse=True)
    return missed[:5]

# ==================== YOUTUBE API FUNCTIONS ====================

@cached_api_call
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

@cached_api_call
async def get_video_details(video_id: str) -> dict:
    """Get detailed info for a single video"""
    check_api_key()
    
    async with httpx.AsyncClient() as client:
        try:
            url = "https://www.googleapis.com/youtube/v3/videos"
            params = {
                "part": "statistics",  # OPTIMIZED: Only statistics needed
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

@cached_api_call
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

@cached_api_call
async def get_channel_metadata(channel_id: str) -> dict:
    """Fetch channel metadata including uploads playlist"""
    check_api_key()
    
    async with httpx.AsyncClient() as client:
        try:
            url = "https://www.googleapis.com/youtube/v3/channels"
            params = {
                "part": "snippet,statistics,contentDetails",  # REVERT: Need statistics for subscriber count
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

# ==================== STRICT TRENDING DETECTION ENGINE ====================
# Trending = High Growth Velocity + High Engagement + Strong Recency + Relative Acceleration
# STRICT RULE: Videos older than 60 days are NEVER included

import math

# Maximum age in days - STRICT LIMIT
MAX_VIDEO_AGE_DAYS = 60

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
        return 9999  # Return high value to filter out on parse error

def calculate_views_per_day(views: int, days: int) -> float:
    """Calculate views per day velocity"""
    return views / max(days, 1)

def calculate_engagement_rate(views: int, likes: int, comments: int) -> float:
    """Calculate engagement rate: (likes + comments) / views"""
    return (likes + comments) / max(views, 1)

def calculate_recency_weight(days: int) -> float:
    """
    Exponential recency weight using exp(-days/30).
    Creates smooth decay favoring recent videos.
    
    Examples:
    - 1 day  = 0.967 (97%)
    - 7 days = 0.792 (79%)
    - 14 days = 0.627 (63%)
    - 30 days = 0.368 (37%)
    - 60 days = 0.135 (14%)
    """
    return math.exp(-days / 30)

def calculate_acceleration_score(views_per_day: float, dataset_avg_vpd: float) -> float:
    """
    Calculate acceleration: how much faster is this video growing 
    compared to the dataset average.
    
    acceleration = views_per_day / dataset_average_views_per_day
    """
    if dataset_avg_vpd <= 0:
        return 1.0
    return views_per_day / dataset_avg_vpd

def calculate_competition_score(video_keywords: List[str], all_keywords_list: List[List[str]]) -> tuple:
    """Calculate competition score based on title similarity."""
    if not video_keywords or not all_keywords_list:
        return 100, "Low"
    
    similar_count = 0
    video_keywords_set = set(video_keywords)
    
    for other_keywords in all_keywords_list:
        if video_keywords_set & set(other_keywords):
            similar_count += 1
    
    similar_count = max(0, similar_count - 1)
    
    if similar_count >= 8:
        return 30, "High"
    elif similar_count >= 4:
        return 60, "Medium"
    else:
        return 100, "Low"

def normalize_scores(values: List[float]) -> List[float]:
    """Normalize a list of values to 0-100 scale"""
    if not values:
        return []
    max_val = max(values)
    if max_val == 0:
        return [0.0] * len(values)
    return [min(100, max(0, (v / max_val) * 100)) for v in values]

def calculate_trend_scores_batch(videos: List[dict], stats: dict) -> List[dict]:
    """
    STRICT Trending Detection Engine.
    
    Formula: trend_score = 
        (normalized_velocity * 0.35) +
        (normalized_engagement * 0.20) +
        (normalized_recency * 0.25) +
        (normalized_acceleration * 0.20)
    
    STRICT RULES:
    - Videos > 60 days old are NEVER included
    - Minimum 100 views required
    - Exponential recency decay using exp(-days/30)
    """
    
    # ========== STEP 1: HARD RECENCY FILTER (60 DAYS MAX) ==========
    filtered_candidates = []
    skipped_old = 0
    skipped_low_views = 0
    
    for video in videos:
        video_id = video["video_id"]
        video_stats = stats.get(video_id, {"views": 0, "likes": 0, "comments": 0})
        
        views = video_stats.get("views", 0)
        likes = video_stats.get("likes", 0)
        comments = video_stats.get("comments", 0)
        days = calculate_days_since_upload(video["published_at"])
        
        # STRICT: Skip videos older than 60 days - NO EXCEPTIONS
        if days > MAX_VIDEO_AGE_DAYS:
            skipped_old += 1
            continue
        
        # Skip videos with very low views (noise)
        if views < 100:
            skipped_low_views += 1
            continue
        
        # Calculate metrics
        views_per_day = calculate_views_per_day(views, days)
        engagement_rate = calculate_engagement_rate(views, likes, comments)
        recency_weight = calculate_recency_weight(days)
        
        filtered_candidates.append({
            **video,
            "stats": video_stats,
            "days": days,
            "views_per_day": views_per_day,
            "engagement_rate": engagement_rate,
            "recency_weight": recency_weight,
            "title_keywords": extract_title_keywords(video["title"])
        })
    
    logger.info(f"Filtered: {len(filtered_candidates)} valid, skipped {skipped_old} old (>60d), {skipped_low_views} low views")
    
    if not filtered_candidates:
        return []
    
    # ========== STEP 2: CALCULATE ACCELERATION ==========
    # Calculate dataset average views_per_day for acceleration scoring
    all_vpd = [c["views_per_day"] for c in filtered_candidates]
    dataset_avg_vpd = sum(all_vpd) / len(all_vpd) if all_vpd else 1
    
    for candidate in filtered_candidates:
        candidate["acceleration_score"] = calculate_acceleration_score(
            candidate["views_per_day"], 
            dataset_avg_vpd
        )
    
    # ========== STEP 3: NORMALIZE ALL METRICS ==========
    velocities = [c["views_per_day"] for c in filtered_candidates]
    engagements = [c["engagement_rate"] for c in filtered_candidates]
    recencies = [c["recency_weight"] for c in filtered_candidates]
    accelerations = [c["acceleration_score"] for c in filtered_candidates]
    
    norm_velocities = normalize_scores(velocities)
    norm_engagements = normalize_scores(engagements)
    # Recency weight is already 0-1, convert to 0-100
    norm_recencies = [r * 100 for r in recencies]
    norm_accelerations = normalize_scores(accelerations)
    
    # Get keywords for competition scoring
    all_keywords = [c["title_keywords"] for c in filtered_candidates]
    
    # ========== STEP 4: CALCULATE FINAL TREND SCORES ==========
    results = []
    
    for i, candidate in enumerate(filtered_candidates):
        n_velocity = norm_velocities[i]
        n_engagement = norm_engagements[i]
        n_recency = norm_recencies[i]
        n_acceleration = norm_accelerations[i]
        
        # Get competition score
        competition_score, competition_level = calculate_competition_score(
            candidate["title_keywords"], 
            all_keywords
        )
        
        # FINAL FORMULA:
        # trend_score = (velocity * 0.35) + (engagement * 0.20) + (recency * 0.25) + (acceleration * 0.20)
        trend_score = (
            (n_velocity * 0.35) +
            (n_engagement * 0.20) +
            (n_recency * 0.25) +
            (n_acceleration * 0.20)
        )
        
        # Clamp to 0-100
        trend_score = round(min(100, max(0, trend_score)), 2)
        
        results.append({
            "video_id": candidate["video_id"],
            "title": candidate["title"],
            "channel": candidate["channel"],
            "views": candidate["stats"]["views"],
            "published_at": candidate["published_at"],
            "trend_score": trend_score,
            "views_per_day": round(candidate["views_per_day"], 2),
            "engagement_rate": round(candidate["engagement_rate"], 4),
            "recency_days": candidate["days"],
            "competition_level": competition_level
        })
    
    # ========== STEP 5: SORT BY TREND SCORE ==========
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
        except (ValueError, TypeError):
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

async def analyze_channel_with_strategic_insights(
    channel_data: dict,
    analytics: dict,
    recent_titles: List[str],
    health_dashboard: dict,
    missed_trends: List[dict],
    competitor_gap: Optional[dict] = None
) -> dict:
    """Enhanced Gemini analysis with strategic insights for growth"""
    check_api_key()
    
    titles_text = "\n".join([f"- {t}" for t in recent_titles[:10]])
    themes_text = ", ".join(analytics.get("top_themes", []))
    
    # Build health metrics summary
    health_summary = f"""
Growth Health Metrics:
- Consistency Score: {health_dashboard['consistency_score']}/100
- Engagement Stability: {health_dashboard['engagement_stability']}/100
- Topic Focus: {health_dashboard['topic_focus_score']}/100
- Growth Momentum: {health_dashboard['growth_momentum']}"""
    
    # Build missed trends summary
    missed_summary = ""
    if missed_trends:
        missed_summary = "\n\nMissed Trending Topics:\n"
        for trend in missed_trends[:3]:
            missed_summary += f"- {trend['keyword']} (trend score: {trend['trend_score']})\n"
    
    # Build competitor comparison summary
    competitor_summary = ""
    if competitor_gap:
        competitor_summary = f"""

Competitor Analysis:
- Engagement Gap: {competitor_gap['engagement_gap']}
- {competitor_gap['posting_gap']}
- Theme Overlap: {competitor_gap['theme_overlap_percentage']}%
- Topics you're missing: {', '.join(competitor_gap['missed_topics'][:3])}"""
    
    prompt = f"""You are an AI Copilot for Sustainable Growth in the Creator Economy. Analyze this YouTube channel and provide strategic insights.

Channel: {channel_data['title']}
Subscribers: {channel_data['subscriber_count']:,}
Total Videos: {channel_data['video_count']}
Average Engagement Rate: {analytics['average_engagement_rate']:.2%}
Upload Frequency: {analytics['upload_frequency_per_month']:.1f} videos/month
Top Themes: {themes_text}

{health_summary}{missed_summary}{competitor_summary}

Recent Video Titles:
{titles_text}

Based on the metrics provided above (DO NOT hallucinate), provide:

1. A brief channel summary (primary niche, content style, growth pattern, strength, weakness)
2. A strategic summary with:
   - The main risk threatening sustainable growth
   - The biggest growth opportunity
   - A 3-step action plan

Return ONLY this JSON (no markdown, no extra text):
{{"channel_summary":{{"primary_niche":"main content category","content_style":"description of style","growth_pattern":"assessment","strength":"key strength","weakness":"area to improve"}},"strategic_summary":{{"main_risk":"specific risk based on metrics","growth_opportunity":"specific opportunity based on data","recommended_action_plan":["step 1","step 2","step 3"]}}}}"""

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GOOGLE_API_KEY}"
            
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 3072,
                    "responseMimeType": "application/json"
                }
            }
            
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            logger.info(f"Strategic Gemini response: {text[:500]}...")
            
            # Clean up the response
            text = text.strip()
            
            # Remove markdown code blocks
            if text.startswith("```json"):
                text = text[7:]
            elif text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            
            text = text.strip()
            
            # Remove any trailing commas before closing braces/brackets (common JSON error)
            text = re.sub(r',\s*}', '}', text)
            text = re.sub(r',\s*]', ']', text)
            
            try:
                result = json.loads(text)
            except json.JSONDecodeError as e:
                logger.error(f"Initial JSON parse failed: {e}")
                logger.error(f"Problematic text: {text}")
                
                # Try to extract JSON using regex as fallback
                json_match = re.search(r'\{[\s\S]*\}', text)
                if json_match:
                    extracted_text = json_match.group()
                    # Clean up extracted text
                    extracted_text = re.sub(r',\s*}', '}', extracted_text)
                    extracted_text = re.sub(r',\s*]', ']', extracted_text)
                    
                    try:
                        result = json.loads(extracted_text)
                    except json.JSONDecodeError:
                        # Last resort: provide fallback structure
                        logger.error("All JSON parsing attempts failed, using fallback")
                        result = {
                            "channel_summary": {
                                "primary_niche": "Unable to determine",
                                "content_style": "Analysis in progress",
                                "growth_pattern": "Data processing",
                                "strength": "High quality content",
                                "weakness": "Detailed analysis unavailable"
                            },
                            "strategic_summary": {
                                "main_risk": "API processing limitation encountered",
                                "growth_opportunity": "Continue analyzing metrics for insights",
                                "recommended_action_plan": [
                                    "Review health dashboard metrics",
                                    "Compare with competitor data if available",
                                    "Focus on missed trend opportunities"
                                ]
                            }
                        }
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
    """Fetch trending YouTube videos using robust Trending Detection Engine - WITH CACHING"""
    
    check_api_key()
    
    # Generate cache key
    cache_key_data = f"{request.niche}:{request.custom_keyword}"
    cache_key = f"trends:{hashlib.md5(cache_key_data.encode()).hexdigest()}"
    
    # Check cache first
    cached_result = get_from_cache(cache_key)
    if cached_result is not None:
        logger.info(f"Returning cached trends")
        return cached_result
    
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
            detail={"error": "No trending videos found within 60 days (strict recency filter)"}
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
    
    result = TrendResponse(
        niche=search_label,
        filtered_videos_count=len(scored_videos),
        top_trends=trend_videos,
        trending_topics=trending_topics if trending_topics else None
    )
    
    # Cache result
    set_cache(cache_key, result, CACHE_TTL["trends"])
    
    # Add to context memory
    add_to_context_memory("trends", {
        "niche": search_label,
        "total_videos": len(scored_videos),
        "top_video_title": top_videos[0]["title"] if top_videos else None
    })
    
    return result

@api_router.post("/analyse", response_model=AnalyseResponse)
async def analyse_video(request: AnalyseRequest):
    """Analyze why a video is trending using Gemini - WITH CACHING"""
    
    check_api_key()
    
    # Generate cache key
    cache_key = f"analysis:{request.video_id}"
    
    # Check cache first
    cached_result = get_from_cache(cache_key)
    if cached_result is not None:
        logger.info(f"Returning cached analysis for video {request.video_id}")
        return cached_result
    
    video_details = await get_video_details(request.video_id)
    
    if not video_details:
        raise HTTPException(
            status_code=404,
            detail={"error": "Video not found"}
        )
    
    analysis = await analyze_with_gemini(video_details, request.niche)
    
    result = AnalyseResponse(
        analysis=AnalysisDetails(**analysis["analysis"]),
        creator_angle=CreatorAngle(**analysis["creator_angle"])
    )
    
    # Cache result
    set_cache(cache_key, result, CACHE_TTL["analysis"])
    
    return result

@api_router.post("/channel-analyse", response_model=ChannelAnalyseResponse)
async def analyse_channel(request: ChannelAnalyseRequest):
    """Enhanced AI Copilot for Sustainable Growth - Analyze YouTube channel"""
    
    check_api_key()
    
    # === STEP 1: Analyze Main Channel ===
    identifier, id_type = extract_channel_identifier(request.channel_url)
    logger.info(f"Extracted identifier: {identifier}, type: {id_type}")
    
    channel_id = await resolve_channel_id(identifier, id_type)
    logger.info(f"Resolved channel ID: {channel_id}")
    
    channel_data = await get_channel_metadata(channel_id)
    videos = await get_playlist_videos(channel_data["uploads_playlist_id"], max_results=20)
    
    if not videos:
        raise HTTPException(
            status_code=404,
            detail={"error": "No videos found for this channel"}
        )
    
    analytics = compute_channel_analytics(videos)
    recent_titles = [v["title"] for v in videos[:10]]
    
    # === STEP 2: Compute Health Dashboard ===
    upload_dates = [v["published_at"] for v in videos]
    engagement_rates = [(v.get("likes", 0) + v.get("comments", 0)) / max(v.get("views", 1), 1) for v in videos]
    
    consistency_score = calculate_consistency_score(upload_dates)
    engagement_stability = calculate_engagement_stability(engagement_rates)
    topic_focus_score = calculate_topic_focus_score(analytics["top_themes"], recent_titles)
    growth_momentum = determine_growth_momentum(engagement_rates, upload_dates)
    
    health_dashboard = {
        "consistency_score": consistency_score,
        "engagement_stability": engagement_stability,
        "topic_focus_score": topic_focus_score,
        "growth_momentum": growth_momentum
    }
    
    # === STEP 3: Detect Missed Trends ===
    # Auto-detect niche from creator's themes
    creator_themes = analytics["top_themes"]
    
    # Use creator's top 2 themes as niche keywords for better relevance
    detected_niche_keywords = creator_themes[:2] if len(creator_themes) >= 2 else creator_themes
    
    # If themes are too generic, try to infer from channel name/description
    if not detected_niche_keywords or all(len(k) < 4 for k in detected_niche_keywords):
        # Fallback: use a broader search
        detected_niche_keywords = [channel_data["title"].split()[0]] if channel_data["title"] else ["trending"]
    
    # Search for trending videos in detected niche with better query
    trending_videos = await search_youtube_videos(detected_niche_keywords, max_results=50)
    
    # Enhanced missed trend detection
    missed_trends = detect_missed_trends(
        creator_themes,
        detected_niche_keywords,
        trending_videos
    )
    
    # If no meaningful trends found, provide helpful message
    if not missed_trends:
        missed_trends = [{
            "keyword": "Explore your niche",
            "trend_score": 0,
            "reason": f"Based on your content ({', '.join(creator_themes[:3])}), explore related trending topics in your niche"
        }]
    
    # === STEP 4: Competitor Comparison (Optional) ===
    competitor_comparison_data = None
    
    if request.competitor_url:
        try:
            # Analyze competitor channel
            comp_identifier, comp_id_type = extract_channel_identifier(request.competitor_url)
            comp_channel_id = await resolve_channel_id(comp_identifier, comp_id_type)
            comp_channel_data = await get_channel_metadata(comp_channel_id)
            comp_videos = await get_playlist_videos(comp_channel_data["uploads_playlist_id"], max_results=20)
            
            if comp_videos:
                comp_analytics = compute_channel_analytics(comp_videos)
                comp_themes = comp_analytics["top_themes"]
                
                # Compute gap analysis
                gap_analysis = compute_competitor_gap(
                    analytics,
                    creator_themes,
                    comp_analytics,
                    comp_themes
                )
                
                competitor_comparison_data = CompetitorComparison(
                    competitor_name=comp_channel_data["title"],
                    engagement_gap=gap_analysis["engagement_gap"],
                    posting_gap=gap_analysis["posting_gap"],
                    theme_overlap_percentage=gap_analysis["theme_overlap_percentage"],
                    missed_topics=gap_analysis["missed_topics"]
                )
        except Exception as e:
            logger.error(f"Competitor analysis failed: {e}")
            # Continue without competitor data
    
    # === STEP 5: Enhanced AI Strategic Analysis ===
    ai_analysis = await analyze_channel_with_strategic_insights(
        channel_data,
        analytics,
        recent_titles,
        health_dashboard,
        [{"keyword": m["keyword"], "trend_score": m["trend_score"], "reason": m["reason"]} for m in missed_trends],
        {
            "engagement_gap": competitor_comparison_data.engagement_gap,
            "posting_gap": competitor_comparison_data.posting_gap,
            "theme_overlap_percentage": competitor_comparison_data.theme_overlap_percentage,
            "missed_topics": competitor_comparison_data.missed_topics
        } if competitor_comparison_data else None
    )
    
    # === STEP 6: Build Response ===
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
        ai_analysis=EnhancedAIAnalysis(
            channel_summary=ChannelSummary(**ai_analysis["channel_summary"]),
            strategic_summary=StrategicSummary(**ai_analysis["strategic_summary"])
        ),
        health_dashboard=HealthDashboard(**health_dashboard),
        missed_trends=[
            MissedTrend(
                keyword=trend["keyword"],
                trend_score=trend["trend_score"],
                reason=trend["reason"]
            )
            for trend in missed_trends
        ],
        competitor_comparison=competitor_comparison_data
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
