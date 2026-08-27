from time import time
from typing import Any, Dict
from ..config import logger

context_memory = []


def add_to_context_memory(context_type: str, data: Dict[str, Any]):
    if len(context_memory) >= 5:
        removed = context_memory.pop(0)
        logger.info(f"Context memory full - removed oldest: {removed['type']}")
    context_memory.append({"type": context_type, "timestamp": time(), "data": data})
    logger.info(f"Context memory added: {context_type} (total: {len(context_memory)})")


def _growth_stage(subscribers: int) -> str:
    if subscribers < 1000:
        return "early"
    if subscribers < 10000:
        return "growing"
    if subscribers < 100000:
        return "established"
    return "mature"


def _engagement(rate: float) -> str:
    if rate > 0.05:
        return "good"
    if rate > 0.02:
        return "moderate"
    return "low"


def _consistency(score: int) -> str:
    if score >= 75:
        return "excellent"
    if score >= 50:
        return "moderate"
    return "needs_improvement"


def build_context_summary() -> Dict[str, Any]:
    if not context_memory:
        return {
            "has_context": False,
            "message": "No context available. Please analyze your channel or search trends first.",
        }
    result = {
        "has_context": True,
        "total_analyses": len(context_memory),
        "channel_insights": None,
        "trend_insights": None,
        "competitor_insights": None,
        "aggregated_metrics": {},
    }
    for item in context_memory:
        data = item["data"]
        if item["type"] == "channel_analysis":
            info, analytics = data.get("channel_info", {}), data.get("analytics", {})
            result["channel_insights"] = {
                "channel_name": info.get("name"),
                "subscribers": info.get("subscribers"),
                "total_videos": info.get("total_videos"),
                "avg_engagement_rate": analytics.get("average_engagement_rate"),
                "upload_frequency": analytics.get("upload_frequency_per_month"),
                "top_themes": analytics.get("top_themes", []),
                "health_dashboard": data.get("health_dashboard", {}),
                "missed_trends": data.get("missed_trends", []),
                "growth_stage": _growth_stage(info.get("subscribers", 0)),
            }
        elif item["type"] == "trends":
            result["trend_insights"] = {
                "niche": data.get("niche"),
                "total_videos": data.get("total_videos", 0),
                "top_video": data.get("top_video_title"),
            }
        elif item["type"] == "comparison":
            result["competitor_insights"] = {
                "competitor_name": data.get("competitor_name"),
                "engagement_gap": data.get("engagement_gap"),
                "posting_gap": data.get("posting_gap"),
                "missed_topics": data.get("missed_topics", []),
            }
    if result["channel_insights"]:
        channel = result["channel_insights"]
        result["aggregated_metrics"] = {
            "engagement_status": _engagement(channel.get("avg_engagement_rate", 0)),
            "consistency_status": _consistency(
                channel.get("health_dashboard", {}).get("consistency_score", 0)
            ),
            "growth_momentum": channel.get("health_dashboard", {}).get(
                "growth_momentum", "Unknown"
            ),
            "primary_focus": (
                channel.get("top_themes", ["Unknown"])[0]
                if channel.get("top_themes")
                else "Unknown"
            ),
        }
    return result
