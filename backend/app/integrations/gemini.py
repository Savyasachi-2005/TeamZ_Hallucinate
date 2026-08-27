import json
import re
import httpx
from fastapi import HTTPException
from ..config import GEMINI_API_KEY, GEMINI_MODEL, logger


def check_api_key():
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail={"error": "GEMINI_API_KEY environment variable is not set"},
        )


async def _generate(prompt, tokens=2048):
    check_api_key()
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}",
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.7,
                        "maxOutputTokens": tokens,
                        "responseMimeType": "application/json",
                    },
                },
            )
            response.raise_for_status()
            text = response.json()["candidates"][0]["content"]["parts"][0][
                "text"
            ].strip()
        text = re.sub(r"^```(?:json)?|```$", "", text).strip()
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            match = re.search(r"\{[\s\S]*\}", text)
            if match:
                return json.loads(match.group())
            raise
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=500, detail={"error": f"Gemini API error: {exc}"}
        )
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500, detail={"error": "Failed to parse Gemini response as JSON"}
        )


async def analyze_with_gemini(video_details, niche):
    prompt = f"""Analyze this YouTube video trending in {niche}:\nTitle: {video_details['title']}\nChannel: {video_details['channel']}\nViews: {video_details['views']:,}\nReturn ONLY this JSON (no markdown): {{"analysis":{{"hook_style":"brief description","title_pattern":"pattern used","emotional_driver":"trigger","why_it_works":"reason"}},"creator_angle":{{"suggested_title":"title idea","content_direction":"what to create","hook_example":"opening line"}}}}"""
    return await _generate(prompt)


async def analyze_channel_with_strategic_insights(
    channel_data,
    analytics,
    recent_titles,
    health_dashboard,
    missed_trends,
    competitor_gap=None,
):
    prompt = f"""You are an AI Copilot for Sustainable Growth in the Creator Economy. Analyze this YouTube channel using only these metrics. Channel: {channel_data['title']}; Subscribers: {channel_data['subscriber_count']:,}; Total Videos: {channel_data['video_count']}; Average Engagement Rate: {analytics['average_engagement_rate']:.2%}; Upload Frequency: {analytics['upload_frequency_per_month']:.1f}; Top Themes: {', '.join(analytics.get('top_themes', []))}; Health: {health_dashboard}; Missed trends: {missed_trends[:3]}; Competitor: {competitor_gap}; Recent titles: {recent_titles[:10]}. Return ONLY JSON with channel_summary (primary_niche, content_style, growth_pattern, strength, weakness) and strategic_summary (main_risk, growth_opportunity, recommended_action_plan with 3 items)."""
    result = await _generate(prompt, 3072)
    return result
