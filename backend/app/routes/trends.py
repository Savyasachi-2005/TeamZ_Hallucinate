from fastapi import APIRouter
from ..models import AnalyseRequest, AnalyseResponse, TrendRequest, TrendResponse
from ..services.trends import get_trends

router = APIRouter()


@router.post("/trends", response_model=TrendResponse)
async def trends(request: TrendRequest):
    return await get_trends(request)


@router.post("/analyse", response_model=AnalyseResponse)
async def analyse(request: AnalyseRequest):
    from ..services.video_analysis import analyse_video

    return await analyse_video(request)
