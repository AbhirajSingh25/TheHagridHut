# app/routes/speech.py

from __future__ import annotations

import os
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Request, UploadFile
from pydantic import BaseModel, Field

from app.config import settings
from app.services.speech_service import (
    analyze_live_speech,
    analyze_speech,
    analyze_transcript,
)


router = APIRouter(
    prefix="/api/speech",
    tags=["Speech Intelligence"],
)


# ============================================================
# CONFIGURATION
# ============================================================

ALLOWED_AUDIO_EXTENSIONS = {
    ".mp3",
    ".wav",
    ".m4a",
    ".webm",
    ".mp4",
    ".mpeg",
    ".mpga",
    ".ogg",
    ".flac",
}


# ============================================================
# REQUEST MODELS
# ============================================================

class SpeechTranscriptRequest(BaseModel):

    transcript: str = Field(
        min_length=1,
    )

    duration_seconds: Optional[float] = Field(
        default=None,
        ge=0,
    )

    role: str = Field(
        default="General Professional",
    )

    question: Optional[str] = Field(
        default=None,
    )


class LiveSpeechRequest(BaseModel):

    transcript: str = Field(
        min_length=1,
    )

    duration_seconds: Optional[float] = Field(
        default=None,
        ge=0,
    )

    role: str = Field(
        default="General Professional",
    )

    question: Optional[str] = Field(
        default=None,
    )


# ============================================================
# HELPERS
# ============================================================

def get_file_extension(
    filename: Optional[str],
) -> str:

    if not filename:
        return ""

    return Path(
        filename
    ).suffix.lower()


def validate_audio_filename(
    filename: Optional[str],
) -> str:

    extension = get_file_extension(
        filename
    )

    if not extension:

        raise HTTPException(
            status_code=400,
            detail="Audio file extension is missing.",
        )

    if (
        extension
        not in ALLOWED_AUDIO_EXTENSIONS
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported audio format. "
                "Supported formats are: "
                "mp3, wav, m4a, webm, mp4, "
                "mpeg, mpga, ogg, flac."
            ),
        )

    return extension


def validate_audio_size(
    file_size: int,
) -> None:

    max_size = (
        settings.max_upload_size_bytes
    )

    if file_size <= 0:

        raise HTTPException(
            status_code=400,
            detail="Uploaded audio file is empty.",
        )

    if file_size > max_size:

        raise HTTPException(
            status_code=413,
            detail=(
                f"Audio file exceeds the "
                f"{settings.MAX_UPLOAD_SIZE_MB} MB limit."
            ),
        )


def save_temporary_audio(
    file_bytes: bytes,
    suffix: str,
) -> str:

    temp_directory = (
        settings.temp_dir
    )

    with tempfile.NamedTemporaryFile(
        mode="wb",
        suffix=suffix,
        prefix="hiresense_speech_",
        dir=temp_directory,
        delete=False,
    ) as temp_file:

        temp_file.write(
            file_bytes
        )

        return temp_file.name


def delete_temporary_file(
    file_path: Optional[str],
) -> None:

    if not file_path:
        return

    try:

        path = Path(
            file_path
        )

        if path.exists():

            path.unlink()

    except Exception:

        pass


def get_form_value(
    form,
    key: str,
    default=None,
):

    value = form.get(
        key,
        default,
    )

    if value is None:
        return default

    if isinstance(
        value,
        UploadFile,
    ):
        return default

    return value


def parse_optional_float(
    value,
) -> Optional[float]:

    if value is None:
        return None

    if value == "":
        return None

    try:

        number = float(
            value
        )

    except (
        TypeError,
        ValueError,
    ):

        return None

    if number < 0:

        return None

    return number


# ============================================================
# POST /api/speech/analyze
#
# Supports:
#
# 1. JSON transcript:
#
# {
#   "transcript": "...",
#   "duration_seconds": 42,
#   "role": "Backend Developer",
#   "question": "Tell me about yourself"
# }
#
#
# 2. multipart/form-data:
#
# file=<audio>
# role=Backend Developer
# question=Tell me about yourself
# language=en
# ============================================================

@router.post(
    "/analyze",
)
async def analyze_speech_endpoint(
    request: Request,
):

    if not settings.ENABLE_SPEECH_ANALYSIS:

        raise HTTPException(
            status_code=503,
            detail=(
                "Speech analysis is currently disabled."
            ),
        )

    content_type = (
        request.headers.get(
            "content-type",
            "",
        ).lower()
    )

    # --------------------------------------------------------
    # JSON TRANSCRIPT ANALYSIS
    # --------------------------------------------------------

    if (
        "application/json"
        in content_type
    ):

        try:

            payload = await request.json()

        except Exception as error:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid JSON request body."
                ),
            ) from error

        transcript = str(
            payload.get(
                "transcript",
                "",
            )
            or ""
        ).strip()

        if not transcript:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Transcript is required."
                ),
            )

        role = str(
            payload.get(
                "role",
                "General Professional",
            )
            or "General Professional"
        )

        question_value = (
            payload.get(
                "question"
            )
        )

        question = (
            str(question_value).strip()
            if question_value
            else None
        )

        duration = (
            parse_optional_float(
                payload.get(
                    "duration_seconds"
                )
            )
        )

        try:

            result = (
                analyze_transcript(
                    transcript=transcript,
                    role=role,
                    question=question,
                    duration=duration,
                )
            )

            result[
                "analysis_source"
            ] = "transcript"

            result[
                "ai_enabled"
            ] = bool(
                settings.GROQ_API_KEY
            )

            return result

        except Exception as error:

            raise HTTPException(
                status_code=500,
                detail=(
                    "Speech transcript analysis failed: "
                    f"{str(error)}"
                ),
            ) from error

    # --------------------------------------------------------
    # AUDIO FILE ANALYSIS
    # --------------------------------------------------------

    if (
        "multipart/form-data"
        in content_type
    ):

        form = await request.form()

        uploaded_file = (
            form.get(
                "file"
            )
        )

        if uploaded_file is None:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Audio file is required."
                ),
            )

        if not isinstance(
            uploaded_file,
            UploadFile,
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid audio upload."
                ),
            )

        filename = (
            uploaded_file.filename
            or "interview_audio.webm"
        )

        extension = (
            validate_audio_filename(
                filename
            )
        )

        role = str(
            get_form_value(
                form,
                "role",
                "General Professional",
            )
            or "General Professional"
        ).strip()

        question_value = (
            get_form_value(
                form,
                "question",
                None,
            )
        )

        question = (
            str(question_value).strip()
            if question_value
            else None
        )

        language_value = (
            get_form_value(
                form,
                "language",
                None,
            )
        )

        language = (
            str(language_value).strip()
            if language_value
            else None
        )

        try:

            file_bytes = (
                await uploaded_file.read()
            )

        except Exception as error:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Unable to read the uploaded audio file."
                ),
            ) from error

        validate_audio_size(
            len(file_bytes)
        )

        temporary_file_path: Optional[
            str
        ] = None

        try:

            temporary_file_path = (
                save_temporary_audio(
                    file_bytes=file_bytes,
                    suffix=extension,
                )
            )

            result = (
                analyze_speech(
                    audio_path=temporary_file_path,
                    role=role,
                    question=question,
                    language=language,
                )
            )

            result[
                "analysis_source"
            ] = "audio"

            result[
                "audio_filename"
            ] = filename

            result[
                "ai_enabled"
            ] = bool(
                settings.GROQ_API_KEY
            )

            return result

        except HTTPException:

            raise

        except Exception as error:

            raise HTTPException(
                status_code=500,
                detail=(
                    "Audio speech analysis failed: "
                    f"{str(error)}"
                ),
            ) from error

        finally:

            delete_temporary_file(
                temporary_file_path
            )

    # --------------------------------------------------------
    # UNSUPPORTED CONTENT TYPE
    # --------------------------------------------------------

    raise HTTPException(
        status_code=415,
        detail=(
            "Unsupported request format. "
            "Send either application/json "
            "with a transcript or "
            "multipart/form-data with an audio file."
        ),
    )


# ============================================================
# POST /api/speech/analyze-transcript
#
# Dedicated transcript analysis endpoint.
# ============================================================

@router.post(
    "/analyze-transcript",
)
async def analyze_speech_transcript(
    payload: SpeechTranscriptRequest,
):

    if not settings.ENABLE_SPEECH_ANALYSIS:

        raise HTTPException(
            status_code=503,
            detail=(
                "Speech analysis is currently disabled."
            ),
        )

    try:

        result = (
            analyze_transcript(
                transcript=payload.transcript,
                role=payload.role,
                question=payload.question,
                duration=payload.duration_seconds,
            )
        )

        result[
            "analysis_source"
        ] = "transcript"

        result[
            "ai_enabled"
        ] = bool(
            settings.GROQ_API_KEY
        )

        return result

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Speech transcript analysis failed: "
                f"{str(error)}"
            ),
        ) from error


# ============================================================
# POST /api/speech/live-analyze
#
# Used for live interview transcript analysis.
# ============================================================

@router.post(
    "/live-analyze",
)
async def analyze_live_speech_endpoint(
    payload: LiveSpeechRequest,
):

    if not settings.ENABLE_SPEECH_ANALYSIS:

        raise HTTPException(
            status_code=503,
            detail=(
                "Speech analysis is currently disabled."
            ),
        )

    try:

        result = (
            analyze_live_speech(
                transcript=payload.transcript,
                role=payload.role,
                question=payload.question,
                duration=payload.duration_seconds,
            )
        )

        result[
            "analysis_source"
        ] = "live_transcript"

        result[
            "ai_enabled"
        ] = bool(
            settings.GROQ_API_KEY
        )

        return result

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Live speech analysis failed: "
                f"{str(error)}"
            ),
        ) from error


# ============================================================
# GET /api/speech/health
# ============================================================

@router.get(
    "/health",
)
async def speech_health():

    return {
        "success": True,
        "service": "Speech Intelligence",
        "enabled": (
            settings.ENABLE_SPEECH_ANALYSIS
        ),
        "groq_configured": bool(
            settings.GROQ_API_KEY
        ),
        "supported_inputs": [
            "json_transcript",
            "audio_upload",
            "live_transcript",
        ],
        "supported_audio_formats": sorted(
            ALLOWED_AUDIO_EXTENSIONS
        ),
    }