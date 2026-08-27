import json
import httpx
from ..config import GEMINI_API_KEY, GEMINI_MODEL, logger
from ..state.context import build_context_summary


def detect_intent_local(message, context):
    lower = message.lower()
    if not context.get("has_context"):
        return "I don't have any context yet. Please analyze your channel or search for trends first, then I can help you with insights."
    channel = context.get("channel_insights")
    metrics = context.get("aggregated_metrics", {})
    if (
        any(w in lower for w in ["engagement", "likes", "comments", "interaction"])
        and channel
        and channel.get("avg_engagement_rate") is not None
    ):
        rate = channel["avg_engagement_rate"] * 100
        status = metrics.get("engagement_status", "unknown")
        return f"Your current engagement rate is {rate:.2f}%. This is considered **{status}** for your channel size. {'Good job maintaining audience interaction!' if status=='good' else 'Consider posting more engaging content to improve this metric.'}"
    if (
        any(
            w in lower
            for w in ["post", "upload", "frequency", "consistent", "regularly"]
        )
        and channel
    ):
        frequency = channel.get("upload_frequency", 0)
        score = channel.get("health_dashboard", {}).get("consistency_score", 0)
        return f"You're uploading **{frequency:.1f} videos per month**. Your consistency score is **{score}/100**. {'Great consistency!' if score>=75 else 'Try to maintain a more regular upload schedule to improve audience retention.'}"
    if (
        any(w in lower for w in ["growth", "subscriber", "growing", "audience"])
        and channel
    ):
        subs = channel.get("subscribers", 0)
        momentum = channel.get("health_dashboard", {}).get("growth_momentum", "Unknown")
        stage = channel.get("growth_stage", "unknown")
        return f"You have **{subs:,} subscribers** (stage: **{stage}**). Growth momentum: **{momentum}**. {'Keep up the momentum!' if momentum=='Improving' else 'Focus on consistency and engagement to boost growth.'}"
    if (
        any(w in lower for w in ["topic", "theme", "content", "niche", "about"])
        and channel
        and channel.get("top_themes")
    ):
        return f"Your top content themes are: **{', '.join(channel['top_themes'][:3])}**. These define your channel's focus. Stick to these or explore related topics to maintain audience interest."
    if any(
        w in lower for w in ["competitor", "competition", "compare", "versus", "vs"]
    ):
        comp = context.get("competitor_insights")
        return (
            f"Compared to **{comp['competitor_name']}**: {comp['engagement_gap']} engagement difference. {comp['posting_gap']}. Focus on their successful topics: {', '.join(comp['missed_topics'][:3])}."
            if comp
            else "You haven't compared with any competitor yet. Add a competitor URL in the channel analysis to get comparison insights."
        )
    if (
        any(
            w in lower
            for w in ["missed", "opportunity", "should cover", "trending", "trend"]
        )
        and channel
        and channel.get("missed_trends")
    ):
        listing = "\n".join(
            f"- **{t['keyword']}** (score: {t['trend_score']}/100)"
            for t in channel["missed_trends"][:3]
        )
        return f"Here are trending topics you haven't covered:\n{listing}\n\nConsider creating content around these to capture trending traffic."
    return None


async def ask_copilot_ai(message, context):
    if not GEMINI_API_KEY:
        return "I'm having trouble generating a response. Please try rephrasing your question."
    prompt = f"""You are an AI Growth Copilot for YouTube creators. Answer using ONLY this context data. Keep response under 100 words and use **bold** for emphasis. CONTEXT DATA:\n{json.dumps(context,indent=2)}\nUSER QUESTION:\n{message}\nAnswer:"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}",
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.7, "maxOutputTokens": 500},
                },
            )
            response.raise_for_status()
            return response.json()["candidates"][0]["content"]["parts"][0][
                "text"
            ].strip()
    except Exception as exc:
        logger.error(f"Gemini copilot error: {exc}")
        return "I'm having trouble generating a response. Please try rephrasing your question."


async def copilot_chat(request):
    context = build_context_summary()
    local = detect_intent_local(request.message, context)
    if local:
        return {
            "response": local,
            "source": "rule_based",
            "context_used": context.get("has_context", False),
        }
    if not context.get("has_context"):
        return {
            "response": "Please analyze your channel or search trends first so I can provide personalized insights.",
            "source": "rule_based",
            "context_used": False,
        }
    return {
        "response": await ask_copilot_ai(request.message, context),
        "source": "ai_generated",
        "context_used": True,
    }
