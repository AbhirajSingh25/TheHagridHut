# backend/app/routes/copilot.py

from __future__ import annotations

from typing import Any

from fastapi import (
    APIRouter,
    HTTPException,
)
from pydantic import (
    BaseModel,
    Field,
)

from app.services.groq_service import (
    ask_copilot,
    get_groq_status,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    tags=[
        "AI Copilot",
    ]
)


# ============================================================
# MODELS
# ============================================================

class CopilotMessage(
    BaseModel):

    role: str = Field(
        ...,
        min_length=1,
        max_length=30,
    )

    content: str = Field(
        ...,
        min_length=1,
        max_length=12000,
    )


class CopilotRequest(
    BaseModel):

    message: str = Field(
        ...,
        min_length=1,
        max_length=12000,
    )

    context: str = Field(
        default="",
        max_length=12000,
    )

    history: list[
        CopilotMessage
    ] = Field(
        default_factory=list,
        max_length=20,
    )


class CopilotResponse(
    BaseModel):

    reply: str

    success: bool = True

    model: str | None = None


# ============================================================
# CONTEXT BUILDER
# ============================================================

def build_context(
    context: str,
    history: list[
        CopilotMessage
    ],
) -> str:

    parts: list[str] = []

    clean_context = (
        context
        or ""
    ).strip()

    if clean_context:

        parts.append(
            "CURRENT APPLICATION CONTEXT:\n"
            f"{clean_context[:8000]}"
        )

    if history:

        conversation_lines = []

        for item in history[-10:]:

            role = (
                item.role
                or "user"
            ).strip().lower()

            content = (
                item.content
                or ""
            ).strip()

            if not content:
                continue

            if role not in {
                "user",
                "assistant",
                "system",
            }:
                role = "user"

            conversation_lines.append(
                f"{role.upper()}: "
                f"{content[:1500]}"
            )

        if conversation_lines:

            parts.append(
                "RECENT CONVERSATION:\n"
                + "\n".join(
                    conversation_lines
                )
            )

    return "\n\n".join(
        parts
    )


# ============================================================
# AI COPILOT
# ============================================================

@router.post(
    "/ai-copilot",
    response_model=CopilotResponse,
)
def ai_copilot(
    data: CopilotRequest,
):

    message = (
        data.message
        or ""
    ).strip()

    if not message:

        raise HTTPException(
            status_code=422,
            detail=(
                "Message cannot be empty."
            ),
        )

    try:

        context = build_context(
            context=data.context,
            history=data.history,
        )

        response = ask_copilot(
            message=message,
            context=context,
        )

        status = (
            get_groq_status()
        )

        return CopilotResponse(
            reply=response,
            success=True,
            model=status.get(
                "model"
            ),
        )

    except ValueError as error:

        raise HTTPException(
            status_code=422,
            detail=str(error),
        )

    except RuntimeError as error:

        raise HTTPException(
            status_code=503,
            detail=str(error),
        )

    except Exception as error:

        print(
            "AI Copilot route error:",
            str(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "AI Copilot request failed."
            ),
        )


# ============================================================
# HEALTH
# ============================================================

@router.get(
    "/ai-copilot/health",
)
def copilot_health() -> dict[
    str,
    Any,
]:

    status = (
        get_groq_status()
    )

    return {
        "status":
            (
                "healthy"
                if status.get(
                    "available"
                )
                else "unavailable"
            ),

        "service":
            "HireSense AI Copilot",

        "ai_enabled":
            status.get(
                "enabled"
            ),

        "groq_available":
            status.get(
                "available"
            ),

        "groq_api_key_loaded":
            status.get(
                "api_key_loaded"
            ),

        "model":
            status.get(
                "model"
            ),
    }