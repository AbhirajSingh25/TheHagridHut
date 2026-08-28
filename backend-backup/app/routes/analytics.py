import json
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import (
    APIRouter,
    Depends,
    Query,
)
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_active_user
from app.models import (
    InterviewSession,
    User,
)


router = APIRouter(
    tags=["Analytics"],
)


# ============================================================
# HELPERS
# ============================================================

def safe_json(
    value: Any,
    default: Any,
) -> Any:
    """
    Safely decode values that may come from:
        - PostgreSQL JSON/JSONB
        - SQLAlchemy objects
        - JSON strings
        - legacy text columns
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

    value = value.strip()

    if not value:
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


def safe_number(
    value: Any,
    default: float = 0.0,
) -> float:
    """
    Convert values to numeric safely.
    """

    try:
        number = float(
            value
        )

        if number != number:
            return default

        return number

    except (
        TypeError,
        ValueError,
    ):
        return default


def clamp_score(
    value: Any,
) -> float:
    """
    Convert score to the valid 0-100 range.
    """

    score = safe_number(
        value,
        0.0,
    )

    return max(
        0.0,
        min(
            100.0,
            score,
        ),
    )


def get_average(
    values: list[float],
) -> float:
    """
    Return average of valid positive values.
    """

    valid_values = [
        safe_number(value)
        for value in values
        if safe_number(value) > 0
    ]

    if not valid_values:
        return 0.0

    return round(
        sum(valid_values)
        / len(valid_values),
        1,
    )


def get_first_number(
    *values: Any,
) -> float:
    """
    Return the first meaningful score.
    """

    for value in values:

        if value is None:
            continue

        score = safe_number(
            value
        )

        if score > 0:
            return score

    return 0.0


def get_dict_number(
    data: dict,
    *keys: str,
) -> float:
    """
    Find the first valid numeric value
    from a dictionary.
    """

    if not isinstance(
        data,
        dict,
    ):
        return 0.0

    for key in keys:

        if key not in data:
            continue

        value = safe_number(
            data.get(key)
        )

        if value > 0:
            return value

    return 0.0


def normalize_datetime(
    value: Any,
) -> datetime | None:
    """
    Normalize SQLAlchemy datetime values.
    """

    if value is None:
        return None

    if isinstance(
        value,
        datetime,
    ):
        if value.tzinfo is None:
            return value.replace(
                tzinfo=timezone.utc
            )

        return value.astimezone(
            timezone.utc
        )

    if isinstance(
        value,
        str,
    ):
        try:
            parsed = datetime.fromisoformat(
                value.replace(
                    "Z",
                    "+00:00",
                )
            )

            if parsed.tzinfo is None:
                parsed = parsed.replace(
                    tzinfo=timezone.utc
                )

            return parsed.astimezone(
                timezone.utc
            )

        except ValueError:
            return None

    return None


# ============================================================
# SESSION METRICS
# ============================================================

def extract_session_metrics(
    session: InterviewSession,
) -> dict:
    """
    Extract normalized analytics metrics from an interview session.

    Supports both:
        - current InterviewSession columns
        - legacy data stored inside final_report
        - answer-level evaluations
    """

    evaluations = safe_json(
        getattr(
            session,
            "evaluations",
            None,
        ),
        [],
    )

    final_report = safe_json(
        getattr(
            session,
            "final_report",
            None,
        ),
        {},
    )

    if not isinstance(
        final_report,
        dict,
    ):
        final_report = {}

    if not isinstance(
        evaluations,
        list,
    ):
        evaluations = []

    technical_values: list[float] = []
    communication_values: list[float] = []
    confidence_values: list[float] = []
    evaluation_scores: list[float] = []

    for evaluation in evaluations:

        if not isinstance(
            evaluation,
            dict,
        ):
            continue

        technical = get_dict_number(
            evaluation,
            "technical_score",
            "technical",
        )

        communication = get_dict_number(
            evaluation,
            "communication_score",
            "communication",
        )

        confidence = get_dict_number(
            evaluation,
            "confidence_score",
            "confidence",
        )

        score = get_dict_number(
            evaluation,
            "score",
            "overall_score",
            "candidate_score",
        )

        if technical > 0:
            technical_values.append(
                technical
            )

        if communication > 0:
            communication_values.append(
                communication
            )

        if confidence > 0:
            confidence_values.append(
                confidence
            )

        if score > 0:
            evaluation_scores.append(
                score
            )

    technical = get_first_number(
        getattr(
            session,
            "technical_score",
            None,
        ),
        final_report.get(
            "technical_score"
        ),
        final_report.get(
            "technical"
        ),
        get_average(
            technical_values
        ),
    )

    communication = get_first_number(
        getattr(
            session,
            "communication_score",
            None,
        ),
        final_report.get(
            "communication_score"
        ),
        final_report.get(
            "communication"
        ),
        get_average(
            communication_values
        ),
    )

    confidence = get_first_number(
        getattr(
            session,
            "confidence_score",
            None,
        ),
        final_report.get(
            "confidence_score"
        ),
        final_report.get(
            "confidence"
        ),
        get_average(
            confidence_values
        ),
    )

    overall_score = get_first_number(
        getattr(
            session,
            "overall_score",
            None,
        ),
        getattr(
            session,
            "candidate_score",
            None,
        ),
        final_report.get(
            "overall_score"
        ),
        final_report.get(
            "candidate_score"
        ),
        final_report.get(
            "score"
        ),
        get_average(
            evaluation_scores
        ),
    )

    if overall_score == 0:

        metric_values = [
            value
            for value in [
                technical,
                communication,
                confidence,
            ]
            if value > 0
        ]

        if metric_values:

            overall_score = (
                sum(metric_values)
                /
                len(metric_values)
            )

    speech_score = get_first_number(
        getattr(
            session,
            "speech_score",
            None,
        ),
        final_report.get(
            "speech_score"
        ),
    )

    vision_score = get_first_number(
        getattr(
            session,
            "vision_score",
            None,
        ),
        final_report.get(
            "vision_score"
        ),
    )

    resume_score = get_first_number(
        getattr(
            session,
            "resume_score",
            None,
        ),
        final_report.get(
            "resume_score"
        ),
    )

    jd_match_score = get_first_number(
        getattr(
            session,
            "jd_match_score",
            None,
        ),
        final_report.get(
            "jd_match_score"
        ),
    )

    hiring_probability = get_first_number(
        getattr(
            session,
            "hiring_probability",
            None,
        ),
        final_report.get(
            "hiring_probability"
        ),
    )

    return {

        "technical":
            round(
                clamp_score(
                    technical
                ),
                1,
            ),

        "communication":
            round(
                clamp_score(
                    communication
                ),
                1,
            ),

        "confidence":
            round(
                clamp_score(
                    confidence
                ),
                1,
            ),

        "overall_score":
            round(
                clamp_score(
                    overall_score
                ),
                1,
            ),

        "speech_score":
            round(
                clamp_score(
                    speech_score
                ),
                1,
            ),

        "vision_score":
            round(
                clamp_score(
                    vision_score
                ),
                1,
            ),

        "resume_score":
            round(
                clamp_score(
                    resume_score
                ),
                1,
            ),

        "jd_match_score":
            round(
                clamp_score(
                    jd_match_score
                ),
                1,
            ),

        "hiring_probability":
            round(
                clamp_score(
                    hiring_probability
                ),
                1,
            ),

    }


# ============================================================
# SESSION STATUS
# ============================================================

def get_session_status(
    session: InterviewSession,
) -> str:

    status = getattr(
        session,
        "status",
        None,
    )

    if status:
        return str(
            status
        ).lower()

    if getattr(
        session,
        "is_paused",
        False,
    ):
        return "paused"

    final_report = safe_json(
        getattr(
            session,
            "final_report",
            None,
        ),
        {},
    )

    if (
        isinstance(
            final_report,
            dict,
        )
        and
        final_report.get(
            "_type"
        )
        == "session_progress"
    ):

        if final_report.get(
            "is_paused"
        ):
            return "paused"

        return str(
            final_report.get(
                "status",
                "in_progress",
            )
        ).lower()

    if getattr(
        session,
        "completed_at",
        None,
    ):
        return "completed"

    return "completed"


# ============================================================
# PERIOD FILTER
# ============================================================

def get_period_start(
    period: str,
) -> datetime | None:

    now = datetime.now(
        timezone.utc
    )

    normalized = (
        period
        .strip()
        .lower()
    )

    if normalized in (
        "all",
        "all_time",
        "all-time",
    ):
        return None

    if normalized in (
        "7d",
        "week",
        "7days",
    ):
        return now - timedelta(
            days=7
        )

    if normalized in (
        "30d",
        "month",
        "30days",
    ):
        return now - timedelta(
            days=30
        )

    if normalized in (
        "90d",
        "quarter",
        "3months",
    ):
        return now - timedelta(
            days=90
        )

    if normalized in (
        "1y",
        "year",
        "365d",
    ):
        return now - timedelta(
            days=365
        )

    return None


# ============================================================
# MAIN ANALYTICS
# ============================================================

@router.get(
    "/analytics",
)
def get_analytics(
    period: str = Query(
        default="all",
    ),
    include_incomplete: bool = Query(
        default=True,
    ),
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        get_current_active_user
    ),
):
    """
    Return analytics for the authenticated user.

    Public frontend contract:
        GET /analytics

    Query parameters:
        period:
            all
            7d
            30d
            90d
            1y

        include_incomplete:
            true / false
    """

    period_start = get_period_start(
        period
    )

    query = (
        db.query(
            InterviewSession
        )
        .filter(
            InterviewSession.user_id
            == current_user.id
        )
        .order_by(
            InterviewSession.created_at.asc(),
            InterviewSession.id.asc(),
        )
    )

    sessions = query.all()

    filtered_sessions: list[
        InterviewSession
    ] = []

    for session in sessions:

        status = get_session_status(
            session
        )

        if (
            not include_incomplete
            and status
            != "completed"
        ):
            continue

        created_at = normalize_datetime(
            getattr(
                session,
                "created_at",
                None,
            )
        )

        if (
            period_start
            and created_at
            and created_at < period_start
        ):
            continue

        filtered_sessions.append(
            session
        )

    session_data: list[dict] = []

    technical_scores: list[float] = []
    communication_scores: list[float] = []
    confidence_scores: list[float] = []
    overall_scores: list[float] = []

    speech_scores: list[float] = []
    vision_scores: list[float] = []
    resume_scores: list[float] = []
    jd_match_scores: list[float] = []
    hiring_probabilities: list[float] = []

    completed_sessions = 0
    paused_sessions = 0
    in_progress_sessions = 0

    role_stats: dict[
        str,
        list[float]
    ] = defaultdict(
        list
    )

    trend_data: list[dict] = []

    for index, session in enumerate(
        filtered_sessions,
        start=1,
    ):

        metrics = extract_session_metrics(
            session
        )

        status = get_session_status(
            session
        )

        if status == "completed":
            completed_sessions += 1

        elif status == "paused":
            paused_sessions += 1

        else:
            in_progress_sessions += 1

        technical = metrics[
            "technical"
        ]

        communication = metrics[
            "communication"
        ]

        confidence = metrics[
            "confidence"
        ]

        overall_score = metrics[
            "overall_score"
        ]

        technical_scores.append(
            technical
        )

        communication_scores.append(
            communication
        )

        confidence_scores.append(
            confidence
        )

        overall_scores.append(
            overall_score
        )

        speech_scores.append(
            metrics[
                "speech_score"
            ]
        )

        vision_scores.append(
            metrics[
                "vision_score"
            ]
        )

        resume_scores.append(
            metrics[
                "resume_score"
            ]
        )

        jd_match_scores.append(
            metrics[
                "jd_match_score"
            ]
        )

        hiring_probabilities.append(
            metrics[
                "hiring_probability"
            ]
        )

        role = (
            getattr(
                session,
                "role",
                None,
            )
            or "Mock Interview"
        )

        role_stats[
            role
        ].append(
            overall_score
        )

        created_at = normalize_datetime(
            getattr(
                session,
                "created_at",
                None,
            )
        )

        created_at_iso = (
            created_at.isoformat()
            if created_at
            else None
        )

        session_data.append({

            "id":
                session.id,

            "session_id":
                session.id,

            "role":
                role,

            "level":
                (
                    getattr(
                        session,
                        "level",
                        None,
                    )
                    or "General"
                ),

            "interview_type":
                (
                    getattr(
                        session,
                        "interview_type",
                        None,
                    )
                    or "mock"
                ),

            "status":
                status,

            "score":
                overall_score,

            "overall_score":
                overall_score,

            "confidence":
                confidence,

            "confidence_score":
                confidence,

            "communication":
                communication,

            "communication_score":
                communication,

            "technical":
                technical,

            "technical_score":
                technical,

            "speech_score":
                metrics[
                    "speech_score"
                ],

            "vision_score":
                metrics[
                    "vision_score"
                ],

            "resume_score":
                metrics[
                    "resume_score"
                ],

            "jd_match_score":
                metrics[
                    "jd_match_score"
                ],

            "hiring_probability":
                metrics[
                    "hiring_probability"
                ],

            "created_at":
                created_at_iso,

        })

        trend_data.append({

            "session":
                index,

            "session_id":
                session.id,

            "score":
                overall_score,

            "overall_score":
                overall_score,

            "technical":
                technical,

            "communication":
                communication,

            "confidence":
                confidence,

            "created_at":
                created_at_iso,

        })


    # --------------------------------------------------------
    # AVERAGES
    # --------------------------------------------------------

    average_score = get_average(
        overall_scores
    )

    average_confidence = get_average(
        confidence_scores
    )

    average_communication = get_average(
        communication_scores
    )

    average_technical = get_average(
        technical_scores
    )

    average_speech = get_average(
        speech_scores
    )

    average_vision = get_average(
        vision_scores
    )

    average_resume = get_average(
        resume_scores
    )

    average_jd_match = get_average(
        jd_match_scores
    )

    average_hiring_probability = get_average(
        hiring_probabilities
    )


    # --------------------------------------------------------
    # IMPROVEMENT
    # --------------------------------------------------------

    valid_scores = [
        score
        for score in overall_scores
        if score > 0
    ]

    improvement = 0.0

    if len(
        valid_scores
    ) >= 2:

        first_score = valid_scores[0]
        latest_score = valid_scores[-1]

        improvement = round(
            latest_score
            -
            first_score,
            1,
        )


    # --------------------------------------------------------
    # TREND
    # --------------------------------------------------------

    recent_trend = "stable"

    if len(
        valid_scores
    ) >= 2:

        recent_window = (
            valid_scores[-5:]
        )

        if len(
            recent_window
        ) >= 2:

            delta = (
                recent_window[-1]
                -
                recent_window[0]
            )

            if delta >= 3:
                recent_trend = "improving"

            elif delta <= -3:
                recent_trend = "declining"


    # --------------------------------------------------------
    # BEST / LOWEST METRICS
    # --------------------------------------------------------

    metric_averages = {

        "technical":
            average_technical,

        "communication":
            average_communication,

        "confidence":
            average_confidence,

        "speech":
            average_speech,

        "vision":
            average_vision,

        "resume":
            average_resume,

        "jd_match":
            average_jd_match,

    }

    non_zero_metrics = {
        key: value
        for key, value
        in metric_averages.items()
        if value > 0
    }

    strongest_area = (
        max(
            non_zero_metrics,
            key=non_zero_metrics.get,
        )
        if non_zero_metrics
        else None
    )

    improvement_area = (
        min(
            non_zero_metrics,
            key=non_zero_metrics.get,
        )
        if non_zero_metrics
        else None
    )


    # --------------------------------------------------------
    # ROLE BREAKDOWN
    # --------------------------------------------------------

    role_breakdown = []

    for role, scores in sorted(
        role_stats.items(),
        key=lambda item: (
            -get_average(
                item[1]
            ),
            item[0],
        ),
    ):

        role_breakdown.append({

            "role":
                role,

            "interviews":
                len(
                    scores
                ),

            "average_score":
                get_average(
                    scores
                ),

        })


    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {

        "success":
            True,

        "period":
            period,

        "total_interviews":
            len(
                filtered_sessions
            ),

        "total_sessions":
            len(
                filtered_sessions
            ),

        "completed_sessions":
            completed_sessions,

        "paused_sessions":
            paused_sessions,

        "in_progress_sessions":
            in_progress_sessions,

        "average_score":
            average_score,

        "overall_score":
            average_score,

        "average_confidence":
            average_confidence,

        "average_communication":
            average_communication,

        "average_technical":
            average_technical,

        "average_speech_score":
            average_speech,

        "average_vision_score":
            average_vision,

        "average_resume_score":
            average_resume,

        "average_jd_match_score":
            average_jd_match,

        "average_hiring_probability":
            average_hiring_probability,

        "improvement":
            improvement,

        "improvement_percentage":
            improvement,

        "trend":
            recent_trend,

        "strongest_area":
            strongest_area,

        "improvement_area":
            improvement_area,

        "metrics": {

            "technical":
                average_technical,

            "communication":
                average_communication,

            "confidence":
                average_confidence,

            "speech":
                average_speech,

            "vision":
                average_vision,

            "resume":
                average_resume,

            "jd_match":
                average_jd_match,

        },

        "sessions":
            session_data,

        "session_data":
            session_data,

        "history":
            session_data,

        "trend_data":
            trend_data,

        "performance_trend":
            trend_data,

        "role_breakdown":
            role_breakdown,

    }
