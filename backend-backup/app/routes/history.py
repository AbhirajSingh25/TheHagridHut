import json
from datetime import datetime
from typing import Any

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_active_user
from app.models import (
    InterviewSession,
    User,
)


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
    """
    Safely deserialize JSON fields.

    Supports:
        - PostgreSQL JSON/JSONB values
        - Python dict/list values
        - JSON strings
        - empty/null values
    """

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
    """
    Convert a score to a frontend-safe integer between 0 and 100.
    """

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


def safe_number(
    value: Any,
    default: float = 0,
) -> float:
    """
    Convert database values safely to numbers.
    """

    try:
        return float(value)

    except (
        TypeError,
        ValueError,
    ):
        return default


def average_metric(
    evaluations: Any,
    metric: str,
) -> int:
    """
    Calculate the average metric from answer evaluations.
    """

    if not isinstance(
        evaluations,
        list,
    ):
        return 0

    values: list[float] = []

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

            numeric_value = float(
                value
            )

            if numeric_value >= 0:

                values.append(
                    numeric_value
                )

        except (
            TypeError,
            ValueError,
        ):
            continue

    if not values:
        return 0

    return clamp_score(
        sum(values)
        /
        len(values)
    )


def get_status(
    interview: InterviewSession,
) -> str:
    """
    Determine the current interview status.

    Supports:
        - explicit model status
        - paused sessions
        - legacy progress stored in final_report
        - completed sessions
    """

    explicit_status = getattr(
        interview,
        "status",
        None,
    )

    if explicit_status:
        return str(
            explicit_status
        ).lower()

    if getattr(
        interview,
        "is_paused",
        False,
    ):
        return "paused"

    report = safe_json_load(
        getattr(
            interview,
            "final_report",
            None,
        ),
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

        return str(
            report.get(
                "status",
                "in_progress",
            )
        ).lower()

    completed_at = getattr(
        interview,
        "completed_at",
        None,
    )

    if completed_at:
        return "completed"

    return "completed"


def get_first_available_score(
    *values: Any,
) -> int:
    """
    Return the first meaningful score.

    Useful for preserving legacy data where:
        direct database score might be missing
        but evaluation data exists.
    """

    for value in values:

        if value is None:
            continue

        score = clamp_score(
            value
        )

        if score > 0:
            return score

    return 0


def serialize_interview(
    interview: InterviewSession,
) -> dict:
    """
    Convert an InterviewSession into the stable frontend
    history contract.

    This intentionally preserves existing response keys.
    """

    status = get_status(
        interview
    )

    evaluations = safe_json_load(
        getattr(
            interview,
            "evaluations",
            None,
        ),
        [],
    )

    final_report = safe_json_load(
        getattr(
            interview,
            "final_report",
            None,
        ),
        None,
    )

    technical = get_first_available_score(
        getattr(
            interview,
            "technical_score",
            None,
        ),
        average_metric(
            evaluations,
            "technical",
        ),
    )

    communication = get_first_available_score(
        getattr(
            interview,
            "communication_score",
            None,
        ),
        average_metric(
            evaluations,
            "communication",
        ),
    )

    confidence = get_first_available_score(
        getattr(
            interview,
            "confidence_score",
            None,
        ),
        average_metric(
            evaluations,
            "confidence",
        ),
    )

    overall_score = get_first_available_score(
        getattr(
            interview,
            "overall_score",
            None,
        ),
    )

    candidate_score = get_first_available_score(
        getattr(
            interview,
            "candidate_score",
            None,
        ),
        overall_score,
    )

    created_at = getattr(
        interview,
        "created_at",
        None,
    )

    updated_at = getattr(
        interview,
        "updated_at",
        None,
    )

    completed_at = getattr(
        interview,
        "completed_at",
        None,
    )

    return {

        # ----------------------------------------------------
        # IDENTIFIERS
        # ----------------------------------------------------

        "id":
            interview.id,

        "session_id":
            interview.id,

        "user_id":
            interview.user_id,


        # ----------------------------------------------------
        # INTERVIEW METADATA
        # ----------------------------------------------------

        "role":
            getattr(
                interview,
                "role",
                None,
            )
            or "Mock Interview",

        "level":
            getattr(
                interview,
                "level",
                None,
            )
            or "General",

        "interview_type":
            getattr(
                interview,
                "interview_type",
                None,
            )
            or "mock",

        "company":
            getattr(
                interview,
                "company",
                None,
            ),

        "status":
            status,

        "is_paused":
            bool(
                getattr(
                    interview,
                    "is_paused",
                    False,
                )
            ),

        "current_question_index":
            max(
                0,
                int(
                    getattr(
                        interview,
                        "current_question_index",
                        0,
                    )
                    or 0
                ),
            ),


        # ----------------------------------------------------
        # PRIMARY SCORES
        # ----------------------------------------------------

        "overall_score":
            overall_score,

        "score":
            overall_score,

        "candidate_score":
            candidate_score,

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


        # ----------------------------------------------------
        # RESUME / JD
        # ----------------------------------------------------

        "resume_score":
            clamp_score(
                getattr(
                    interview,
                    "resume_score",
                    None,
                )
            ),

        "jd_match_score":
            clamp_score(
                getattr(
                    interview,
                    "jd_match_score",
                    None,
                )
            ),


        # ----------------------------------------------------
        # SPEECH
        # ----------------------------------------------------

        "speech_score":
            clamp_score(
                getattr(
                    interview,
                    "speech_score",
                    None,
                )
            ),

        "filler_words":
            max(
                0,
                int(
                    getattr(
                        interview,
                        "filler_words",
                        0,
                    )
                    or 0
                ),
            ),

        "speaking_speed":
            max(
                0,
                safe_number(
                    getattr(
                        interview,
                        "speaking_speed",
                        0,
                    )
                ),
            ),

        "pause_score":
            clamp_score(
                getattr(
                    interview,
                    "pause_score",
                    None,
                )
            ),

        "pronunciation_score":
            clamp_score(
                getattr(
                    interview,
                    "pronunciation_score",
                    None,
                )
            ),

        "clarity_score":
            clamp_score(
                getattr(
                    interview,
                    "clarity_score",
                    None,
                )
            ),


        # ----------------------------------------------------
        # VISION
        # ----------------------------------------------------

        "vision_score":
            clamp_score(
                getattr(
                    interview,
                    "vision_score",
                    None,
                )
            ),

        "eye_contact_score":
            clamp_score(
                getattr(
                    interview,
                    "eye_contact_score",
                    None,
                )
            ),

        "emotion_score":
            clamp_score(
                getattr(
                    interview,
                    "emotion_score",
                    None,
                )
            ),

        "posture_score":
            clamp_score(
                getattr(
                    interview,
                    "posture_score",
                    None,
                )
            ),

        "behavior_score":
            clamp_score(
                getattr(
                    interview,
                    "behavior_score",
                    None,
                )
            ),

        "attention_score":
            clamp_score(
                getattr(
                    interview,
                    "attention_score",
                    None,
                )
            ),

        "engagement_score":
            clamp_score(
                getattr(
                    interview,
                    "engagement_score",
                    None,
                )
            ),


        # ----------------------------------------------------
        # HIRING / RECRUITER
        # ----------------------------------------------------

        "hiring_probability":
            clamp_score(
                getattr(
                    interview,
                    "hiring_probability",
                    None,
                )
            ),

        "recommendation":
            getattr(
                interview,
                "recruiter_recommendation",
                None,
            )
            or "",

        "recruiter_recommendation":
            getattr(
                interview,
                "recruiter_recommendation",
                None,
            )
            or "",

        "recruiter_notes":
            getattr(
                interview,
                "recruiter_notes",
                None,
            )
            or "",


        # ----------------------------------------------------
        # CONTENT
        # ----------------------------------------------------

        "questions":
            safe_json_load(
                getattr(
                    interview,
                    "questions",
                    None,
                ),
                [],
            ),

        "answers":
            safe_json_load(
                getattr(
                    interview,
                    "answers",
                    None,
                ),
                [],
            ),

        "evaluations":
            evaluations,

        "strengths":
            safe_json_load(
                getattr(
                    interview,
                    "strengths",
                    None,
                ),
                [],
            ),

        "improvement_areas":
            safe_json_load(
                getattr(
                    interview,
                    "improvement_areas",
                    None,
                ),
                [],
            ),

        "final_report":
            final_report,


        # ----------------------------------------------------
        # CERTIFICATE
        # ----------------------------------------------------

        "certificate_id":
            getattr(
                interview,
                "certificate_id",
                None,
            ),

        "certificate_generated":
            bool(
                getattr(
                    interview,
                    "certificate_generated",
                    False,
                )
            ),


        # ----------------------------------------------------
        # TIMESTAMPS
        # ----------------------------------------------------

        "created_at":
            created_at.isoformat()
            if created_at
            else None,

        "updated_at":
            updated_at.isoformat()
            if updated_at
            else None,

        "completed_at":
            completed_at.isoformat()
            if completed_at
            else None,

    }


# ============================================================
# INTERVIEW HISTORY
# ============================================================

@router.get(
    "/interview-history",
)
def get_history(
    include_incomplete: bool = Query(
        default=True,
    ),
    status_filter: str | None = Query(
        default=None,
        alias="status",
    ),
    role: str | None = Query(
        default=None,
    ),
    limit: int = Query(
        default=100,
        ge=1,
        le=500,
    ),
    offset: int = Query(
        default=0,
        ge=0,
    ),
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        get_current_active_user
    ),
):
    """
    Return interview history for the authenticated user.

    Security:
        The user_id is derived from the JWT.
        Users cannot query another user's history.

    Compatibility:
        Existing response keys are preserved:
            total
            sessions
            history
    """

    query = (
        db.query(
            InterviewSession
        )
        .filter(
            InterviewSession.user_id
            == current_user.id
        )
    )

    if role:

        query = query.filter(
            InterviewSession.role
            .ilike(
                f"%{role.strip()}%"
            )
        )

    interviews = (
        query
        .order_by(
            InterviewSession.created_at.desc(),
            InterviewSession.id.desc(),
        )
        .all()
    )

    results: list[dict] = []

    normalized_status_filter = (
        status_filter.strip().lower()
        if status_filter
        else None
    )

    for interview in interviews:

        interview_status = get_status(
            interview
        )

        if (
            not include_incomplete
            and interview_status
            != "completed"
        ):
            continue

        if (
            normalized_status_filter
            and interview_status
            != normalized_status_filter
        ):
            continue

        results.append(
            serialize_interview(
                interview
            )
        )

    total = len(
        results
    )

    paginated_results = results[
        offset:
        offset + limit
    ]

    return {

        "total":
            total,

        "returned":
            len(
                paginated_results
            ),

        "limit":
            limit,

        "offset":
            offset,

        "sessions":
            paginated_results,

        "history":
            paginated_results,

    }
