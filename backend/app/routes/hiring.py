from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import InterviewSession
from app.services.groq_service import ask_groq


router = APIRouter()


def clamp_score(value: Any) -> int:
    try:
        score = int(round(float(value)))
    except (TypeError, ValueError):
        return 0

    return max(0, min(100, score))


def average(values: list[int]) -> int:
    valid_values = [
        value
        for value in values
        if value > 0
    ]

    if not valid_values:
        return 0

    return clamp_score(
        sum(valid_values)
        / len(valid_values)
    )


def get_hiring_level(score: int) -> str:
    if score >= 85:
        return "Excellent"

    if score >= 75:
        return "Strong"

    if score >= 60:
        return "Moderate"

    if score >= 45:
        return "Low"

    return "Very Low"


def get_recommendation(score: int) -> str:
    if score >= 85:
        return (
            "Strong recommendation. The candidate demonstrates "
            "high overall interview readiness and competitive "
            "performance across major evaluation dimensions."
        )

    if score >= 75:
        return (
            "Positive recommendation. The candidate is approaching "
            "strong interview readiness with a few areas that can "
            "still be improved through targeted practice."
        )

    if score >= 60:
        return (
            "Potential candidate. More focused practice is "
            "recommended before high-stakes interviews."
        )

    return (
        "Additional preparation is recommended before the candidate "
        "is considered interview-ready."
    )


def get_ai_recommendation(
    probability: int,
    technical: int,
    communication: int,
    confidence: int,
    resume: int,
    jd_match: int,
    speech: int,
    fallback: str,
) -> str:
    """
    Ask Groq for a hiring recommendation grounded in the candidate's
    actual dimension scores. Falls back to the deterministic
    threshold-based recommendation (passed in) if the AI call fails.
    This endpoint is only ever called for a single candidate per
    request, so one Groq call per request is safe to make here
    (unlike the bulk recruiter list endpoints).
    """

    try:
        return ask_groq(
            prompt=f"""
Hiring probability: {probability}/100
Technical: {technical}/100
Communication: {communication}/100
Confidence: {confidence}/100
Resume/ATS: {resume}/100
JD match: {jd_match}/100
Speech delivery: {speech}/100
(0 means that dimension has not been measured yet)

Write a 2-3 sentence hiring recommendation for a recruiter reviewing
this candidate, grounded specifically in the scores above. Write it
directly, with no preamble.
""",
            system_prompt=(
                "You are an AI hiring analyst writing a recommendation "
                "for a recruiter based on structured candidate scores."
            ),
            temperature=0.4,
            max_tokens=250,
        ).strip()

    except Exception as error:
        print(
            "get_ai_recommendation fallback "
            "(templated recommendation will be used):",
            error,
        )
        return fallback


@router.get("/hiring-probability")
def get_hiring_probability(
    user_id: int | None = None,
    db: Session = Depends(get_db),
):

    query = db.query(InterviewSession)

    if user_id is not None:
        query = query.filter(
            InterviewSession.user_id == user_id
        )

    sessions = (
        query
        .order_by(
            InterviewSession.created_at.desc(),
            InterviewSession.id.desc(),
        )
        .all()
    )

    if not sessions:

        return {

            "probability":
                0,

            "hiring_probability":
                0,

            "candidate_score":
                0,

            "level":
                "No Data",

            "recommendation":
                (
                    "Complete interview sessions to generate "
                    "a hiring probability."
                ),

            "breakdown": {

                "technical":
                    0,

                "communication":
                    0,

                "confidence":
                    0,

                "resume":
                    0,

                "jd_match":
                    0,

                "speech":
                    0,

            },

        }

    latest = sessions[0]

    technical = average([
        clamp_score(
            getattr(
                session,
                "technical_score",
                0,
            )
        )
        for session in sessions
    ])

    communication = average([
        clamp_score(
            getattr(
                session,
                "communication_score",
                0,
            )
        )
        for session in sessions
    ])

    confidence = average([
        clamp_score(
            getattr(
                session,
                "confidence_score",
                0,
            )
        )
        for session in sessions
    ])

    resume = average([
        clamp_score(
            getattr(
                session,
                "resume_score",
                0,
            )
        )
        for session in sessions
    ])

    jd_match = average([
        clamp_score(
            getattr(
                session,
                "jd_match_score",
                0,
            )
        )
        for session in sessions
    ])

    speech = average([
        clamp_score(
            getattr(
                session,
                "speech_score",
                0,
            )
        )
        for session in sessions
    ])

    overall = average([
        clamp_score(
            getattr(
                session,
                "overall_score",
                0,
            )
        )
        for session in sessions
    ])

    persisted_probability = clamp_score(
        getattr(
            latest,
            "hiring_probability",
            0,
        )
    )

    persisted_candidate_score = clamp_score(
        getattr(
            latest,
            "candidate_score",
            0,
        )
    )

    weighted_components = []

    weighted_components.append(
        technical * 0.30
    )

    weighted_components.append(
        communication * 0.20
    )

    weighted_components.append(
        confidence * 0.15
    )

    if resume > 0:
        weighted_components.append(
            resume * 0.15
        )

    if jd_match > 0:
        weighted_components.append(
            jd_match * 0.10
        )

    if speech > 0:
        weighted_components.append(
            speech * 0.10
        )

    calculated_score = clamp_score(
        sum(weighted_components)
    )

    candidate_score = (
        persisted_candidate_score
        if persisted_candidate_score > 0
        else (
            overall
            if overall > 0
            else calculated_score
        )
    )

    probability = (
        persisted_probability
        if persisted_probability > 0
        else clamp_score(
            (
                calculated_score * 0.65
                +
                candidate_score * 0.35
            )
        )
    )

    level = get_hiring_level(
        probability
    )

    recommendation = (
        getattr(
            latest,
            "recruiter_recommendation",
            "",
        )
        or get_recommendation(
            probability
        )
    )

    recommendation = get_ai_recommendation(
        probability=probability,
        technical=technical,
        communication=communication,
        confidence=confidence,
        resume=resume,
        jd_match=jd_match,
        speech=speech,
        fallback=recommendation,
    )

    return {

        "probability":
            probability,

        "hiring_probability":
            probability,

        "candidate_score":
            candidate_score,

        "level":
            level,

        "recommendation":
            recommendation,

        "overall_score":
            overall,

        "breakdown": {

            "technical":
                technical,

            "communication":
                communication,

            "confidence":
                confidence,

            "resume":
                resume,

            "jd_match":
                jd_match,

            "speech":
                speech,

        },

        "latest_session_id":
            latest.id,

        "total_sessions":
            len(sessions),

    }