import hashlib
from fastapi import HTTPException
from ..config import NICHE_KEYWORDS, logger
from ..models import TrendResponse, TrendVideo
from ..state.cache import get_from_cache, set_cache, CACHE_TTL
from ..state.context import add_to_context_memory
from ..domain.text import sanitize_keyword
from ..domain.trends import calculate_trend_scores_batch, extract_trending_topics
from ..integrations.youtube import (
    search_youtube_videos,
    get_video_statistics,
    check_api_key,
)


async def get_trends(request):
    check_api_key("youtube")
    key = f"trends:{hashlib.md5(f'{request.niche}:{request.custom_keyword}'.encode()).hexdigest()}"
    cached = get_from_cache(key)
    if cached is not None:
        return cached
    if request.custom_keyword:
        label = sanitize_keyword(request.custom_keyword)
        if len(label) < 3:
            raise HTTPException(
                status_code=400,
                detail={"error": "Custom keyword must be at least 3 characters"},
            )
        keywords = [label]
    elif request.niche:
        if request.niche not in NICHE_KEYWORDS:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": f"Invalid niche. Choose from: {list(NICHE_KEYWORDS.keys())}"
                },
            )
        label = request.niche
        keywords = NICHE_KEYWORDS[label]
    else:
        raise HTTPException(
            status_code=400,
            detail={"error": "Please provide either a niche or custom keyword"},
        )
    videos = await search_youtube_videos(keywords, 50, 5)
    if not videos:
        raise HTTPException(
            status_code=404, detail={"error": "No videos found for this search"}
        )
    scored = calculate_trend_scores_batch(
        videos, await get_video_statistics([v["video_id"] for v in videos])
    )
    if not scored:
        raise HTTPException(
            status_code=404,
            detail={
                "error": "No trending videos found within 5 days (strict recency filter)"
            },
        )
    top = scored[:5]
    result = TrendResponse(
        niche=label,
        filtered_videos_count=len(scored),
        top_trends=[
            TrendVideo(**v, youtube_url=f"https://youtube.com/watch?v={v['video_id']}")
            for v in top
        ],
        trending_topics=extract_trending_topics(scored) or None,
    )
    set_cache(key, result, CACHE_TTL["trends"])
    add_to_context_memory(
        "trends",
        {
            "niche": label,
            "total_videos": len(scored),
            "top_video_title": top[0]["title"] if top else None,
        },
    )
    return result
