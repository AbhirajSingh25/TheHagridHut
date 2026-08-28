# app/services/speech_service.py

from __future__ import annotations

import os
import re
import time
from collections import Counter
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.config import settings
from app.services.groq_service import ask_groq_json


# ============================================================
# CONSTANTS
# ============================================================

FILLER_PATTERNS = {
    "um": r"\bum+\b",
    "uh": r"\buh+\b",
    "like": r"\blike\b",
    "basically": r"\bbasically\b",
    "actually": r"\bactually\b",
    "literally": r"\bliterally\b",
    "you know": r"\byou\s+know\b",
    "i mean": r"\bi\s+mean\b",
    "sort of": r"\bsort\s+of\b",
    "kind of": r"\bkind\s+of\b",
    "hmm": r"\bhmm+\b",
}


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
            score,
            100,
        ),
    )


def safe_list(
    value: Any,
) -> List[Any]:

    if isinstance(
        value,
        list,
    ):
        return value

    if value is None:
        return []

    return [value]


def normalize_transcript(
    transcript: str,
) -> str:

    transcript = str(
        transcript
        or ""
    )

    transcript = transcript.replace(
        "\n",
        " ",
    )

    transcript = re.sub(
        r"\s+",
        " ",
        transcript,
    )

    return transcript.strip()


# ============================================================
# AUDIO VALIDATION
# ============================================================

def validate_audio_file(
    audio_path: str,
) -> Path:

    if not audio_path:
        raise ValueError(
            "Audio path is required."
        )

    path = Path(
        audio_path
    )

    if not path.exists():
        raise FileNotFoundError(
            f"Audio file not found: {audio_path}"
        )

    if not path.is_file():
        raise ValueError(
            "Audio path must point to a file."
        )

    if path.stat().st_size == 0:
        raise ValueError(
            "Audio file is empty."
        )

    return path


# ============================================================
# GROQ TRANSCRIPTION
# ============================================================

def transcribe_audio(
    audio_path: str,
    language: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Transcribe audio using Groq Whisper.

    Uses the same Groq API key already configured for HireSense AI.
    """

    if not settings.ENABLE_SPEECH_ANALYSIS:
        raise RuntimeError(
            "Speech analysis is disabled."
        )

    if not settings.GROQ_API_KEY:
        raise RuntimeError(
            "GROQ_API_KEY is not configured."
        )

    path = validate_audio_file(
        audio_path
    )

    try:
        from groq import Groq

    except ImportError as exc:
        raise RuntimeError(
            "The groq package is not installed. "
            "Run: pip install groq"
        ) from exc

    client = Groq(
        api_key=settings.GROQ_API_KEY
    )

    started_at = time.perf_counter()

    try:

        with open(
            path,
            "rb",
        ) as audio_file:

            kwargs: Dict[
                str,
                Any,
            ] = {
                "file": (
                    path.name,
                    audio_file.read(),
                ),
                "model": (
                    "whisper-large-v3"
                ),
                "response_format": (
                    "verbose_json"
                ),
            }

            if language:
                kwargs[
                    "language"
                ] = language

            transcription = (
                client.audio.transcriptions.create(
                    **kwargs
                )
            )

    except Exception as exc:
        raise RuntimeError(
            "Audio transcription failed: "
            f"{str(exc)}"
        ) from exc

    processing_time = round(
        time.perf_counter()
        - started_at,
        3,
    )

    if hasattr(
        transcription,
        "model_dump",
    ):
        raw_result = (
            transcription.model_dump()
        )

    elif hasattr(
        transcription,
        "to_dict",
    ):
        raw_result = (
            transcription.to_dict()
        )

    elif isinstance(
        transcription,
        dict,
    ):
        raw_result = transcription

    else:
        raw_result = {
            "text": str(
                transcription
            )
        }

    transcript = normalize_transcript(
        raw_result.get(
            "text",
            "",
        )
    )

    if not transcript:
        raise RuntimeError(
            "No speech could be transcribed "
            "from the audio."
        )

    return {
        "success": True,
        "transcript": transcript,
        "text": transcript,
        "language": (
            raw_result.get(
                "language"
            )
            or language
            or ""
        ),
        "duration": (
            raw_result.get(
                "duration",
                0,
            )
            or 0
        ),
        "segments": (
            raw_result.get(
                "segments",
                []
            )
            or []
        ),
        "processing_time": (
            processing_time
        ),
    }


# ============================================================
# FILLER WORD ANALYSIS
# ============================================================

def detect_filler_words(
    transcript: str,
) -> Dict[str, Any]:

    text = normalize_transcript(
        transcript
    ).lower()

    detected: Dict[
        str,
        int,
    ] = {}

    total = 0

    for filler, pattern in (
        FILLER_PATTERNS.items()
    ):

        matches = re.findall(
            pattern,
            text,
            flags=re.IGNORECASE,
        )

        count = len(
            matches
        )

        if count > 0:

            detected[
                filler
            ] = count

            total += count

    return {
        "total": total,
        "details": detected,
    }


# ============================================================
# TRANSCRIPT METRICS
# ============================================================

def calculate_transcript_metrics(
    transcript: str,
    duration: Optional[
        float
    ] = None,
) -> Dict[str, Any]:

    clean_text = normalize_transcript(
        transcript
    )

    words = re.findall(
        r"\b[\w'-]+\b",
        clean_text,
    )

    word_count = len(
        words
    )

    sentences = [
        sentence.strip()
        for sentence in re.split(
            r"[.!?]+",
            clean_text,
        )
        if sentence.strip()
    ]

    sentence_count = len(
        sentences
    )

    average_sentence_length = 0.0

    if sentence_count > 0:

        average_sentence_length = round(
            word_count
            / sentence_count,
            2,
        )

    filler_analysis = (
        detect_filler_words(
            clean_text
        )
    )

    words_per_minute = 0.0

    try:

        duration_value = float(
            duration
            or 0
        )

    except (
        TypeError,
        ValueError,
    ):
        duration_value = 0.0

    if (
        duration_value > 0
        and word_count > 0
    ):

        words_per_minute = round(
            (
                word_count
                / duration_value
            )
            * 60,
            2,
        )

    unique_words = len(
        set(
            word.lower()
            for word in words
        )
    )

    vocabulary_diversity = 0.0

    if word_count > 0:

        vocabulary_diversity = round(
            (
                unique_words
                / word_count
            )
            * 100,
            2,
        )

    repeated_words = []

    if words:

        frequency = Counter(
            word.lower()
            for word in words
            if len(word) > 3
        )

        repeated_words = [
            {
                "word": word,
                "count": count,
            }
            for word, count in (
                frequency.most_common(10)
            )
            if count > 2
        ]

    return {
        "word_count": word_count,
        "sentence_count": (
            sentence_count
        ),
        "average_sentence_length": (
            average_sentence_length
        ),
        "duration_seconds": (
            duration_value
        ),
        "words_per_minute": (
            words_per_minute
        ),
        "filler_word_count": (
            filler_analysis[
                "total"
            ]
        ),
        "filler_words": (
            filler_analysis[
                "details"
            ]
        ),
        "unique_word_count": (
            unique_words
        ),
        "vocabulary_diversity": (
            vocabulary_diversity
        ),
        "repeated_words": (
            repeated_words
        ),
    }


# ============================================================
# HEURISTIC SPEECH METRICS
# ============================================================

def calculate_base_speech_scores(
    metrics: Dict[
        str,
        Any,
    ],
) -> Dict[str, int]:

    word_count = int(
        metrics.get(
            "word_count",
            0,
        )
        or 0
    )

    filler_count = int(
        metrics.get(
            "filler_word_count",
            0,
        )
        or 0
    )

    sentence_count = int(
        metrics.get(
            "sentence_count",
            0,
        )
        or 0
    )

    average_sentence_length = float(
        metrics.get(
            "average_sentence_length",
            0,
        )
        or 0
    )

    wpm = float(
        metrics.get(
            "words_per_minute",
            0,
        )
        or 0
    )

    vocabulary_diversity = float(
        metrics.get(
            "vocabulary_diversity",
            0,
        )
        or 0
    )

    filler_penalty = min(
        45,
        filler_count * 4,
    )

    clarity = 75

    if (
        8
        <= average_sentence_length
        <= 25
    ):
        clarity += 12

    elif (
        average_sentence_length > 35
    ):
        clarity -= 12

    if vocabulary_diversity >= 60:
        clarity += 8

    clarity -= (
        filler_penalty
        * 0.25
    )

    fluency = 80

    fluency -= (
        filler_penalty
        * 0.5
    )

    if wpm > 0:

        if (
            110
            <= wpm
            <= 170
        ):
            fluency += 10

        elif (
            wpm < 85
            or wpm > 210
        ):
            fluency -= 15

    communication = 65

    if word_count >= 30:
        communication += 10

    if sentence_count >= 3:
        communication += 10

    if vocabulary_diversity >= 55:
        communication += 10

    communication -= (
        filler_penalty
        * 0.2
    )

    confidence = 75

    confidence -= (
        filler_penalty
        * 0.6
    )

    if word_count < 15:
        confidence -= 15

    structure = 70

    if (
        3
        <= sentence_count
        <= 12
    ):
        structure += 15

    if (
        8
        <= average_sentence_length
        <= 30
    ):
        structure += 10

    conciseness = 80

    if average_sentence_length > 35:
        conciseness -= 20

    if word_count > 400:
        conciseness -= 15

    return {
        "clarity_score":
            clamp_score(
                clarity
            ),
        "fluency_score":
            clamp_score(
                fluency
            ),
        "confidence_score":
            clamp_score(
                confidence
            ),
        "communication_score":
            clamp_score(
                communication
            ),
        "structure_score":
            clamp_score(
                structure
            ),
        "conciseness_score":
            clamp_score(
                conciseness
            ),
    }


# ============================================================
# AI SPEECH ANALYSIS
# ============================================================

def analyze_transcript_with_ai(
    transcript: str,
    metrics: Dict[
        str,
        Any,
    ],
    role: str = (
        "General Professional"
    ),
    question: Optional[
        str
    ] = None,
) -> Dict[str, Any]:

    prompt = f"""
Analyze this candidate's spoken
interview response.

Target role:
{role}

Interview question:
{question or "Not provided"}

Transcript:
{transcript}

Objective speech metrics:
{metrics}

Evaluate the candidate's response for:

1. Communication clarity
2. Fluency
3. Confidence expressed through language
4. Answer relevance
5. Answer structure
6. Conciseness
7. Professional communication
8. Technical articulation
9. Filler-word impact
10. Interview readiness

Important rules:

- Analyze only information available
  in the transcript and metrics.
- Do not pretend to hear tone, pitch,
  volume or acoustic properties that
  are not available in the transcript.
- Do not infer emotion as a fact.
- Be specific and constructive.
- Do not praise weak answers merely
  for being long.

Return valid JSON:

{{
    "overall_score": 0,
    "clarity_score": 0,
    "fluency_score": 0,
    "confidence_score": 0,
    "communication_score": 0,
    "structure_score": 0,
    "conciseness_score": 0,

    "strengths": [],

    "weaknesses": [],

    "filler_feedback": [],

    "communication_feedback": [],

    "improvement_tips": [],

    "summary": "",

    "interview_feedback": "",

    "next_step": ""
}}

Every score must be between
0 and 100.
"""

    result = ask_groq_json(
        prompt=prompt,
        system_prompt=(
            "You are an expert interview "
            "communication evaluator. "
            "Provide evidence-based analysis "
            "of spoken-answer transcripts. "
            "Return JSON only."
        ),
        temperature=0.2,
        max_tokens=2200,
    )

    if not isinstance(
        result,
        dict,
    ):
        raise ValueError(
            "AI returned an invalid "
            "speech analysis format."
        )

    for key in [
        "overall_score",
        "clarity_score",
        "fluency_score",
        "confidence_score",
        "communication_score",
        "structure_score",
        "conciseness_score",
    ]:

        result[key] = clamp_score(
            result.get(
                key,
                0,
            )
        )

    for key in [
        "strengths",
        "weaknesses",
        "filler_feedback",
        "communication_feedback",
        "improvement_tips",
    ]:

        result[key] = safe_list(
            result.get(
                key,
                [],
            )
        )

    result.setdefault(
        "summary",
        "",
    )

    result.setdefault(
        "interview_feedback",
        "",
    )

    result.setdefault(
        "next_step",
        "",
    )

    return result


# ============================================================
# COMBINE AI + METRICS
# ============================================================

def build_final_speech_analysis(
    transcript: str,
    metrics: Dict[
        str,
        Any,
    ],
    base_scores: Dict[
        str,
        int,
    ],
    ai_analysis: Dict[
        str,
        Any,
    ],
) -> Dict[str, Any]:

    score_keys = [
        "clarity_score",
        "fluency_score",
        "confidence_score",
        "communication_score",
        "structure_score",
        "conciseness_score",
    ]

    final_scores: Dict[
        str,
        int,
    ] = {}

    for key in score_keys:

        heuristic_score = clamp_score(
            base_scores.get(
                key,
                0,
            )
        )

        ai_score = clamp_score(
            ai_analysis.get(
                key,
                heuristic_score,
            ),
            default=heuristic_score,
        )

        final_scores[key] = clamp_score(
            (
                heuristic_score * 0.35
            )
            +
            (
                ai_score * 0.65
            )
        )

    overall_score = clamp_score(
        (
            final_scores[
                "clarity_score"
            ]
            * 0.18
        )
        +
        (
            final_scores[
                "fluency_score"
            ]
            * 0.14
        )
        +
        (
            final_scores[
                "confidence_score"
            ]
            * 0.14
        )
        +
        (
            final_scores[
                "communication_score"
            ]
            * 0.20
        )
        +
        (
            final_scores[
                "structure_score"
            ]
            * 0.17
        )
        +
        (
            final_scores[
                "conciseness_score"
            ]
            * 0.17
        )
    )

    return {
        "success": True,

        "transcript":
            transcript,

        "overall_score":
            overall_score,

        **final_scores,

        "total_words":
            metrics.get(
                "word_count",
                0,
            ),

        "word_count":
            metrics.get(
                "word_count",
                0,
            ),

        "sentence_count":
            metrics.get(
                "sentence_count",
                0,
            ),

        "filler_words":
            metrics.get(
                "filler_word_count",
                0,
            ),

        "filler_word_count":
            metrics.get(
                "filler_word_count",
                0,
            ),

        "filler_word_details":
            metrics.get(
                "filler_words",
                {},
            ),

        "words_per_minute":
            metrics.get(
                "words_per_minute",
                0,
            ),

        "duration_seconds":
            metrics.get(
                "duration_seconds",
                0,
            ),

        "vocabulary_diversity":
            metrics.get(
                "vocabulary_diversity",
                0,
            ),

        "repeated_words":
            metrics.get(
                "repeated_words",
                [],
            ),

        "strengths":
            safe_list(
                ai_analysis.get(
                    "strengths",
                    [],
                )
            ),

        "weaknesses":
            safe_list(
                ai_analysis.get(
                    "weaknesses",
                    [],
                )
            ),

        "filler_feedback":
            safe_list(
                ai_analysis.get(
                    "filler_feedback",
                    [],
                )
            ),

        "communication_feedback":
            safe_list(
                ai_analysis.get(
                    "communication_feedback",
                    [],
                )
            ),

        "improvement_tips":
            safe_list(
                ai_analysis.get(
                    "improvement_tips",
                    [],
                )
            ),

        "summary":
            str(
                ai_analysis.get(
                    "summary",
                    "",
                )
            ),

        "feedback":
            str(
                ai_analysis.get(
                    "interview_feedback",
                    (
                        ai_analysis.get(
                            "summary",
                            "",
                        )
                    ),
                )
            ),

        "next_step":
            str(
                ai_analysis.get(
                    "next_step",
                    "",
                )
            ),
    }


# ============================================================
# MAIN TRANSCRIPT ANALYSIS
# ============================================================

def analyze_transcript(
    transcript: str,
    role: str = (
        "General Professional"
    ),
    question: Optional[
        str
    ] = None,
    duration: Optional[
        float
    ] = None,
) -> Dict[str, Any]:

    clean_transcript = (
        normalize_transcript(
            transcript
        )
    )

    if not clean_transcript:
        return {
            "success": False,
            "transcript": "",
            "overall_score": 0,
            "clarity_score": 0,
            "fluency_score": 0,
            "confidence_score": 0,
            "communication_score": 0,
            "structure_score": 0,
            "conciseness_score": 0,
            "total_words": 0,
            "word_count": 0,
            "filler_words": 0,
            "filler_word_count": 0,
            "words_per_minute": 0,
            "feedback": (
                "No transcript provided."
            ),
            "summary": (
                "No speech could be analyzed."
            ),
            "strengths": [],
            "weaknesses": [],
            "improvement_tips": [],
        }

    metrics = (
        calculate_transcript_metrics(
            transcript=clean_transcript,
            duration=duration,
        )
    )

    base_scores = (
        calculate_base_speech_scores(
            metrics
        )
    )

    ai_analysis = (
        analyze_transcript_with_ai(
            transcript=clean_transcript,
            metrics=metrics,
            role=role,
            question=question,
        )
    )

    return build_final_speech_analysis(
        transcript=clean_transcript,
        metrics=metrics,
        base_scores=base_scores,
        ai_analysis=ai_analysis,
    )


# ============================================================
# MAIN AUDIO ANALYSIS
# ============================================================

def analyze_speech(
    audio_path: str,
    role: str = (
        "General Professional"
    ),
    question: Optional[
        str
    ] = None,
    language: Optional[
        str
    ] = None,
) -> Dict[str, Any]:
    """
    Main service function used by
    the existing speech route.

    Flow:

    Audio
        ->
    Groq Whisper transcription
        ->
    Transcript metrics
        ->
    Groq AI analysis
        ->
    Final HireSense speech analysis
    """

    transcription = (
        transcribe_audio(
            audio_path=audio_path,
            language=language,
        )
    )

    transcript = (
        transcription.get(
            "transcript",
            ""
        )
    )

    duration = (
        transcription.get(
            "duration",
            0,
        )
    )

    analysis = (
        analyze_transcript(
            transcript=transcript,
            role=role,
            question=question,
            duration=duration,
        )
    )

    analysis[
        "transcription"
    ] = transcription

    analysis[
        "language"
    ] = (
        transcription.get(
            "language",
            ""
        )
    )

    return analysis


# ============================================================
# LIVE INTERVIEW ANALYSIS
# ============================================================

def analyze_live_speech(
    transcript: str,
    role: str = (
        "General Professional"
    ),
    question: Optional[
        str
    ] = None,
    duration: Optional[
        float
    ] = None,
) -> Dict[str, Any]:

    analysis = (
        analyze_transcript(
            transcript=transcript,
            role=role,
            question=question,
            duration=duration,
        )
    )

    return {
        "success":
            analysis.get(
                "success",
                False,
            ),

        "confidence_score":
            analysis.get(
                "confidence_score",
                0,
            ),

        "communication_score":
            analysis.get(
                "communication_score",
                0,
            ),

        "clarity_score":
            analysis.get(
                "clarity_score",
                0,
            ),

        "fluency_score":
            analysis.get(
                "fluency_score",
                0,
            ),

        "overall_score":
            analysis.get(
                "overall_score",
                0,
            ),

        "words_per_minute":
            analysis.get(
                "words_per_minute",
                0,
            ),

        "filler_words":
            analysis.get(
                "filler_word_count",
                0,
            ),

        "attention_status":
            "Focused",

        "feedback":
            analysis.get(
                "feedback",
                "",
            ),

        "strengths":
            analysis.get(
                "strengths",
                [],
            ),

        "improvement_tips":
            analysis.get(
                "improvement_tips",
                [],
            ),
    }


# ============================================================
# COMPATIBILITY HELPERS
# ============================================================

def transcribe(
    audio_path: str,
    language: Optional[
        str
    ] = None,
) -> str:

    result = transcribe_audio(
        audio_path=audio_path,
        language=language,
    )

    return str(
        result.get(
            "transcript",
            "",
        )
    )


def speech_analysis(
    transcript: str,
    role: str = (
        "General Professional"
    ),
    question: Optional[
        str
    ] = None,
    duration: Optional[
        float
    ] = None,
) -> Dict[str, Any]:

    return analyze_transcript(
        transcript=transcript,
        role=role,
        question=question,
        duration=duration,
    )


def live_interview_analysis(
    transcript: str,
    role: str = (
        "General Professional"
    ),
    question: Optional[
        str
    ] = None,
    duration: Optional[
        float
    ] = None,
) -> Dict[str, Any]:

    return analyze_live_speech(
        transcript=transcript,
        role=role,
        question=question,
        duration=duration,
    )