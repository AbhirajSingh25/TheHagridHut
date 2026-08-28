from fastapi import APIRouter
from pydantic import BaseModel

from app.services.groq_service import (
    ask_copilot
)

router = APIRouter()


class CopilotRequest(
    BaseModel
):
    message: str


@router.post(
    "/ai-copilot"
)
def ai_copilot(
    data: CopilotRequest
):

    response = ask_copilot(
        data.message
    )

    return {
        "reply": response
    }