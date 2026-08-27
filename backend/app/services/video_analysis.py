import hashlib
from fastapi import HTTPException
from ..models import AnalyseResponse, AnalysisDetails, CreatorAngle
from ..state.cache import get_from_cache, set_cache, CACHE_TTL
from ..integrations.youtube import get_video_details, check_api_key
from ..integrations.gemini import analyze_with_gemini


async def analyse_video(request):
    check_api_key("gemini")
    key = f"analysis:{request.video_id}"
    cached = get_from_cache(key)
    if cached is not None:
        return cached
    details = await get_video_details(request.video_id)
    if not details:
        raise HTTPException(status_code=404, detail={"error": "Video not found"})
    data = await analyze_with_gemini(details, request.niche)
    result = AnalyseResponse(
        analysis=AnalysisDetails(**data["analysis"]),
        creator_angle=CreatorAngle(**data["creator_angle"]),
    )
    set_cache(key, result, CACHE_TTL["analysis"])
    return result
