from fastapi import APIRouter
from ..models import CopilotChatRequest, CopilotChatResponse
from ..services.copilot import copilot_chat as handle_chat

router = APIRouter()


@router.post("/copilot-chat", response_model=CopilotChatResponse)
async def copilot(request: CopilotChatRequest):
    return await handle_chat(request)
