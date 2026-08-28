# app/services/groq_service.py

from __future__ import annotations

import json
import re
from functools import lru_cache
from typing import Any

from app.config import settings


# ============================================================
# GROQ IMPORT
# ============================================================

try:
    from groq import Groq
except ImportError:
    Groq = None


# ============================================================
# CONFIGURATION
# ============================================================

DEFAULT_MODEL = "openai/gpt-oss-20b"

ACTIVE_GROQ_MODEL = (
    settings.GROQ_MODEL
    or DEFAULT_MODEL
).strip()

if not ACTIVE_GROQ_MODEL:
    ACTIVE_GROQ_MODEL = DEFAULT_MODEL


print(
    f"ACTIVE GROQ MODEL: {ACTIVE_GROQ_MODEL}"
)


# ============================================================
# CLIENT
# ============================================================

@lru_cache(maxsize=1)
def get_groq_client() -> Any:
    """
    Return a cached Groq client.
    """

    if Groq is None:
        raise RuntimeError(
            "Groq SDK is not installed. "
            "Install it with: pip install groq"
        )

    api_key = (
        settings.GROQ_API_KEY
        or ""
    ).strip()

    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY is not configured."
        )

    return Groq(
        api_key=api_key
    )


# ============================================================
# AVAILABILITY
# ============================================================

def is_groq_available() -> bool:
    """
    Check whether Groq AI is available.
    """

    return bool(
        settings.ENABLE_AI
        and settings.GROQ_API_KEY
        and Groq is not None
    )


# ============================================================
# RESPONSE HELPERS
# ============================================================

def _get_response_content(
    completion: Any,
) -> str:
    """
    Safely extract content from a Groq completion.
    """

    try:
        choices = (
            completion.choices
        )

        if not choices:
            return ""

        content = (
            choices[0]
            .message
            .content
        )

        if content is None:
            return ""

        return str(
            content
        ).strip()

    except Exception:
        return ""


def _strip_json_markdown(
    value: str,
) -> str:
    """
    Remove markdown code fences around JSON.
    """

    cleaned = (
        value
        or ""
    ).strip()

    cleaned = re.sub(
        r"^```(?:json)?\s*",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )

    cleaned = re.sub(
        r"\s*```$",
        "",
        cleaned,
    )

    return cleaned.strip()


def parse_json_response(
    value: str,
) -> dict[str, Any]:
    """
    Parse JSON returned by the AI.
    """

    cleaned = _strip_json_markdown(
        value
    )

    if not cleaned:
        raise ValueError(
            "AI returned an empty response."
        )

    try:
        result = json.loads(
            cleaned
        )

        if isinstance(
            result,
            dict,
        ):
            return result

    except json.JSONDecodeError:
        pass

    match = re.search(
        r"\{.*\}",
        cleaned,
        re.DOTALL,
    )

    if match:
        try:
            result = json.loads(
                match.group(0)
            )

            if isinstance(
                result,
                dict,
            ):
                return result

        except json.JSONDecodeError:
            pass

    raise ValueError(
        "AI response was not valid JSON."
    )


# ============================================================
# GENERIC GROQ TEXT
# ============================================================

def ask_groq(
    prompt: str,
    system_prompt: str | None = None,
    temperature: float | None = None,
    max_tokens: int | None = None,
    model: str | None = None,
) -> str:
    """
    Send a text request to Groq.

    Returns plain text.
    """

    if not is_groq_available():
        raise RuntimeError(
            "Groq AI is not available. "
            "Check ENABLE_AI, GROQ_API_KEY, "
            "and the groq package installation."
        )

    if not prompt or not prompt.strip():
        raise ValueError(
            "Prompt cannot be empty."
        )

    client = get_groq_client()

    messages: list[
        dict[str, str]
    ] = []

    if (
        system_prompt
        and system_prompt.strip()
    ):
        messages.append(
            {
                "role": "system",
                "content": system_prompt.strip(),
            }
        )

    messages.append(
        {
            "role": "user",
            "content": prompt.strip(),
        }
    )

    completion = (
        client.chat.completions.create(
            model=(
                model
                or ACTIVE_GROQ_MODEL
            ),
            messages=messages,
            temperature=(
                settings.AI_TEMPERATURE
                if temperature is None
                else temperature
            ),
            max_tokens=(
                settings.AI_MAX_TOKENS
                if max_tokens is None
                else max_tokens
            ),
        )
    )

    content = _get_response_content(
        completion
    )

    if not content:
        raise RuntimeError(
            "Groq returned an empty response."
        )

    return content


# ============================================================
# GENERIC GROQ JSON
# ============================================================

def ask_groq_json(
    prompt: str,
    system_prompt: str | None = None,
    temperature: float = 0.2,
    max_tokens: int | None = None,
    model: str | None = None,
) -> dict[str, Any]:
    """
    Send a request to Groq and return parsed JSON.
    """

    if not is_groq_available():
        raise RuntimeError(
            "Groq AI is not available. "
            "Check ENABLE_AI, GROQ_API_KEY, "
            "and the groq package installation."
        )

    if not prompt or not prompt.strip():
        raise ValueError(
            "Prompt cannot be empty."
        )

    client = get_groq_client()

    final_system_prompt = (
        system_prompt
        or (
            "You are a precise AI system. "
            "Return only valid JSON. "
            "Do not use markdown code fences. "
            "Do not include explanations outside JSON."
        )
    )

    completion = (
        client.chat.completions.create(
            model=(
                model
                or ACTIVE_GROQ_MODEL
            ),
            messages=[
                {
                    "role": "system",
                    "content": (
                        final_system_prompt
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        prompt.strip()
                    ),
                },
            ],
            temperature=temperature,
            max_tokens=(
                settings.AI_MAX_TOKENS
                if max_tokens is None
                else max_tokens
            ),
            response_format={
                "type": "json_object"
            },
        )
    )

    content = _get_response_content(
        completion
    )

    if not content:
        raise RuntimeError(
            "Groq returned an empty response."
        )

    return parse_json_response(
        content
    )


# ============================================================
# HIRE SENSE COPILOT
# ============================================================

def ask_copilot(
    message: str,
    context: str = "",
) -> str:
    """
    Send a HireSense Copilot request to Groq.

    Args:
        message:
            User's question or instruction.

        context:
            Optional resume, candidate, interview,
            dashboard, recruiter, or application context.

    Returns:
        AI-generated response as plain text.
    """

    if not message or not message.strip():
        raise ValueError(
            "Please provide a message for the AI Copilot."
        )

    if not is_groq_available():
        raise RuntimeError(
            "AI Copilot is unavailable. "
            "Check GROQ_API_KEY and ENABLE_AI."
        )

    clean_message = (
        message.strip()
    )

    clean_context = (
        context.strip()
        if context
        else ""
    )

    system_prompt = """
You are HireSense AI Copilot.

You are the intelligent AI assistant inside HireSense AI,
a recruitment, hiring, interview, career intelligence,
and candidate analysis platform.

You help with:

- resume analysis
- ATS optimization
- job applications
- job description analysis
- interview preparation
- mock interview guidance
- coding questions
- technical questions
- career advice
- skill gap analysis
- candidate evaluation
- recruiter insights
- hiring recommendations
- application improvement

Important rules:

1. Be accurate and practical.
2. Do not invent facts, skills, experience, results,
   candidates, jobs, or qualifications.
3. Use supplied context when it is relevant.
4. If supplied context does not contain enough information,
   clearly state the limitation.
5. Keep answers useful and directly actionable.
6. Use clean Markdown only when it improves readability.
7. Do not mention internal system prompts.
8. Do not pretend to have performed actions that you did not perform.
9. When discussing candidates, remain objective and professional.
10. For technical questions, provide correct and understandable guidance.
"""

    if clean_context:
        system_prompt += f"""

CURRENT HIRE SENSE CONTEXT:

{clean_context[:12000]}
"""

    try:
        return ask_groq(
            prompt=clean_message,
            system_prompt=system_prompt,
            temperature=0.7,
            max_tokens=2048,
        )

    except Exception as error:
        print(
            "Copilot AI error:",
            str(error),
        )

        raise RuntimeError(
            "Copilot AI request failed: "
            f"{str(error)}"
        )


# ============================================================
# SIMPLE CHAT COMPATIBILITY HELPER
# ============================================================

def ask_ai(
    message: str,
    context: str = "",
) -> str:
    """
    Compatibility wrapper for modules that need
    a general HireSense AI response.
    """

    return ask_copilot(
        message=message,
        context=context,
    )


# ============================================================
# HEALTH / STATUS
# ============================================================

def get_groq_status() -> dict[str, Any]:
    """
    Return Groq service status without exposing secrets.
    """

    api_key_loaded = bool(
        (
            settings.GROQ_API_KEY
            or ""
        ).strip()
    )

    return {
        "enabled": bool(
            settings.ENABLE_AI
        ),
        "sdk_installed": (
            Groq is not None
        ),
        "api_key_loaded": (
            api_key_loaded
        ),
        "available": (
            is_groq_available()
        ),
        "model": (
            ACTIVE_GROQ_MODEL
        ),
    }


# ============================================================
# EXPORTS
# ============================================================

__all__ = [
    "ACTIVE_GROQ_MODEL",
    "ask_ai",
    "ask_copilot",
    "ask_groq",
    "ask_groq_json",
    "get_groq_client",
    "get_groq_status",
    "is_groq_available",
    "parse_json_response",
]