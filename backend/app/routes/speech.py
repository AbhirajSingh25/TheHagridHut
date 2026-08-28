from __future__ import annotations

import json
import os
import re
import tempfile
from collections import Counter
from typing import Any

from fastapi import APIRouter, HTTPException, Request
from groq import Groq
from pydantic import BaseModel, Field


router = APIRouter(
    prefix="/speech",
    tags=["Speech Intelligence"],
)


# ============================================================
# CONFIGURATION
# ============================================================


GROQ_API_KEY = os.getenv(
    "GROQ_API_KEY",
    "",
).strip()


client: Groq | None = None


if GROQ_API_KEY:

    try:

        client = Groq(
            api_key=GROQ_API_KEY
        )

    except Exception:

        client = None


ALLOWED_AUDIO_EXTENSIONS = {

    ".mp3",
    ".wav",
    ".m4a",
    ".webm",
    ".mp4",
    ".mpeg",
    ".ogg",
    ".flac",

}


FILLER_WORDS = [

    "um",
    "uh",
    "umm",
    "uhh",
    "like",
    "basically",
    "actually",
    "literally",
    "you know",
    "i mean",
    "sort of",
    "kind of",

]


# ============================================================
# REQUEST MODEL
# ============================================================


class SpeechTranscriptRequest(
    BaseModel
):

    transcript: str = Field(
        min_length=1
    )

    duration_seconds: float | None = Field(
        default=None,
        ge=0,
    )


# ============================================================
# HELPERS
# ============================================================


def clamp_score(
    value: Any,
    default: int = 0,
) -> int:

    try:

        score = int(
            round(
                float(value)
            )
        )

    except (
        TypeError,
        ValueError,
    ):

        score = default


    return max(
        0,
        min(
            100,
            score,
        ),
    )


def normalize_list(
    value: Any,
) -> list[str]:

    if not isinstance(
        value,
        list,
    ):

        return []


    results: list[str] = []


    seen: set[str] = set()


    for item in value:

        text = str(
            item
        ).strip()


        if not text:

            continue


        key = text.lower()


        if key in seen:

            continue


        seen.add(
            key
        )


        results.append(
            text
        )


    return results


def parse_ai_json(
    raw_response: str,
) -> dict[str, Any]:

    if not raw_response:

        return {}


    cleaned = raw_response.strip()


    cleaned = re.sub(
        r"^```json",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )


    cleaned = re.sub(
        r"^```",
        "",
        cleaned,
    )


    cleaned = re.sub(
        r"```$",
        "",
        cleaned,
    ).strip()


    try:

        parsed = json.loads(
            cleaned
        )


        if isinstance(
            parsed,
            dict,
        ):

            return parsed

    except Exception:

        pass


    match = re.search(

        r"\{.*\}",

        cleaned,

        flags=re.DOTALL,

    )


    if match:

        try:

            parsed = json.loads(
                match.group(0)
            )


            if isinstance(
                parsed,
                dict,
            ):

                return parsed

        except Exception:

            pass


    return {}


# ============================================================
# TRANSCRIPT METRICS
# ============================================================


def count_words(
    transcript: str,
) -> int:

    words = re.findall(

        r"\b[\w'-]+\b",

        transcript,

    )


    return len(
        words
    )


def detect_filler_words(
    transcript: str,
) -> tuple[int, dict[str, int]]:

    normalized = (
        transcript.lower()
    )


    counts: dict[str, int] = {}


    total = 0


    for filler in FILLER_WORDS:

        pattern = (

            r"(?<![a-z])"

            +

            re.escape(
                filler
            )

            +

            r"(?![a-z])"

        )


        matches = re.findall(

            pattern,

            normalized,

        )


        if matches:

            count = len(
                matches
            )


            counts[
                filler
            ] = count


            total += count


    return (

        total,

        dict(
            sorted(

                counts.items(),

                key=lambda item: (
                    -item[1],
                    item[0],
                ),

            )
        ),

    )


def estimate_duration_from_text(
    word_count: int,
) -> float:

    if word_count <= 0:

        return 0.0


    # Natural conversational baseline.
    return max(
        1.0,
        word_count / 135 * 60,
    )


def calculate_wpm(
    word_count: int,
    duration_seconds: float,
) -> int:

    if (
        word_count <= 0
        or
        duration_seconds <= 0
    ):

        return 0


    minutes = (
        duration_seconds / 60
    )


    if minutes <= 0:

        return 0


    return int(
        round(
            word_count / minutes
        )
    )


def calculate_pacing_score(
    wpm: int,
) -> int:

    if wpm <= 0:

        return 50


    ideal_low = 120
    ideal_high = 160


    if ideal_low <= wpm <= ideal_high:

        return 100


    if wpm < ideal_low:

        difference = (
            ideal_low - wpm
        )


    else:

        difference = (
            wpm - ideal_high
        )


    penalty = difference * 0.9


    return clamp_score(
        100 - penalty,
        default=50,
    )


def calculate_filler_score(
    filler_count: int,
    word_count: int,
) -> int:

    if word_count <= 0:

        return 100


    filler_ratio = (

        filler_count
        /
        word_count

    ) * 100


    penalty = filler_ratio * 12


    return clamp_score(
        100 - penalty,
        default=80,
    )


def calculate_clarity_score(
    transcript: str,
    filler_count: int,
    word_count: int,
) -> int:

    if word_count == 0:

        return 50


    sentences = [

        sentence.strip()

        for sentence
        in re.split(
            r"[.!?]+",
            transcript,
        )

        if sentence.strip()

    ]


    if not sentences:

        return 50


    average_sentence_length = (

        word_count
        /
        len(sentences)

    )


    if average_sentence_length <= 20:

        sentence_score = 100

    elif average_sentence_length <= 30:

        sentence_score = 85

    else:

        sentence_score = max(
            55,
            100 - (
                average_sentence_length
                -
                30
            )
            * 2
        )


    filler_score = calculate_filler_score(

        filler_count,

        word_count,

    )


    return clamp_score(

        (
            sentence_score
            * 0.55
        )

        +

        (
            filler_score
            * 0.45
        ),

        default=70,

    )


def calculate_confidence_score(
    pacing_score: int,
    filler_score: int,
    clarity_score: int,
) -> int:

    score = (

        pacing_score
        * 0.30

        +

        filler_score
        * 0.35

        +

        clarity_score
        * 0.35

    )


    return clamp_score(
        score,
        default=70,
    )


def calculate_structure_score(
    transcript: str,
    word_count: int,
) -> int:

    if word_count <= 10:

        return 55


    lowered = transcript.lower()


    structure_markers = [

        "first",
        "second",
        "third",
        "because",
        "for example",
        "for instance",
        "therefore",
        "however",
        "overall",
        "in summary",
        "finally",
        "as a result",

    ]


    found_markers = sum(

        1

        for marker
        in structure_markers

        if marker in lowered

    )


    sentence_count = max(

        1,

        len(

            re.findall(

                r"[.!?]+",

                transcript,

            )

        ),

    )


    score = 65


    score += min(
        20,
        found_markers * 5,
    )


    if sentence_count >= 3:

        score += 10


    return clamp_score(
        score,
        default=70,
    )


def get_pacing_label(
    wpm: int,
) -> str:

    if wpm == 0:

        return "Estimated"


    if wpm < 110:

        return "Too Slow"


    if wpm < 120:

        return "Slightly Slow"


    if wpm <= 160:

        return "Optimal"


    if wpm <= 180:

        return "Slightly Fast"


    return "Too Fast"


def get_sentiment_label(
    confidence_score: int,
) -> str:

    if confidence_score >= 85:

        return "Highly Confident"


    if confidence_score >= 70:

        return "Confident"


    if confidence_score >= 55:

        return "Neutral"


    return "Needs Improvement"


# ============================================================
# GROQ TRANSCRIPTION
# ============================================================


def transcribe_audio_with_groq(
    file_bytes: bytes,
    filename: str,
) -> tuple[str, float]:

    if not client:

        raise RuntimeError(
            "Groq AI is not configured."
        )


    transcription = (

        client
        .audio
        .transcriptions
        .create(

            file=(
                filename,
                file_bytes,
            ),

            model=(
                "whisper-large-v3-turbo"
            ),

            response_format=(
                "verbose_json"
            ),

            temperature=0.0,

        )

    )


    transcript = (

        getattr(
            transcription,
            "text",
            "",
        )

        or ""

    ).strip()


    duration = getattr(

        transcription,

        "duration",

        0,

    ) or 0


    try:

        duration = float(
            duration
        )

    except (
        TypeError,
        ValueError,
    ):

        duration = 0.0


    return (
        transcript,
        duration,
    )


# ============================================================
# AI COMMUNICATION REVIEW
# ============================================================


def analyze_with_ai(
    transcript: str,
    metrics: dict[str, Any],
) -> dict[str, Any]:

    if not client:

        return {}


    system_prompt = """
You are HireSense AI, an expert interview communication evaluator.

Evaluate the candidate's spoken communication.

You must assess:

1. Communication clarity
2. Confidence
3. Grammar and language quality
4. Professionalism
5. Answer structure
6. Conciseness
7. Recruiter impression

Return ONLY valid JSON.

Use exactly this schema:

{
  "communication_score": 0,
  "confidence_score": 0,
  "clarity_score": 0,
  "grammar_score": 0,
  "professionalism_score": 0,
  "clarity": "string",
  "grammar": "string",
  "professionalism": "string",
  "sentiment": "string",
  "answer_structure": "string",
  "strengths": ["string"],
  "improvements": ["string"],
  "recruiter_feedback": "string",
  "hire_recommendation": "Strongly Recommended"
}

Rules:

- All numeric scores must be between 0 and 100.
- Do not invent information not present in the transcript.
- strengths must contain 2 to 4 concise points.
- improvements must contain 2 to 4 actionable points.
- recruiter_feedback must be concise.
- hire_recommendation must be one of:
  "Strongly Recommended"
  "Recommended"
  "Potential"
  "Needs Improvement"
- Return only JSON.
"""


    user_prompt = f"""
Candidate transcript:

{transcript[:12000]}

Objective metrics:

Word count: {metrics["word_count"]}
Words per minute: {metrics["words_per_minute"]}
Pacing score: {metrics["pacing_score"]}
Filler word count: {metrics["filler_word_count"]}
Filler score: {metrics["filler_score"]}
Clarity baseline: {metrics["clarity_score"]}
Confidence baseline: {metrics["confidence_score"]}
Structure baseline: {metrics["structure_score"]}

Evaluate the candidate's interview communication.
"""


    try:

        completion = (

            client
            .chat
            .completions
            .create(

                model=os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-20b",
),

                temperature=0.2,

                messages=[

                    {

                        "role":
                            "system",

                        "content":
                            system_prompt,

                    },

                    {

                        "role":
                            "user",

                        "content":
                            user_prompt,

                    },

                ],

            )

        )


        raw_response = (

            completion
            .choices[0]
            .message
            .content

            or ""

        )


        return parse_ai_json(
            raw_response
        )


    except Exception:

        return {}


# ============================================================
# LOCAL FALLBACK REVIEW
# ============================================================


def build_fallback_review(
    metrics: dict[str, Any],
) -> dict[str, Any]:

    communication_score = clamp_score(

        (
            metrics["clarity_score"]
            * 0.35
        )

        +

        (
            metrics["confidence_score"]
            * 0.30
        )

        +

        (
            metrics["structure_score"]
            * 0.20
        )

        +

        (
            metrics["filler_score"]
            * 0.15
        ),

        default=70,

    )


    confidence_score = metrics[
        "confidence_score"
    ]


    clarity_score = metrics[
        "clarity_score"
    ]


    professionalism_score = clamp_score(

        (
            clarity_score
            * 0.55
        )

        +

        (
            metrics["structure_score"]
            * 0.45
        ),

        default=70,

    )


    grammar_score = clamp_score(

        clarity_score,

        default=70,

    )


    strengths: list[str] = []


    improvements: list[str] = []


    if (
        metrics["pacing_score"]
        >= 80
    ):

        strengths.append(
            "Speaking pace is well controlled."
        )

    else:

        improvements.append(
            "Adjust your speaking pace toward a more conversational rhythm."
        )


    if (
        metrics["filler_word_count"]
        <= 2
    ):

        strengths.append(
            "Uses relatively few filler words."
        )

    else:

        improvements.append(
            "Reduce filler words by pausing briefly before answering."
        )


    if (
        clarity_score
        >= 75
    ):

        strengths.append(
            "Communication is generally clear and easy to follow."
        )

    else:

        improvements.append(
            "Use shorter and more direct sentences to improve clarity."
        )


    if (
        metrics["structure_score"]
        >= 75
    ):

        strengths.append(
            "The response demonstrates a reasonably clear structure."
        )

    else:

        improvements.append(
            "Structure answers with a clear beginning, explanation, and conclusion."
        )


    while len(
        strengths
    ) < 2:

        strengths.append(
            "Provides enough verbal content for communication analysis."
        )


    while len(
        improvements
    ) < 2:

        improvements.append(
            "Support key points with concise examples and measurable outcomes."
        )


    if communication_score >= 85:

        recommendation = (
            "Strongly Recommended"
        )

    elif communication_score >= 70:

        recommendation = (
            "Recommended"
        )

    elif communication_score >= 55:

        recommendation = (
            "Potential"
        )

    else:

        recommendation = (
            "Needs Improvement"
        )


    return {

        "communication_score":
            communication_score,

        "confidence_score":
            confidence_score,

        "clarity_score":
            clarity_score,

        "grammar_score":
            grammar_score,

        "professionalism_score":
            professionalism_score,

        "clarity":

            "Excellent"

            if clarity_score >= 85

            else (

                "Good"

                if clarity_score >= 70

                else "Needs Improvement"

            ),

        "grammar":

            "Good"

            if grammar_score >= 70

            else "Needs Improvement",

        "professionalism":

            "High"

            if professionalism_score >= 80

            else (

                "Moderate"

                if professionalism_score >= 65

                else "Needs Improvement"

            ),

        "sentiment":

            get_sentiment_label(
                confidence_score
            ),

        "answer_structure":

            "Well Structured"

            if metrics[
                "structure_score"
            ] >= 80

            else (

                "Moderately Structured"

                if metrics[
                    "structure_score"
                ] >= 65

                else "Needs More Structure"

            ),

        "strengths":
            strengths[:4],

        "improvements":
            improvements[:4],

        "recruiter_feedback":

            (
                "The candidate demonstrates strong communication potential."
            )

            if communication_score >= 75

            else (

                "The candidate communicates adequately but should improve pacing, structure, and delivery consistency."
            ),

        "hire_recommendation":
            recommendation,

    }


# ============================================================
# CORE ANALYSIS
# ============================================================


def analyze_transcript(
    transcript: str,
    duration_seconds: float | None = None,
) -> dict[str, Any]:

    cleaned_transcript = re.sub(

        r"\s+",

        " ",

        transcript,

    ).strip()


    if not cleaned_transcript:

        raise HTTPException(

            status_code=400,

            detail=(
                "A valid speech transcript is required."
            ),

        )


    word_count = count_words(
        cleaned_transcript
    )


    (
        filler_count,
        filler_breakdown,
    ) = detect_filler_words(

        cleaned_transcript

    )


    estimated_duration = False


    if (
        duration_seconds is None
        or duration_seconds <= 0
    ):

        duration_seconds = (
            estimate_duration_from_text(
                word_count
            )
        )


        estimated_duration = True


    wpm = calculate_wpm(

        word_count,

        duration_seconds,

    )


    pacing_score = (
        calculate_pacing_score(
            wpm
        )
    )


    filler_score = (
        calculate_filler_score(

            filler_count,

            word_count,

        )
    )


    clarity_score = (
        calculate_clarity_score(

            cleaned_transcript,

            filler_count,

            word_count,

        )
    )


    confidence_score = (
        calculate_confidence_score(

            pacing_score,

            filler_score,

            clarity_score,

        )
    )


    structure_score = (
        calculate_structure_score(

            cleaned_transcript,

            word_count,

        )
    )


    metrics = {

        "word_count":
            word_count,

        "duration_seconds":
            round(
                duration_seconds,
                2,
            ),

        "duration_estimated":
            estimated_duration,

        "words_per_minute":
            wpm,

        "pacing":
            get_pacing_label(
                wpm
            ),

        "pacing_score":
            pacing_score,

        "filler_word_count":
            filler_count,

        "filler_breakdown":
            filler_breakdown,

        "filler_score":
            filler_score,

        "clarity_score":
            clarity_score,

        "confidence_score":
            confidence_score,

        "structure_score":
            structure_score,

    }


    fallback_review = (
        build_fallback_review(
            metrics
        )
    )


    ai_review = (
        analyze_with_ai(

            cleaned_transcript,

            metrics,

        )
    )


    review = {

        **fallback_review,

        **ai_review,

    }


    communication_score = clamp_score(

        review.get(
            "communication_score"
        ),

        default=fallback_review[
            "communication_score"
        ],

    )


    final_confidence = clamp_score(

        review.get(
            "confidence_score"
        ),

        default=confidence_score,

    )


    final_clarity = clamp_score(

        review.get(
            "clarity_score"
        ),

        default=clarity_score,

    )


    overall_score = clamp_score(

        (
            communication_score
            * 0.50
        )

        +

        (
            final_confidence
            * 0.25
        )

        +

        (
            final_clarity
            * 0.25
        )

    )


    return {

        "success":
            True,

        "transcript":
            cleaned_transcript,

        "overall_score":
            overall_score,

        "communication_score":
            communication_score,

        "confidence_score":
            final_confidence,

        "clarity_score":
            final_clarity,

        "grammar_score":

            clamp_score(

                review.get(
                    "grammar_score"
                ),

                default=fallback_review[
                    "grammar_score"
                ],

            ),

        "professionalism_score":

            clamp_score(

                review.get(
                    "professionalism_score"
                ),

                default=fallback_review[
                    "professionalism_score"
                ],

            ),

        "words_per_minute":
            wpm,

        "wpm":
            wpm,

        "pacing":
            get_pacing_label(
                wpm
            ),

        "pacing_score":
            pacing_score,

        "filler_word_count":
            filler_count,

        "filler_count":
            filler_count,

        "filler_breakdown":
            filler_breakdown,

        "filler_score":
            filler_score,

        "word_count":
            word_count,

        "duration_seconds":

            round(

                duration_seconds,

                2,

            ),

        "duration_estimated":
            estimated_duration,

        "structure_score":
            structure_score,

        "clarity":

            str(

                review.get(
                    "clarity"
                )

                or fallback_review[
                    "clarity"
                ]

            ),

        "grammar":

            str(

                review.get(
                    "grammar"
                )

                or fallback_review[
                    "grammar"
                ]

            ),

        "professionalism":

            str(

                review.get(
                    "professionalism"
                )

                or fallback_review[
                    "professionalism"
                ]

            ),

        "sentiment":

            str(

                review.get(
                    "sentiment"
                )

                or get_sentiment_label(
                    final_confidence
                )

            ),

        "answer_structure":

            str(

                review.get(
                    "answer_structure"
                )

                or fallback_review[
                    "answer_structure"
                ]

            ),

        "strengths":

            normalize_list(

                review.get(
                    "strengths"
                )

            )

            or fallback_review[
                "strengths"
            ],

        "improvements":

            normalize_list(

                review.get(
                    "improvements"
                )

            )

            or fallback_review[
                "improvements"
            ],

        "recruiter_feedback":

            str(

                review.get(
                    "recruiter_feedback"
                )

                or fallback_review[
                    "recruiter_feedback"
                ]

            ),

        "hire_recommendation":

            str(

                review.get(
                    "hire_recommendation"
                )

                or fallback_review[
                    "hire_recommendation"
                ]

            ),

        "metrics":
            metrics,

    }


# ============================================================
# POST /speech/analyze
#
# Supports:
#
# 1. JSON
#    {
#      "transcript": "...",
#      "duration_seconds": 42
#    }
#
# 2. multipart/form-data
#    file=<audio file>
# ============================================================


@router.post(
    "/analyze"
)
async def analyze_speech(
    request: Request,
):

    content_type = (

        request.headers.get(
            "content-type",
            ""
        )

        .lower()

    )


    # --------------------------------------------------------
    # JSON TRANSCRIPT
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
                ""
            )

        )


        duration_seconds = (

            payload.get(
                "duration_seconds"
            )

        )


        try:

            duration_seconds = (

                float(
                    duration_seconds
                )

                if duration_seconds
                is not None

                else None

            )

        except (
            TypeError,
            ValueError,
        ):

            duration_seconds = None


        return analyze_transcript(

            transcript=

                transcript,

            duration_seconds=

                duration_seconds,

        )


    # --------------------------------------------------------
    # AUDIO FILE
    # --------------------------------------------------------

    if (
        "multipart/form-data"
        in content_type
    ):

        form = await request.form()


        uploaded_file = form.get(
            "file"
        )


        if uploaded_file is None:

            raise HTTPException(

                status_code=400,

                detail=(
                    "Audio file is required."
                ),

            )


        filename = (

            getattr(

                uploaded_file,

                "filename",

                None,

            )

            or

            "interview_audio.webm"

        )


        extension = os.path.splitext(

            filename

        )[1].lower()


        if (
            extension
            not in
            ALLOWED_AUDIO_EXTENSIONS
        ):

            raise HTTPException(

                status_code=400,

                detail=(
                    "Unsupported audio format."
                ),

            )


        file_bytes = await uploaded_file.read()


        if not file_bytes:

            raise HTTPException(

                status_code=400,

                detail=(
                    "Uploaded audio file is empty."
                ),

            )


        max_file_size = (

            25
            *
            1024
            *
            1024

        )


        if len(
            file_bytes
        ) > max_file_size:

            raise HTTPException(

                status_code=413,

                detail=(
                    "Audio file exceeds the 25 MB limit."
                ),

            )


        if not client:

            raise HTTPException(

                status_code=503,

                detail=(
                    "Audio transcription is unavailable because Groq AI is not configured."
                ),

            )


        try:

            (
                transcript,
                duration_seconds,
            ) = transcribe_audio_with_groq(

                file_bytes=

                    file_bytes,

                filename=

                    filename,

            )

        except Exception as error:

            raise HTTPException(

                status_code=500,

                detail=(
                    "Unable to transcribe the uploaded audio."
                ),

            ) from error


        result = analyze_transcript(

            transcript=

                transcript,

            duration_seconds=

                duration_seconds,

        )


        result[
            "audio_filename"
        ] = filename


        result[
            "transcription_source"
        ] = "groq"


        return result


    raise HTTPException(

        status_code=415,

        detail=(

            "Unsupported request format. "

            "Send JSON transcript data or multipart audio."

        ),

    )


# ============================================================
# POST /speech/analyze-transcript
#
# Explicit JSON endpoint for external integrations.
# ============================================================


@router.post(
    "/analyze-transcript"
)
async def analyze_speech_transcript(
    payload: SpeechTranscriptRequest,
):

    return analyze_transcript(

        transcript=
            payload.transcript,

        duration_seconds=
            payload.duration_seconds,

    )


# ============================================================
# GET /speech/health
# ============================================================


@router.get(
    "/health"
)
async def speech_health():

    return {

        "success":
            True,

        "service":
            "Speech Intelligence",

        "groq_configured":
            client is not None,

        "supported_inputs": [

            "json_transcript",

            "audio_upload",

        ],

    }