import re
from typing import Dict, List


FILLER_WORDS = [
    "um",
    "umm",
    "uh",
    "uhh",
    "like",
    "basically",
    "actually",
    "literally",
    "you know",
    "i mean",
    "kind of",
    "sort of",
]


def count_words(transcript: str) -> int:
    return len(
        re.findall(
            r"\b[\w'-]+\b",
            transcript
        )
    )


def detect_fillers(
    transcript: str,
) -> Dict:

    text = transcript.lower()

    detected = {}

    total = 0

    for filler in FILLER_WORDS:

        pattern = (
            r"\b"
            + re.escape(filler)
            + r"\b"
        )

        count = len(
            re.findall(
                pattern,
                text
            )
        )

        if count > 0:
            detected[filler] = count
            total += count

    return {
        "total": total,
        "breakdown": detected,
    }


def calculate_wpm(
    transcript: str,
    duration_seconds: float,
) -> float:

    words = count_words(transcript)

    if duration_seconds <= 0:
        return 0.0

    minutes = duration_seconds / 60

    return round(
        words / minutes,
        2
    )


def calculate_pace_score(
    wpm: float,
) -> int:

    if 120 <= wpm <= 160:
        return 100

    if 100 <= wpm < 120:
        return 85

    if 160 < wpm <= 180:
        return 85

    if 80 <= wpm < 100:
        return 70

    if 180 < wpm <= 200:
        return 65

    if wpm == 0:
        return 0

    return 45


def calculate_filler_score(
    filler_count: int,
    word_count: int,
) -> int:

    if word_count == 0:
        return 0

    ratio = (
        filler_count
        / word_count
    ) * 100

    if ratio <= 1:
        return 100

    if ratio <= 2:
        return 90

    if ratio <= 4:
        return 75

    if ratio <= 6:
        return 60

    return 40


def calculate_pause_score(
    pause_count: int,
    duration_seconds: float,
) -> int:

    if duration_seconds <= 0:
        return 0

    minutes = duration_seconds / 60

    pauses_per_minute = (
        pause_count / minutes
    )

    if pauses_per_minute <= 3:
        return 100

    if pauses_per_minute <= 5:
        return 85

    if pauses_per_minute <= 8:
        return 70

    return 50


def calculate_pronunciation_score(
    confidence: float,
) -> int:

    confidence = max(
        0.0,
        min(confidence, 1.0)
    )

    return round(
        confidence * 100
    )


def analyze_speech(
    transcript: str,
    duration_seconds: float,
    pause_count: int = 0,
    recognition_confidence: float = 0.85,
) -> Dict:

    word_count = count_words(
        transcript
    )

    fillers = detect_fillers(
        transcript
    )

    wpm = calculate_wpm(
        transcript,
        duration_seconds,
    )

    pace_score = calculate_pace_score(
        wpm
    )

    filler_score = calculate_filler_score(
        fillers["total"],
        word_count,
    )

    pause_score = calculate_pause_score(
        pause_count,
        duration_seconds,
    )

    pronunciation_score = (
        calculate_pronunciation_score(
            recognition_confidence
        )
    )

    speech_score = round(
        pace_score * 0.30
        + filler_score * 0.30
        + pause_score * 0.20
        + pronunciation_score * 0.20
    )

    return {
        "speech_score": speech_score,

        "word_count": word_count,

        "words_per_minute": wpm,

        "speaking_speed": wpm,

        "filler_words": fillers["total"],

        "filler_breakdown":
            fillers["breakdown"],

        "pace_score": pace_score,

        "filler_score": filler_score,

        "pause_score": pause_score,

        "pronunciation_score":
            pronunciation_score,
    }