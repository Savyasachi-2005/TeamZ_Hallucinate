from datetime import datetime
from fastapi import HTTPException
from ..integrations.youtube import (
    check_api_key,
    resolve_channel_id,
    get_channel_metadata,
    get_playlist_videos,
    search_youtube_videos,
)
from ..integrations.gemini import analyze_channel_with_strategic_insights
from ..domain.text import extract_channel_identifier, extract_themes_from_titles
from ..domain.health import (
    calculate_consistency_score,
    calculate_engagement_stability,
    calculate_topic_focus_score,
    determine_growth_momentum,
)
from ..domain.competition import compute_competitor_gap, detect_missed_trends
from ..models import *


def compute_channel_analytics(videos):
    if not videos:
        return {
            "average_engagement_rate": 0,
            "upload_frequency_per_month": 0,
            "top_themes": [],
        }
    rates = []
    dates = []
    titles = []
    for v in videos:
        rates.append(
            (v.get("likes", 0) + v.get("comments", 0)) / max(v.get("views", 0), 1)
        )
        titles.append(v.get("title", ""))
        try:
            dates.append(
                datetime.fromisoformat(v["published_at"].replace("Z", "+00:00"))
            )
        except (ValueError, TypeError):
            pass
    frequency = 0
    if len(dates) >= 2:
        dates.sort()
        span = (dates[-1] - dates[0]).days
        if span > 0:
            frequency = len(dates) / max(span / 30, 1)
    return {
        "average_engagement_rate": round(sum(rates) / len(rates), 4),
        "upload_frequency_per_month": round(frequency, 1),
        "top_themes": extract_themes_from_titles(titles),
    }


async def analyse_channel(request):
    check_api_key("youtube")
    check_api_key("gemini")
    identifier, kind = extract_channel_identifier(request.channel_url)
    channel_id = await resolve_channel_id(identifier, kind)
    data = await get_channel_metadata(channel_id)
    videos = await get_playlist_videos(data["uploads_playlist_id"], 20)
    if not videos:
        raise HTTPException(
            status_code=404, detail={"error": "No videos found for this channel"}
        )
    analytics = compute_channel_analytics(videos)
    titles = [v["title"] for v in videos[:10]]
    dates = [v["published_at"] for v in videos]
    rates = [
        (v.get("likes", 0) + v.get("comments", 0)) / max(v.get("views", 1), 1)
        for v in videos
    ]
    health = {
        "consistency_score": calculate_consistency_score(dates),
        "engagement_stability": calculate_engagement_stability(rates),
        "topic_focus_score": calculate_topic_focus_score(
            analytics["top_themes"], titles
        ),
        "growth_momentum": determine_growth_momentum(rates, dates),
    }
    themes = analytics["top_themes"]
    niche = themes[:2] or [data["title"].split()[0] if data["title"] else "trending"]
    trending = await search_youtube_videos(niche, 50, 7)
    missed = detect_missed_trends(themes, niche, trending) or [
        {
            "keyword": "Explore your niche",
            "trend_score": 0,
            "reason": f"Based on your content ({', '.join(themes[:3])}), explore related trending topics in your niche",
        }
    ]
    comparison = None
    if request.competitor_url:
        try:
            ci, ck = extract_channel_identifier(request.competitor_url)
            cid = await resolve_channel_id(ci, ck)
            cdata = await get_channel_metadata(cid)
            cvideos = await get_playlist_videos(cdata["uploads_playlist_id"], 20)
            if cvideos:
                ca = compute_channel_analytics(cvideos)
                gap = compute_competitor_gap(analytics, themes, ca, ca["top_themes"])
                comparison = CompetitorComparison(competitor_name=cdata["title"], **gap)
        except Exception as exc:
            __import__("logging").getLogger(__name__).error(
                f"Competitor analysis failed: {exc}"
            )
    ai = await analyze_channel_with_strategic_insights(
        data,
        analytics,
        titles,
        health,
        missed,
        (
            {
                "engagement_gap": comparison.engagement_gap,
                "posting_gap": comparison.posting_gap,
                "theme_overlap_percentage": comparison.theme_overlap_percentage,
                "missed_topics": comparison.missed_topics,
            }
            if comparison
            else None
        ),
    )
    return ChannelAnalyseResponse(
        channel_info=ChannelInfo(
            name=data["title"],
            subscribers=data["subscriber_count"],
            total_videos=data["video_count"],
            channel_id=channel_id,
            thumbnail=data.get("thumbnail"),
        ),
        analytics=ChannelAnalytics(**analytics),
        recent_videos=[
            RecentVideo(
                title=v["title"],
                views=v.get("views", 0),
                engagement_rate=round(
                    (v.get("likes", 0) + v.get("comments", 0))
                    / max(v.get("views", 0), 1),
                    4,
                ),
                published_at=v["published_at"],
                video_id=v["video_id"],
                thumbnail=v.get("thumbnail"),
            )
            for v in videos[:5]
        ],
        ai_analysis=EnhancedAIAnalysis(
            channel_summary=ChannelSummary(**ai["channel_summary"]),
            strategic_summary=StrategicSummary(**ai["strategic_summary"]),
        ),
        health_dashboard=HealthDashboard(**health),
        missed_trends=[MissedTrend(**m) for m in missed],
        competitor_comparison=comparison,
    )
