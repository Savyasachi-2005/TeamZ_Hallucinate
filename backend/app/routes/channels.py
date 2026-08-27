from fastapi import APIRouter
from ..models import ChannelAnalyseRequest, ChannelAnalyseResponse
from ..services.channel_analysis import analyse_channel

router = APIRouter()


@router.post("/channel-analyse", response_model=ChannelAnalyseResponse)
async def channel_analyse(request: ChannelAnalyseRequest):
    return await analyse_channel(request)
