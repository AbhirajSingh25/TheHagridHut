import json
import math
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import InterviewSession, User


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"],
)


# ============================================================
# CONSTANTS
# ============================================================

EMPTY_STATUS_VALUES = {
    "",
    "none",
    "null",
    "unknown",
    "not_started",
}


# ============================================================
# GENERIC HELPERS
# ============================================================

def safe_float(
    value: Any,
    default: float = 0.0,
) -> float:

    try:

        if value is None:
            return default

        return float(value)

    except (
        TypeError,
        ValueError,
    ):

        return default


def safe_int(
    value: Any,
    default: int = 0,
) -> int:

    try:

        if value is None:
            return default

        return int(value)

    except (
        TypeError,
        ValueError,
    ):

        return default


def clamp_score(
    value: Any,
) -> float:

    score = safe_float(value)

    return max(
        0.0,
        min(
            100.0,
            score,
        ),
    )


def round_score(
    value: Any,
    digits: int = 1,
) -> float:

    return round(
        safe_float(value),
        digits,
    )


def parse_json_value(
    value: Any,
    default: Any = None,
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

        return value

    cleaned = value.strip()

    if not cleaned:

        return default

    try:

        return json.loads(
            cleaned
        )

    except Exception:

        return default


def normalize_text(
    value: Any,
) -> str:

    if value is None:

        return ""

    return str(
        value
    ).strip()


def normalize_status(
    value: Any,
) -> str:

    status = normalize_text(
        value
    ).lower()

    if status in EMPTY_STATUS_VALUES:

        return "unknown"

    return status


def get_model_attribute(
    model: Any,
    name: str,
) -> Any:

    if hasattr(
        model,
        name,
    ):

        return getattr(
            model,
            name,
        )

    return None


def get_object_attribute(
    obj: Any,
    name: str,
    default: Any = None,
) -> Any:

    try:

        return getattr(
            obj,
            name,
            default,
        )

    except Exception:

        return default


def parse_datetime(
    value: Any,
) -> Optional[datetime]:

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

        return value

    if isinstance(
        value,
        str,
    ):

        value = value.strip()

        if not value:

            return None

        possible_formats = [

            "%Y-%m-%dT%H:%M:%S.%f%z",

            "%Y-%m-%dT%H:%M:%S%z",

            "%Y-%m-%dT%H:%M:%S.%f",

            "%Y-%m-%dT%H:%M:%S",

            "%Y-%m-%d %H:%M:%S",

            "%Y-%m-%d",
        ]

        for date_format in possible_formats:

            try:

                parsed = datetime.strptime(
                    value,
                    date_format,
                )

                if parsed.tzinfo is None:

                    parsed = parsed.replace(
                        tzinfo=timezone.utc
                    )

                return parsed

            except Exception:

                continue

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

            return parsed

        except Exception:

            return None

    return None


def serialize_datetime(
    value: Any,
) -> Optional[str]:

    parsed = parse_datetime(
        value
    )

    if parsed is None:

        return None

    return parsed.isoformat()


def calculate_average(
    values: list[float],
) -> float:

    valid_values = [

        safe_float(value)

        for value in values

        if value is not None

    ]

    if not valid_values:

        return 0.0

    return round(

        sum(valid_values)
        / len(valid_values),

        1,
    )


def calculate_percentage_change(
    current: float,
    previous: float,
) -> float:

    current = safe_float(
        current
    )

    previous = safe_float(
        previous
    )

    if previous <= 0:

        if current > 0:

            return 100.0

        return 0.0

    return round(

        (
            (
                current
                - previous
            )
            / previous
        )
        * 100,

        1,
    )


def format_growth_label(
    value: float,
) -> str:

    value = safe_float(
        value
    )

    if value > 0:

        return f"+{value}%"

    return f"{value}%"


# ============================================================
# DATABASE COLLECTION HELPERS
# ============================================================

def get_all_users(
    db: Session,
) -> list[User]:

    return (
        db.query(User)
        .order_by(
            User.id.desc()
        )
        .all()
    )


def get_all_interviews(
    db: Session,
) -> list[InterviewSession]:

    query = db.query(
        InterviewSession
    )

    created_at_column = get_model_attribute(
        InterviewSession,
        "created_at",
    )

    if created_at_column is not None:

        query = query.order_by(
            created_at_column.desc()
        )

    else:

        query = query.order_by(
            InterviewSession.id.desc()
        )

    return query.all()


# ============================================================
# INTERVIEW STATUS
# ============================================================

def is_completed_interview(
    interview: InterviewSession,
) -> bool:

    status = normalize_status(
        get_object_attribute(
            interview,
            "status",
            "",
        )
    )

    if status in {

        "completed",

        "complete",

        "finished",

        "done",

        "submitted",

    }:

        return True

    completed_at = get_object_attribute(
        interview,
        "completed_at",
    )

    if completed_at is not None:

        return True

    final_report = get_object_attribute(
        interview,
        "final_report",
    )

    if final_report:

        return True

    overall_score = safe_float(
        get_object_attribute(
            interview,
            "overall_score",
            0,
        )
    )

    if overall_score > 0:

        return True

    return False


def is_active_interview(
    interview: InterviewSession,
) -> bool:

    status = normalize_status(
        get_object_attribute(
            interview,
            "status",
            "",
        )
    )

    if status in {

        "active",

        "in_progress",

        "started",

        "paused",

        "ongoing",

    }:

        return True

    if get_object_attribute(
        interview,
        "is_paused",
        False,
    ):

        return True

    return False


# ============================================================
# SCORE EXTRACTION
# ============================================================

def get_interview_score(
    interview: InterviewSession,
) -> float:

    score_fields = [

        "overall_score",

        "candidate_score",

    ]

    scores = []

    for field in score_fields:

        value = safe_float(
            get_object_attribute(
                interview,
                field,
                0,
            )
        )

        if value > 0:

            scores.append(
                value
            )

    if scores:

        return calculate_average(
            scores
        )

    technical = safe_float(
        get_object_attribute(
            interview,
            "technical_score",
            0,
        )
    )

    communication = safe_float(
        get_object_attribute(
            interview,
            "communication_score",
            0,
        )
    )

    confidence = safe_float(
        get_object_attribute(
            interview,
            "confidence_score",
            0,
        )
    )

    relevance = safe_float(
        get_object_attribute(
            interview,
            "relevance_score",
            0,
        )
    )

    fallback_scores = [

        score

        for score in [

            technical,

            communication,

            confidence,

            relevance,

        ]

        if score > 0

    ]

    if fallback_scores:

        return calculate_average(
            fallback_scores
        )

    return 0.0


def get_score_breakdown(
    interview: InterviewSession,
) -> dict[str, float]:

    return {

        "overall_score":

            clamp_score(
                get_object_attribute(
                    interview,
                    "overall_score",
                    0,
                )
            ),

        "candidate_score":

            clamp_score(
                get_object_attribute(
                    interview,
                    "candidate_score",
                    0,
                )
            ),

        "technical_score":

            clamp_score(
                get_object_attribute(
                    interview,
                    "technical_score",
                    0,
                )
            ),

        "communication_score":

            clamp_score(
                get_object_attribute(
                    interview,
                    "communication_score",
                    0,
                )
            ),

        "confidence_score":

            clamp_score(
                get_object_attribute(
                    interview,
                    "confidence_score",
                    0,
                )
            ),

        "relevance_score":

            clamp_score(
                get_object_attribute(
                    interview,
                    "relevance_score",
                    0,
                )
            ),

        "speech_score":

            clamp_score(
                get_object_attribute(
                    interview,
                    "speech_score",
                    0,
                )
            ),

        "vision_score":

            clamp_score(
                get_object_attribute(
                    interview,
                    "vision_score",
                    0,
                )
            ),

        "resume_score":

            clamp_score(
                get_object_attribute(
                    interview,
                    "resume_score",
                    0,
                )
            ),

        "jd_match_score":

            clamp_score(
                get_object_attribute(
                    interview,
                    "jd_match_score",
                    0,
                )
            ),

    }


# ============================================================
# USER SERIALIZATION
# ============================================================

def serialize_user(
    user: User,
    interviews_by_user: dict[int, list[InterviewSession]],
) -> dict[str, Any]:

    user_id = safe_int(
        get_object_attribute(
            user,
            "id",
            0,
        )
    )

    user_interviews = interviews_by_user.get(
        user_id,
        [],
    )

    completed_interviews = [

        interview

        for interview in user_interviews

        if is_completed_interview(
            interview
        )

    ]

    scores = [

        get_interview_score(
            interview
        )

        for interview in completed_interviews

        if get_interview_score(
            interview
        ) > 0

    ]

    average_score = calculate_average(
        scores
    )

    created_at = serialize_datetime(
        get_object_attribute(
            user,
            "created_at",
        )
    )

    return {

        "id":

            user_id,

        "username":

            normalize_text(
                get_object_attribute(
                    user,
                    "username",
                    "",
                )
            ),

        "email":

            normalize_text(
                get_object_attribute(
                    user,
                    "email",
                    "",
                )
            ),

        "created_at":

            created_at,

        "total_interviews":

            len(
                user_interviews
            ),

        "completed_interviews":

            len(
                completed_interviews
            ),

        "average_score":

            average_score,

        "status":

            "active",

    }


# ============================================================
# INTERVIEW SERIALIZATION
# ============================================================

def serialize_interview(
    interview: InterviewSession,
    users_map: dict[int, User],
) -> dict[str, Any]:

    user_id = get_object_attribute(
        interview,
        "user_id",
    )

    user = users_map.get(
        safe_int(user_id)
    )

    status = normalize_status(
        get_object_attribute(
            interview,
            "status",
            "",
        )
    )

    if status == "unknown":

        if is_completed_interview(
            interview
        ):

            status = "completed"

        elif is_active_interview(
            interview
        ):

            status = "in_progress"

        else:

            status = "created"

    return {

        "id":

            safe_int(
                get_object_attribute(
                    interview,
                    "id",
                    0,
                )
            ),

        "user_id":

            safe_int(
                user_id
            ),

        "candidate":

            normalize_text(
                get_object_attribute(
                    user,
                    "username",
                    "",
                )
            ),

        "candidate_email":

            normalize_text(
                get_object_attribute(
                    user,
                    "email",
                    "",
                )
            ),

        "role":

            normalize_text(
                get_object_attribute(
                    interview,
                    "role",
                    "",
                )
            )
            or "General Interview",

        "level":

            normalize_text(
                get_object_attribute(
                    interview,
                    "level",
                    "",
                )
            )
            or "Not Specified",

        "interview_type":

            normalize_text(
                get_object_attribute(
                    interview,
                    "interview_type",
                    "",
                )
            )
            or "mock",

        "status":

            status,

        "overall_score":

            get_interview_score(
                interview
            ),

        "technical_score":

            clamp_score(
                get_object_attribute(
                    interview,
                    "technical_score",
                    0,
                )
            ),

        "communication_score":

            clamp_score(
                get_object_attribute(
                    interview,
                    "communication_score",
                    0,
                )
            ),

        "confidence_score":

            clamp_score(
                get_object_attribute(
                    interview,
                    "confidence_score",
                    0,
                )
            ),

        "hiring_probability":

            clamp_score(
                get_object_attribute(
                    interview,
                    "hiring_probability",
                    0,
                )
            ),

        "created_at":

            serialize_datetime(
                get_object_attribute(
                    interview,
                    "created_at",
                )
            ),

        "completed_at":

            serialize_datetime(
                get_object_attribute(
                    interview,
                    "completed_at",
                )
            ),

    }


# ============================================================
# ACTIVITY BUILDER
# ============================================================

def build_recent_activity(
    interviews: list[InterviewSession],
    users_map: dict[int, User],
    limit: int = 10,
) -> list[dict[str, Any]]:

    activity = []

    for interview in interviews:

        user_id = safe_int(
            get_object_attribute(
                interview,
                "user_id",
                0,
            )
        )

        user = users_map.get(
            user_id
        )

        candidate_name = normalize_text(
            get_object_attribute(
                user,
                "username",
                "",
            )
        )

        if not candidate_name:

            candidate_name = "Candidate"

        role = normalize_text(
            get_object_attribute(
                interview,
                "role",
                "",
            )
        )

        status = normalize_status(
            get_object_attribute(
                interview,
                "status",
                "",
            )
        )

        if is_completed_interview(
            interview
        ):

            action = "completed an interview"

            activity_type = "interview_completed"

        elif is_active_interview(
            interview
        ):

            action = "started an interview"

            activity_type = "interview_active"

        else:

            action = "created an interview session"

            activity_type = "interview_created"

        activity.append({

            "id":

                safe_int(
                    get_object_attribute(
                        interview,
                        "id",
                        0,
                    )
                ),

            "type":

                activity_type,

            "candidate":

                candidate_name,

            "role":

                role
                or "General Interview",

            "action":

                action,

            "status":

                status,

            "timestamp":

                serialize_datetime(
                    get_object_attribute(
                        interview,
                        "updated_at",
                    )
                )
                or serialize_datetime(
                    get_object_attribute(
                        interview,
                        "completed_at",
                    )
                )
                or serialize_datetime(
                    get_object_attribute(
                        interview,
                        "created_at",
                    )
                ),

        })

    return activity[:limit]


# ============================================================
# TIME SERIES
# ============================================================

def build_daily_interview_trend(
    interviews: list[InterviewSession],
    days: int = 7,
) -> list[dict[str, Any]]:

    now = datetime.now(
        timezone.utc
    )

    start_date = (
        now
        - timedelta(
            days=days - 1
        )
    ).date()

    counts = defaultdict(
        int
    )

    completed_counts = defaultdict(
        int
    )

    for interview in interviews:

        created_at = parse_datetime(
            get_object_attribute(
                interview,
                "created_at",
            )
        )

        if created_at is None:

            continue

        date_key = created_at.date()

        if date_key < start_date:

            continue

        counts[
            date_key
        ] += 1

        if is_completed_interview(
            interview
        ):

            completed_counts[
                date_key
            ] += 1

    trend = []

    for offset in range(days):

        current_date = (

            start_date

            + timedelta(
                days=offset
            )

        )

        trend.append({

            "date":

                current_date.isoformat(),

            "label":

                current_date.strftime(
                    "%a"
                ),

            "interviews":

                counts[
                    current_date
                ],

            "completed":

                completed_counts[
                    current_date
                ],

        })

    return trend


def build_monthly_user_growth(
    users: list[User],
    months: int = 6,
) -> list[dict[str, Any]]:

    now = datetime.now(
        timezone.utc
    )

    monthly_counts = defaultdict(
        int
    )

    current_year = now.year
    current_month = now.month

    month_keys = []

    for offset in range(
        months - 1,
        -1,
        -1,
    ):

        month = current_month - offset
        year = current_year

        while month <= 0:

            month += 12
            year -= 1

        month_key = (

            year,
            month,

        )

        month_keys.append(
            month_key
        )

    for user in users:

        created_at = parse_datetime(
            get_object_attribute(
                user,
                "created_at",
            )
        )

        if created_at is None:

            continue

        key = (

            created_at.year,
            created_at.month,

        )

        monthly_counts[
            key
        ] += 1

    trend = []

    running_total = 0

    for year, month in month_keys:

        month_count = monthly_counts[
            (
                year,
                month,
            )
        ]

        running_total += month_count

        trend.append({

            "month":

                datetime(
                    year,
                    month,
                    1,
                ).strftime(
                    "%b"
                ),

            "year":

                year,

            "users":

                month_count,

            "total":

                running_total,

        })

    return trend


# ============================================================
# ROLE DISTRIBUTION
# ============================================================

def build_role_distribution(
    interviews: list[InterviewSession],
) -> list[dict[str, Any]]:

    role_counter = Counter()

    for interview in interviews:

        role = normalize_text(
            get_object_attribute(
                interview,
                "role",
                "",
            )
        )

        if not role:

            role = "General"

        role_counter[
            role
        ] += 1

    total = sum(
        role_counter.values()
    )

    distribution = []

    for role, count in role_counter.most_common():

        percentage = 0.0

        if total > 0:

            percentage = round(
                (
                    count
                    / total
                )
                * 100,
                1,
            )

        distribution.append({

            "role":

                role,

            "count":

                count,

            "percentage":

                percentage,

        })

    return distribution


# ============================================================
# INTERVIEW TYPE DISTRIBUTION
# ============================================================

def build_interview_type_distribution(
    interviews: list[InterviewSession],
) -> list[dict[str, Any]]:

    type_counter = Counter()

    for interview in interviews:

        interview_type = normalize_text(
            get_object_attribute(
                interview,
                "interview_type",
                "",
            )
        )

        if not interview_type:

            interview_type = "mock"

        type_counter[
            interview_type
        ] += 1

    total = sum(
        type_counter.values()
    )

    result = []

    for interview_type, count in type_counter.most_common():

        percentage = 0.0

        if total > 0:

            percentage = round(
                (
                    count
                    / total
                )
                * 100,
                1,
            )

        result.append({

            "type":

                interview_type,

            "count":

                count,

            "percentage":

                percentage,

        })

    return result


# ============================================================
# PERFORMANCE ANALYTICS
# ============================================================

def build_performance_analytics(
    interviews: list[InterviewSession],
) -> dict[str, Any]:

    completed = [

        interview

        for interview in interviews

        if is_completed_interview(
            interview
        )

    ]

    if not completed:

        return {

            "average_score":

                0.0,

            "technical_average":

                0.0,

            "communication_average":

                0.0,

            "confidence_average":

                0.0,

            "relevance_average":

                0.0,

            "speech_average":

                0.0,

            "vision_average":

                0.0,

            "hiring_probability_average":

                0.0,

            "score_distribution": [

                {

                    "range":

                        "0-39",

                    "count":

                        0,

                },

                {

                    "range":

                        "40-59",

                    "count":

                        0,

                },

                {

                    "range":

                        "60-74",

                    "count":

                        0,

                },

                {

                    "range":

                        "75-89",

                    "count":

                        0,

                },

                {

                    "range":

                        "90-100",

                    "count":

                        0,

                },

            ],

        }

    overall_scores = [

        get_interview_score(
            interview
        )

        for interview in completed

    ]

    technical_scores = [

        clamp_score(
            get_object_attribute(
                interview,
                "technical_score",
                0,
            )
        )

        for interview in completed

    ]

    communication_scores = [

        clamp_score(
            get_object_attribute(
                interview,
                "communication_score",
                0,
            )
        )

        for interview in completed

    ]

    confidence_scores = [

        clamp_score(
            get_object_attribute(
                interview,
                "confidence_score",
                0,
            )
        )

        for interview in completed

    ]

    relevance_scores = [

        clamp_score(
            get_object_attribute(
                interview,
                "relevance_score",
                0,
            )
        )

        for interview in completed

    ]

    speech_scores = [

        clamp_score(
            get_object_attribute(
                interview,
                "speech_score",
                0,
            )
        )

        for interview in completed

    ]

    vision_scores = [

        clamp_score(
            get_object_attribute(
                interview,
                "vision_score",
                0,
            )
        )

        for interview in completed

    ]

    hiring_scores = [

        clamp_score(
            get_object_attribute(
                interview,
                "hiring_probability",
                0,
            )
        )

        for interview in completed

    ]

    score_buckets = {

        "0-39":

            0,

        "40-59":

            0,

        "60-74":

            0,

        "75-89":

            0,

        "90-100":

            0,

    }

    for score in overall_scores:

        if score < 40:

            score_buckets[
                "0-39"
            ] += 1

        elif score < 60:

            score_buckets[
                "40-59"
            ] += 1

        elif score < 75:

            score_buckets[
                "60-74"
            ] += 1

        elif score < 90:

            score_buckets[
                "75-89"
            ] += 1

        else:

            score_buckets[
                "90-100"
            ] += 1

    return {

        "average_score":

            calculate_average(
                overall_scores
            ),

        "technical_average":

            calculate_average(
                technical_scores
            ),

        "communication_average":

            calculate_average(
                communication_scores
            ),

        "confidence_average":

            calculate_average(
                confidence_scores
            ),

        "relevance_average":

            calculate_average(
                relevance_scores
            ),

        "speech_average":

            calculate_average(
                speech_scores
            ),

        "vision_average":

            calculate_average(
                vision_scores
            ),

        "hiring_probability_average":

            calculate_average(
                hiring_scores
            ),

        "score_distribution": [

            {

                "range":

                    score_range,

                "count":

                    count,

            }

            for score_range, count

            in score_buckets.items()

        ],

    }


# ============================================================
# PLATFORM INSIGHTS
# ============================================================

def build_platform_insights(
    users: list[User],
    interviews: list[InterviewSession],
) -> list[dict[str, Any]]:

    insights = []

    total_users = len(
        users
    )

    total_interviews = len(
        interviews
    )

    completed_interviews = len(

        [

            interview

            for interview in interviews

            if is_completed_interview(
                interview
            )

        ]

    )

    completion_rate = 0.0

    if total_interviews > 0:

        completion_rate = round(

            (
                completed_interviews
                / total_interviews
            )
            * 100,

            1,

        )

    performance = build_performance_analytics(
        interviews
    )

    role_distribution = build_role_distribution(
        interviews
    )

    if total_users == 0:

        insights.append({

            "type":

                "info",

            "title":

                "Platform Ready",

            "message":

                (
                    "The platform is online and ready "
                    "for candidate activity."
                ),

            "priority":

                "low",

        })

    elif total_interviews == 0:

        insights.append({

            "type":

                "warning",

            "title":

                "Low Interview Activity",

            "message":

                (
                    "Users have registered, but no interview "
                    "sessions have been completed yet."
                ),

            "priority":

                "medium",

        })

    else:

        insights.append({

            "type":

                "success",

            "title":

                "Interview Activity",

            "message":

                (
                    f"{completed_interviews} of "
                    f"{total_interviews} interview sessions "
                    f"have been completed."
                ),

            "priority":

                "low",

        })

    if completion_rate < 50 and total_interviews > 3:

        insights.append({

            "type":

                "warning",

            "title":

                "Completion Rate Needs Attention",

            "message":

                (
                    f"The interview completion rate is "
                    f"{completion_rate}%. Consider analyzing "
                    f"drop-off points in the interview flow."
                ),

            "priority":

                "high",

        })

    if performance[
        "technical_average"
    ] < 50 and completed_interviews > 0:

        insights.append({

            "type":

                "warning",

            "title":

                "Technical Performance Gap",

            "message":

                (
                    "Average technical performance is relatively "
                    "low across completed interviews."
                ),

            "priority":

                "medium",

        })

    if performance[
        "communication_average"
    ] < 50 and completed_interviews > 0:

        insights.append({

            "type":

                "info",

            "title":

                "Communication Opportunity",

            "message":

                (
                    "Candidates may benefit from more "
                    "communication-focused interview practice."
                ),

            "priority":

                "medium",

        })

    if role_distribution:

        top_role = role_distribution[0]

        insights.append({

            "type":

                "info",

            "title":

                "Most Popular Role",

            "message":

                (
                    f"{top_role['role']} is currently the "
                    f"most active interview role with "
                    f"{top_role['count']} sessions."
                ),

            "priority":

                "low",

        })

    return insights


# ============================================================
# PLATFORM HEALTH
# ============================================================

def build_platform_health(
    users: list[User],
    interviews: list[InterviewSession],
) -> dict[str, Any]:

    total_interviews = len(
        interviews
    )

    completed_interviews = len(

        [

            interview

            for interview in interviews

            if is_completed_interview(
                interview
            )

        ]

    )

    active_interviews = len(

        [

            interview

            for interview in interviews

            if is_active_interview(
                interview
            )

        ]

    )

    completion_rate = 100.0

    if total_interviews > 0:

        completion_rate = round(

            (
                completed_interviews
                / total_interviews
            )
            * 100,

            1,

        )

    database_status = "healthy"

    if users is None:

        database_status = "unknown"

    overall_status = "healthy"

    if completion_rate < 40 and total_interviews > 5:

        overall_status = "attention"

    return {

        "status":

            overall_status,

        "database":

            {

                "status":

                    database_status,

                "message":

                    "Database connection operational",

            },

        "api":

            {

                "status":

                    "healthy",

                "message":

                    "API responding normally",

            },

        "interviews":

            {

                "total":

                    total_interviews,

                "completed":

                    completed_interviews,

                "active":

                    active_interviews,

                "completion_rate":

                    completion_rate,

            },

        "users":

            {

                "total":

                    len(
                        users
                    ),

                "status":

                    "healthy",

            },

        "services": [

            {

                "name":

                    "Database",

                "status":

                    database_status,

            },

            {

                "name":

                    "Interview Engine",

                "status":

                    "healthy",

            },

            {

                "name":

                    "AI Services",

                "status":

                    "available",

            },

            {

                "name":

                    "Analytics Engine",

                "status":

                    "healthy",

            },

        ],

    }


# ============================================================
# PLATFORM ALERTS
# ============================================================

def build_platform_alerts(
    users: list[User],
    interviews: list[InterviewSession],
) -> list[dict[str, Any]]:

    alerts = []

    total_interviews = len(
        interviews
    )

    completed_interviews = len(

        [

            interview

            for interview in interviews

            if is_completed_interview(
                interview
            )

        ]

    )

    if len(users) == 0:

        alerts.append({

            "severity":

                "info",

            "title":

                "No users yet",

            "message":

                (
                    "The platform is operational but has no "
                    "registered users yet."
                ),

        })

    if total_interviews == 0 and len(users) > 0:

        alerts.append({

            "severity":

                "warning",

            "title":

                "No interview activity",

            "message":

                (
                    "Registered users exist, but no interview "
                    "sessions have been created."
                ),

        })

    if total_interviews > 5:

        completion_rate = round(

            (
                completed_interviews
                / total_interviews
            )
            * 100,

            1,

        )

        if completion_rate < 50:

            alerts.append({

                "severity":

                    "warning",

                "title":

                    "Low completion rate",

                "message":

                    (
                        f"Only {completion_rate}% of interview "
                        f"sessions are being completed."
                    ),

            })

    if not alerts:

        alerts.append({

            "severity":

                "success",

            "title":

                "No critical issues",

            "message":

                (
                    "Platform activity and core services "
                    "appear healthy."
                ),

        })

    return alerts


# ============================================================
# OVERVIEW BUILDER
# ============================================================

def build_admin_overview(
    users: list[User],
    interviews: list[InterviewSession],
) -> dict[str, Any]:

    now = datetime.now(
        timezone.utc
    )

    last_7_days = (

        now
        - timedelta(
            days=7
        )

    )

    previous_7_days = (

        now
        - timedelta(
            days=14
        )

    )

    total_users = len(
        users
    )

    total_interviews = len(
        interviews
    )

    completed_interviews = [

        interview

        for interview in interviews

        if is_completed_interview(
            interview
        )

    ]

    active_interviews = [

        interview

        for interview in interviews

        if is_active_interview(
            interview
        )

    ]

    current_users = [

        user

        for user in users

        if (

            parse_datetime(
                get_object_attribute(
                    user,
                    "created_at",
                )
            )

            and

            parse_datetime(
                get_object_attribute(
                    user,
                    "created_at",
                )
            ) >= last_7_days

        )

    ]

    previous_users = [

        user

        for user in users

        if (

            parse_datetime(
                get_object_attribute(
                    user,
                    "created_at",
                )
            )

            and

            previous_7_days
            <=
            parse_datetime(
                get_object_attribute(
                    user,
                    "created_at",
                )
            )
            < last_7_days

        )

    ]

    current_interviews = [

        interview

        for interview in interviews

        if (

            parse_datetime(
                get_object_attribute(
                    interview,
                    "created_at",
                )
            )

            and

            parse_datetime(
                get_object_attribute(
                    interview,
                    "created_at",
                )
            ) >= last_7_days

        )

    ]

    previous_interviews = [

        interview

        for interview in interviews

        if (

            parse_datetime(
                get_object_attribute(
                    interview,
                    "created_at",
                )
            )

            and

            previous_7_days
            <=
            parse_datetime(
                get_object_attribute(
                    interview,
                    "created_at",
                )
            )
            < last_7_days

        )

    ]

    completed_scores = [

        get_interview_score(
            interview
        )

        for interview in completed_interviews

        if get_interview_score(
            interview
        ) > 0

    ]

    average_score = calculate_average(
        completed_scores
    )

    completion_rate = 0.0

    if total_interviews > 0:

        completion_rate = round(

            (
                len(
                    completed_interviews
                )
                / total_interviews
            )
            * 100,

            1,

        )

    user_growth = calculate_percentage_change(

        len(
            current_users
        ),

        len(
            previous_users
        ),

    )

    interview_growth = calculate_percentage_change(

        len(
            current_interviews
        ),

        len(
            previous_interviews
        ),

    )

    return {

        "total_users":

            total_users,

        "total_interviews":

            total_interviews,

        "completed_interviews":

            len(
                completed_interviews
            ),

        "active_interviews":

            len(
                active_interviews
            ),

        "average_score":

            average_score,

        "completion_rate":

            completion_rate,

        "user_growth":

            user_growth,

        "interview_growth":

            interview_growth,

        "growth": {

            "users":

                user_growth,

            "interviews":

                interview_growth,

        },

        "cards": [

            {

                "label":

                    "Total Users",

                "value":

                    total_users,

                "change":

                    format_growth_label(
                        user_growth
                    ),

            },

            {

                "label":

                    "Total Interviews",

                "value":

                    total_interviews,

                "change":

                    format_growth_label(
                        interview_growth
                    ),

            },

            {

                "label":

                    "Completed",

                "value":

                    len(
                        completed_interviews
                    ),

                "change":

                    f"{completion_rate}%",

            },

            {

                "label":

                    "Average Score",

                "value":

                    average_score,

                "change":

                    "Platform Average",

            },

        ],

    }


# ============================================================
# FULL DASHBOARD BUILDER
# ============================================================

def build_full_admin_dashboard(
    db: Session,
) -> dict[str, Any]:

    users = get_all_users(
        db
    )

    interviews = get_all_interviews(
        db
    )

    users_map = {

        safe_int(
            get_object_attribute(
                user,
                "id",
                0,
            )
        ):

        user

        for user in users

    }

    interviews_by_user = defaultdict(
        list
    )

    for interview in interviews:

        user_id = safe_int(
            get_object_attribute(
                interview,
                "user_id",
                0,
            )
        )

        interviews_by_user[
            user_id
        ].append(
            interview
        )

    overview = build_admin_overview(

        users,

        interviews,

    )

    performance = build_performance_analytics(
        interviews
    )

    role_distribution = build_role_distribution(
        interviews
    )

    interview_types = build_interview_type_distribution(
        interviews
    )

    recent_users = [

        serialize_user(

            user,

            interviews_by_user,

        )

        for user in users[:10]

    ]

    recent_interviews = [

        serialize_interview(

            interview,

            users_map,

        )

        for interview in interviews[:10]

    ]

    activity = build_recent_activity(

        interviews,

        users_map,

        limit=15,

    )

    platform_health = build_platform_health(

        users,

        interviews,

    )

    alerts = build_platform_alerts(

        users,

        interviews,

    )

    insights = build_platform_insights(

        users,

        interviews,

    )

    return {

        "status":

            "success",

        "generated_at":

            datetime.now(
                timezone.utc
            ).isoformat(),

        "overview":

            overview,

        "platform_overview":

            overview,

        "stats":

            overview,

        "performance":

            performance,

        "performance_analytics":

            performance,

        "role_distribution":

            role_distribution,

        "interview_type_distribution":

            interview_types,

        "user_growth":

            build_monthly_user_growth(
                users,
                months=6,
            ),

        "interview_activity":

            build_daily_interview_trend(
                interviews,
                days=7,
            ),

        "recent_users":

            recent_users,

        "recent_interviews":

            recent_interviews,

        "recent_activity":

            activity,

        "platform_health":

            platform_health,

        "health":

            platform_health,

        "alerts":

            alerts,

        "insights":

            insights,

        "system_alerts":

            alerts,

    }


# ============================================================
# ADMIN DASHBOARD
# ============================================================

@router.get(
    "/dashboard"
)
def get_admin_dashboard(
    db: Session = Depends(
        get_db
    ),
):

    try:

        return build_full_admin_dashboard(
            db
        )

    except Exception as error:

        print(
            "Admin Dashboard Error:",
            str(error),
        )

        raise HTTPException(

            status_code=500,

            detail=(
                "Failed to generate "
                "admin dashboard."
            ),

        )


# ============================================================
# ADMIN OVERVIEW
# ============================================================

@router.get(
    "/overview"
)
def get_admin_overview(
    db: Session = Depends(
        get_db
    ),
):

    try:

        users = get_all_users(
            db
        )

        interviews = get_all_interviews(
            db
        )

        overview = build_admin_overview(

            users,

            interviews,

        )

        return {

            "status":

                "success",

            **overview,

        }

    except Exception as error:

        print(
            "Admin Overview Error:",
            str(error),
        )

        raise HTTPException(

            status_code=500,

            detail=(
                "Failed to generate "
                "platform overview."
            ),

        )


# ============================================================
# ADMIN USERS
# ============================================================

@router.get(
    "/users"
)
def get_admin_users(
    limit: int = Query(
        default=50,
        ge=1,
        le=500,
    ),

    db: Session = Depends(
        get_db
    ),
):

    try:

        users = get_all_users(
            db
        )

        interviews = get_all_interviews(
            db
        )

        interviews_by_user = defaultdict(
            list
        )

        for interview in interviews:

            user_id = safe_int(
                get_object_attribute(
                    interview,
                    "user_id",
                    0,
                )
            )

            interviews_by_user[
                user_id
            ].append(
                interview
            )

        serialized_users = [

            serialize_user(

                user,

                interviews_by_user,

            )

            for user in users[:limit]

        ]

        return {

            "status":

                "success",

            "total":

                len(
                    users
                ),

            "users":

                serialized_users,

        }

    except Exception as error:

        print(
            "Admin Users Error:",
            str(error),
        )

        raise HTTPException(

            status_code=500,

            detail=(
                "Failed to retrieve "
                "platform users."
            ),

        )


# ============================================================
# ADMIN INTERVIEWS
# ============================================================

@router.get(
    "/interviews"
)
def get_admin_interviews(
    limit: int = Query(
        default=50,
        ge=1,
        le=500,
    ),

    db: Session = Depends(
        get_db
    ),
):

    try:

        users = get_all_users(
            db
        )

        interviews = get_all_interviews(
            db
        )

        users_map = {

            safe_int(
                get_object_attribute(
                    user,
                    "id",
                    0,
                )
            ):

            user

            for user in users

        }

        serialized_interviews = [

            serialize_interview(

                interview,

                users_map,

            )

            for interview in interviews[:limit]

        ]

        return {

            "status":

                "success",

            "total":

                len(
                    interviews
                ),

            "interviews":

                serialized_interviews,

        }

    except Exception as error:

        print(
            "Admin Interviews Error:",
            str(error),
        )

        raise HTTPException(

            status_code=500,

            detail=(
                "Failed to retrieve "
                "platform interviews."
            ),

        )


# ============================================================
# ADMIN ANALYTICS
# ============================================================

@router.get(
    "/analytics"
)
def get_admin_analytics(
    db: Session = Depends(
        get_db
    ),
):

    try:

        users = get_all_users(
            db
        )

        interviews = get_all_interviews(
            db
        )

        performance = build_performance_analytics(
            interviews
        )

        return {

            "status":

                "success",

            "overview":

                build_admin_overview(
                    users,
                    interviews,
                ),

            "performance":

                performance,

            "performance_analytics":

                performance,

            "role_distribution":

                build_role_distribution(
                    interviews
                ),

            "interview_type_distribution":

                build_interview_type_distribution(
                    interviews
                ),

            "user_growth":

                build_monthly_user_growth(
                    users,
                    months=6,
                ),

            "interview_activity":

                build_daily_interview_trend(
                    interviews,
                    days=7,
                ),

        }

    except Exception as error:

        print(
            "Admin Analytics Error:",
            str(error),
        )

        raise HTTPException(

            status_code=500,

            detail=(
                "Failed to generate "
                "platform analytics."
            ),

        )


# ============================================================
# ADMIN ACTIVITY
# ============================================================

@router.get(
    "/activity"
)
def get_admin_activity(
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),

    db: Session = Depends(
        get_db
    ),
):

    try:

        users = get_all_users(
            db
        )

        interviews = get_all_interviews(
            db
        )

        users_map = {

            safe_int(
                get_object_attribute(
                    user,
                    "id",
                    0,
                )
            ):

            user

            for user in users

        }

        activity = build_recent_activity(

            interviews,

            users_map,

            limit=limit,

        )

        return {

            "status":

                "success",

            "total":

                len(
                    activity
                ),

            "activity":

                activity,

            "recent_activity":

                activity,

        }

    except Exception as error:

        print(
            "Admin Activity Error:",
            str(error),
        )

        raise HTTPException(

            status_code=500,

            detail=(
                "Failed to retrieve "
                "platform activity."
            ),

        )


# ============================================================
# ADMIN PLATFORM HEALTH
# ============================================================

@router.get(
    "/health"
)
def get_admin_health(
    db: Session = Depends(
        get_db
    ),
):

    try:

        users = get_all_users(
            db
        )

        interviews = get_all_interviews(
            db
        )

        return build_platform_health(

            users,

            interviews,

        )

    except Exception as error:

        print(
            "Admin Health Error:",
            str(error),
        )

        raise HTTPException(

            status_code=500,

            detail=(
                "Failed to retrieve "
                "platform health."
            ),

        )


# ============================================================
# ADMIN ALERTS
# ============================================================

@router.get(
    "/alerts"
)
def get_admin_alerts(
    db: Session = Depends(
        get_db
    ),
):

    try:

        users = get_all_users(
            db
        )

        interviews = get_all_interviews(
            db
        )

        alerts = build_platform_alerts(

            users,

            interviews,

        )

        return {

            "status":

                "success",

            "alerts":

                alerts,

            "system_alerts":

                alerts,

        }

    except Exception as error:

        print(
            "Admin Alerts Error:",
            str(error),
        )

        raise HTTPException(

            status_code=500,

            detail=(
                "Failed to retrieve "
                "platform alerts."
            ),

        )


# ============================================================
# ADMIN INSIGHTS
# ============================================================

@router.get(
    "/insights"
)
def get_admin_insights(
    db: Session = Depends(
        get_db
    ),
):

    try:

        users = get_all_users(
            db
        )

        interviews = get_all_interviews(
            db
        )

        insights = build_platform_insights(

            users,

            interviews,

        )

        return {

            "status":

                "success",

            "insights":

                insights,

        }

    except Exception as error:

        print(
            "Admin Insights Error:",
            str(error),
        )

        raise HTTPException(

            status_code=500,

            detail=(
                "Failed to generate "
                "platform insights."
            ),

        )


# ============================================================
# ADMIN FULL PLATFORM INTELLIGENCE
# ============================================================

@router.get(
    "/platform"
)
def get_platform_intelligence(
    db: Session = Depends(
        get_db
    ),
):

    try:

        return build_full_admin_dashboard(
            db
        )

    except Exception as error:

        print(
            "Platform Intelligence Error:",
            str(error),
        )

        raise HTTPException(

            status_code=500,

            detail=(
                "Failed to generate "
                "platform intelligence."
            ),

        )


# ============================================================
# ADMIN REFRESH
# ============================================================

@router.get(
    "/refresh"
)
def refresh_admin_data(
    db: Session = Depends(
        get_db
    ),
):

    try:

        dashboard = build_full_admin_dashboard(
            db
        )

        return {

            "status":

                "success",

            "message":

                "Admin platform intelligence refreshed.",

            "data":

                dashboard,

        }

    except Exception as error:

        print(
            "Admin Refresh Error:",
            str(error),
        )

        raise HTTPException(

            status_code=500,

            detail=(
                "Failed to refresh "
                "platform intelligence."
            ),

        )