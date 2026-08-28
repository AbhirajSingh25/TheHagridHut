from __future__ import annotations

import json
from typing import Any, Dict, List

from sqlalchemy.orm import Session

from app.models import InterviewSession
from app.services.recruiter_ai import (
    analyze_candidate_with_ai,
)


def _safe_json_loads(
    value: Any,
    default: Any,
) -> Any:

    if value is None:
        return default

    if isinstance(
        value,
        (dict, list),
    ):
        return value

    try:
        return json.loads(
            value
        )
    except Exception:
        return default


def _clamp_score(
    value: Any,
) -> float:

    try:
        score = float(
            value or 0
        )
    except (
        TypeError,
        ValueError,
    ):
        return 0.0

    return max(
        0.0,
        min(
            100.0,
            score,
        ),
    )


def _get_session_or_none(
    db: Session,
    session_id: int,
) -> InterviewSession | None:

    return (
        db.query(
            InterviewSession
        )
        .filter(
            InterviewSession.id
            == session_id
        )
        .first()
    )


def get_candidate_recruiter_data(
    db: Session,
    session_id: int,
) -> Dict[str, Any]:

    session = _get_session_or_none(
        db,
        session_id,
    )

    if not session:
        return {}

    return {
        "session_id": session.id,
        "candidate_name": (
            session.user.username
            if session.user
            else "Candidate"
        ),
        "candidate_email": (
            session.user.email
            if session.user
            else None
        ),
        "role": session.role,
        "level": session.level,
        "status": session.status,
        "overall_score": _clamp_score(
            session.overall_score
        ),
        "technical_score": _clamp_score(
            session.technical_score
        ),
        "communication_score": _clamp_score(
            session.communication_score
        ),
        "confidence_score": _clamp_score(
            session.confidence_score
        ),
        "relevance_score": _clamp_score(
            session.relevance_score
        ),
        "candidate_score": _clamp_score(
            session.candidate_score
        ),
        "hiring_probability": _clamp_score(
            session.hiring_probability
        ),
        "resume_score": _clamp_score(
            session.resume_score
        ),
        "jd_match_score": _clamp_score(
            session.jd_match_score
        ),
        "speech_score": _clamp_score(
            session.speech_score
        ),
        "vision_score": _clamp_score(
            session.vision_score
        ),
        "eye_contact_score": _clamp_score(
            session.eye_contact_score
        ),
        "attention_score": _clamp_score(
            session.attention_score
        ),
        "engagement_score": _clamp_score(
            session.engagement_score
        ),
        "posture_score": _clamp_score(
            session.posture_score
        ),
        "strengths": _safe_json_loads(
            session.strengths,
            [],
        ),
        "improvement_areas": _safe_json_loads(
            session.improvement_areas,
            [],
        ),
        "recruiter_recommendation": (
            session.recruiter_recommendation
        ),
        "recruiter_notes": (
            session.recruiter_notes
        ),
        "expected_salary": (
            session.expected_salary
        ),
        "resume_analysis": _safe_json_loads(
            session.resume_analysis,
            {},
        ),
        "jd_analysis": _safe_json_loads(
            session.jd_analysis,
            {},
        ),
        "vision_analysis": _safe_json_loads(
            session.vision_analysis,
            {},
        ),
        "questions": _safe_json_loads(
            session.questions,
            [],
        ),
        "answers": _safe_json_loads(
            session.answers,
            [],
        ),
        "evaluations": _safe_json_loads(
            session.evaluations,
            [],
        ),
        "final_report": _safe_json_loads(
            session.final_report,
            {},
        ),
        "created_at": (
            session.created_at.isoformat()
            if session.created_at
            else None
        ),
        "completed_at": (
            session.completed_at.isoformat()
            if session.completed_at
            else None
        ),
    }


def _build_candidate_summary(
    candidate_data: Dict[str, Any],
) -> Dict[str, Any]:

    return {
        "candidate_name": (
            candidate_data.get(
                "candidate_name"
            )
            or "Candidate"
        ),
        "role": candidate_data.get(
            "role"
        ),
        "level": candidate_data.get(
            "level"
        ),
        "overall_score": candidate_data.get(
            "overall_score",
            0,
        ),
        "technical_score": candidate_data.get(
            "technical_score",
            0,
        ),
        "communication_score": candidate_data.get(
            "communication_score",
            0,
        ),
        "confidence_score": candidate_data.get(
            "confidence_score",
            0,
        ),
        "candidate_score": candidate_data.get(
            "candidate_score",
            0,
        ),
        "hiring_probability": candidate_data.get(
            "hiring_probability",
            0,
        ),
        "resume_score": candidate_data.get(
            "resume_score",
            0,
        ),
        "jd_match_score": candidate_data.get(
            "jd_match_score",
            0,
        ),
        "strengths": candidate_data.get(
            "strengths",
            [],
        ),
        "improvement_areas": candidate_data.get(
            "improvement_areas",
            [],
        ),
    }


def analyze_candidate_for_recruiter(
    db: Session,
    session_id: int,
) -> Dict[str, Any]:

    candidate_data = get_candidate_recruiter_data(
        db,
        session_id,
    )

    if not candidate_data:
        return {}

    candidate_summary = (
        _build_candidate_summary(
            candidate_data
        )
    )

    ai_result = analyze_candidate_with_ai(
        candidate_summary
    )

    if not isinstance(
        ai_result,
        dict,
    ):
        ai_result = {}

    return {
        **candidate_data,
        "ai_analysis": ai_result,
    }


def update_recruiter_decision(
    db: Session,
    session_id: int,
    recommendation: str | None = None,
    notes: str | None = None,
    expected_salary: str | None = None,
) -> Dict[str, Any]:

    session = _get_session_or_none(
        db,
        session_id,
    )

    if not session:
        return {}

    if recommendation is not None:
        session.recruiter_recommendation = (
            recommendation.strip()
            if isinstance(
                recommendation,
                str,
            )
            else recommendation
        )

    if notes is not None:
        session.recruiter_notes = (
            notes.strip()
            if isinstance(
                notes,
                str,
            )
            else notes
        )

    if expected_salary is not None:
        session.expected_salary = (
            expected_salary.strip()
            if isinstance(
                expected_salary,
                str,
            )
            else expected_salary
        )

    db.commit()
    db.refresh(session)

    return get_candidate_recruiter_data(
        db,
        session_id,
    )


def get_recruiter_candidate_scores(
    db: Session,
    limit: int = 100,
) -> List[Dict[str, Any]]:

    sessions = (
        db.query(
            InterviewSession
        )
        .order_by(
            InterviewSession.created_at.desc()
        )
        .limit(
            max(
                1,
                min(
                    limit,
                    500,
                ),
            )
        )
        .all()
    )

    results = []

    for session in sessions:

        results.append(
            {
                "session_id": session.id,
                "candidate_name": (
                    session.user.username
                    if session.user
                    else "Candidate"
                ),
                "candidate_email": (
                    session.user.email
                    if session.user
                    else None
                ),
                "role": session.role,
                "level": session.level,
                "overall_score": _clamp_score(
                    session.overall_score
                ),
                "technical_score": _clamp_score(
                    session.technical_score
                ),
                "communication_score": _clamp_score(
                    session.communication_score
                ),
                "confidence_score": _clamp_score(
                    session.confidence_score
                ),
                "candidate_score": _clamp_score(
                    session.candidate_score
                ),
                "hiring_probability": _clamp_score(
                    session.hiring_probability
                ),
                "recommendation": (
                    session.recruiter_recommendation
                ),
                "created_at": (
                    session.created_at.isoformat()
                    if session.created_at
                    else None
                ),
            }
        )

    return results


def get_recruiter_statistics(
    db: Session,
) -> Dict[str, Any]:

    candidates = (
        get_recruiter_candidate_scores(
            db,
            limit=500,
        )
    )

    total_candidates = len(
        candidates
    )

    if not candidates:

        return {
            "total_candidates": 0,
            "average_score": 0,
            "average_hiring_probability": 0,
            "strong_candidates": 0,
            "recommended_candidates": 0,
            "rejected_candidates": 0,
        }

    average_score = round(
        sum(
            candidate[
                "candidate_score"
            ]
            for candidate in candidates
        )
        / total_candidates,
        2,
    )

    average_hiring_probability = round(
        sum(
            candidate[
                "hiring_probability"
            ]
            for candidate in candidates
        )
        / total_candidates,
        2,
    )

    strong_candidates = sum(
        1
        for candidate in candidates
        if (
            candidate[
                "candidate_score"
            ]
            >= 75
        )
    )

    recommended_candidates = sum(
        1
        for candidate in candidates
        if (
            (
                candidate.get(
                    "recommendation"
                )
                or ""
            )
            .lower()
            in {
                "hire",
                "strong hire",
                "recommended",
            }
        )
    )

    rejected_candidates = sum(
        1
        for candidate in candidates
        if (
            (
                candidate.get(
                    "recommendation"
                )
                or ""
            )
            .lower()
            in {
                "reject",
                "not recommended",
                "no hire",
            }
        )
    )

    return {
        "total_candidates": total_candidates,
        "average_score": average_score,
        "average_hiring_probability": (
            average_hiring_probability
        ),
        "strong_candidates": strong_candidates,
        "recommended_candidates": (
            recommended_candidates
        ),
        "rejected_candidates": (
            rejected_candidates
        ),
    }