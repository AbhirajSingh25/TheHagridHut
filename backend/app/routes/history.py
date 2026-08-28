import json
from typing import Any

from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from app.database import get_db
from app.models import InterviewSession


router = APIRouter(
    tags=["Interview History"],
)


# ============================================================
# HELPERS
# ============================================================

def safe_json_load(
    value: Any,
    default: Any,
) -> Any:

    if value is None:

        return default


    if isinstance(
        value,
        (
            dict,
            list,
        ),
    ):

        return value


    if not isinstance(
        value,
        str,
    ):

        return default


    if not value.strip():

        return default


    try:

        return json.loads(
            value
        )

    except (
        json.JSONDecodeError,
        TypeError,
        ValueError,
    ):

        return default


def clamp_score(
    value: Any,
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

        return 0


    return max(
        0,
        min(
            100,
            score,
        ),
    )


def average_metric(
    evaluations: Any,
    metric: str,
) -> int:

    if not isinstance(
        evaluations,
        list,
    ):

        return 0


    values = []


    for evaluation in evaluations:

        if not isinstance(
            evaluation,
            dict,
        ):

            continue


        value = evaluation.get(
            metric
        )


        try:

            value = float(
                value
            )

            if value >= 0:

                values.append(
                    value
                )

        except (
            TypeError,
            ValueError,
        ):

            continue


    if not values:

        return 0


    return clamp_score(

        sum(
            values
        )

        /

        len(
            values
        )

    )


def get_status(
    interview: InterviewSession,
) -> str:

    report = safe_json_load(

        interview.final_report,

        {},

    )


    if (

        isinstance(
            report,
            dict,
        )

        and

        report.get(
            "_type"
        )
        == "session_progress"

    ):

        if report.get(
            "is_paused"
        ):

            return "paused"


        return report.get(
            "status",
            "in_progress",
        )


    return "completed"


# ============================================================
# INTERVIEW HISTORY
# ============================================================

@router.get(
    "/interview-history"
)
def get_history(
    user_id: int | None = None,
    include_incomplete: bool = True,
    db: Session = Depends(get_db),
):

    query = (

        db.query(
            InterviewSession
        )

    )


    if user_id is not None:

        query = query.filter(

            InterviewSession.user_id
            == user_id

        )


    interviews = (

        query
        .order_by(
            InterviewSession.created_at.desc(),
            InterviewSession.id.desc(),
        )
        .all()

    )


    results = []


    for interview in interviews:

        status = get_status(
            interview
        )


        if (
            not include_incomplete
            and status != "completed"
        ):

            continue


        evaluations = safe_json_load(

            interview.evaluations,

            [],

        )


        technical = clamp_score(

            interview.technical_score

            or

            average_metric(
                evaluations,
                "technical",
            )

        )


        communication = clamp_score(

            interview.communication_score

            or

            average_metric(
                evaluations,
                "communication",
            )

        )


        confidence = clamp_score(

            interview.confidence_score

            or

            average_metric(
                evaluations,
                "confidence",
            )

        )


        overall_score = clamp_score(

            interview.overall_score

        )


        candidate_score = clamp_score(

            interview.candidate_score

            or

            overall_score

        )


        results.append({

            "id":
                interview.id,

            "session_id":
                interview.id,

            "user_id":
                interview.user_id,

            "role":
                interview.role
                or "Mock Interview",

            "level":
                interview.level
                or "General",

            "status":
                status,

            "overall_score":
                overall_score,

            "score":
                overall_score,

            "candidate_score":
                candidate_score,

            "resume_score":
                clamp_score(
                    interview.resume_score
                ),

            "jd_match_score":
                clamp_score(
                    interview.jd_match_score
                ),

            "technical":
                technical,

            "technical_score":
                technical,

            "communication":
                communication,

            "communication_score":
                communication,

            "confidence":
                confidence,

            "confidence_score":
                confidence,

            "speech_score":
                clamp_score(
                    interview.speech_score
                ),

            "filler_words":
                max(
                    0,
                    interview.filler_words
                    or 0,
                ),

            "speaking_speed":
                max(
                    0,
                    interview.speaking_speed
                    or 0,
                ),

            "pause_score":
                clamp_score(
                    interview.pause_score
                ),

            "pronunciation_score":
                clamp_score(
                    interview.pronunciation_score
                ),

            "eye_contact_score":
                clamp_score(
                    interview.eye_contact_score
                ),

            "emotion_score":
                clamp_score(
                    interview.emotion_score
                ),

            "posture_score":
                clamp_score(
                    interview.posture_score
                ),

            "behavior_score":
                clamp_score(
                    interview.behavior_score
                ),

            "hiring_probability":
                clamp_score(
                    interview.hiring_probability
                ),

            "recommendation":

                interview.recruiter_recommendation

                or "",

            "created_at":

                interview.created_at.isoformat()

                if interview.created_at

                else None,

            "final_report":

                safe_json_load(
                    interview.final_report,
                    None,
                ),

        })


    return {

        "total":
            len(
                results
            ),

        "sessions":
            results,

        "history":
            results,

    }