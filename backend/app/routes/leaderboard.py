from __future__ import annotations

from collections import defaultdict
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import InterviewSession


router = APIRouter()


def clamp_score(value: Any) -> int:
    try:
        score = int(round(float(value)))
    except (TypeError, ValueError):
        return 0

    return max(0, min(100, score))


def get_session_score(session: InterviewSession) -> int:
    candidate_score = clamp_score(
        getattr(session, "candidate_score", 0)
    )

    overall_score = clamp_score(
        getattr(session, "overall_score", 0)
    )

    technical_score = clamp_score(
        getattr(session, "technical_score", 0)
    )

    communication_score = clamp_score(
        getattr(session, "communication_score", 0)
    )

    confidence_score = clamp_score(
        getattr(session, "confidence_score", 0)
    )

    if candidate_score > 0:
        return candidate_score

    if overall_score > 0:
        return overall_score

    metrics = [
        score
        for score in [
            technical_score,
            communication_score,
            confidence_score,
        ]
        if score > 0
    ]

    if not metrics:
        return 0

    return clamp_score(
        sum(metrics) / len(metrics)
    )


def get_user_name(user_id: int | None) -> str:
    if user_id is None:
        return "Anonymous Candidate"

    return f"Candidate {user_id}"


def get_rank_tier(score: int) -> str:
    if score >= 90:
        return "Elite"

    if score >= 80:
        return "Advanced"

    if score >= 70:
        return "Strong"

    if score >= 60:
        return "Developing"

    return "Emerging"


@router.get("/leaderboard")
def get_leaderboard(
    user_id: int | None = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):

    limit = max(
        1,
        min(limit, 100),
    )

    sessions = (
        db.query(InterviewSession)
        .order_by(
            InterviewSession.created_at.desc(),
            InterviewSession.id.desc(),
        )
        .all()
    )

    grouped_sessions: dict[
        int | None,
        list[InterviewSession],
    ] = defaultdict(list)

    for session in sessions:
        grouped_sessions[
            getattr(session, "user_id", None)
        ].append(session)

    leaderboard_entries = []

    for candidate_id, candidate_sessions in grouped_sessions.items():

        scores = [
            get_session_score(session)
            for session in candidate_sessions
        ]

        valid_scores = [
            score
            for score in scores
            if score > 0
        ]

        if not valid_scores:
            continue

        latest_score = valid_scores[0]

        average_score = clamp_score(
            sum(valid_scores) / len(valid_scores)
        )

        technical_score = clamp_score(
            sum(
                clamp_score(
                    getattr(
                        session,
                        "technical_score",
                        0,
                    )
                )
                for session in candidate_sessions
            )
            / len(candidate_sessions)
        )

        communication_score = clamp_score(
            sum(
                clamp_score(
                    getattr(
                        session,
                        "communication_score",
                        0,
                    )
                )
                for session in candidate_sessions
            )
            / len(candidate_sessions)
        )

        confidence_score = clamp_score(
            sum(
                clamp_score(
                    getattr(
                        session,
                        "confidence_score",
                        0,
                    )
                )
                for session in candidate_sessions
            )
            / len(candidate_sessions)
        )

        best_score = max(valid_scores)

        improvement = 0

        if len(valid_scores) >= 2:
            improvement = (
                valid_scores[0]
                - valid_scores[-1]
            )

        leaderboard_entries.append({

            "user_id":
                candidate_id,

            "name":
                get_user_name(candidate_id),

            "score":
                average_score,

            "average_score":
                average_score,

            "latest_score":
                latest_score,

            "best_score":
                best_score,

            "technical_score":
                technical_score,

            "communication_score":
                communication_score,

            "confidence_score":
                confidence_score,

            "improvement":
                improvement,

            "interviews":
                len(candidate_sessions),

            "tier":
                get_rank_tier(average_score),

        })

    leaderboard_entries.sort(
        key=lambda item: (
            item["score"],
            item["best_score"],
            item["interviews"],
        ),
        reverse=True,
    )

    ranked_entries = []

    for index, entry in enumerate(
        leaderboard_entries[:limit],
        start=1,
    ):

        ranked_entries.append({

            **entry,

            "rank":
                index,

        })

    current_user = None

    if user_id is not None:

        for entry in ranked_entries:

            if entry["user_id"] == user_id:

                current_user = entry

                break

    return {

        "leaderboard":
            ranked_entries,

        "entries":
            ranked_entries,

        "total_candidates":
            len(leaderboard_entries),

        "current_user":
            current_user,

    }