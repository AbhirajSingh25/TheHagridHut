from __future__ import annotations

import json

from collections import Counter
from datetime import datetime, timezone
from typing import Any

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import (
    get_current_admin_user,
    get_current_active_user,
)
from app.models import (
    InterviewSession,
    User,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    tags=["Recruiter Intelligence"],
)


# ============================================================
# SCORE CONSTANTS
# ============================================================

STRONG_HIRE_THRESHOLD = 85
HIRE_THRESHOLD = 70
CONSIDER_THRESHOLD = 50


# ============================================================
# HELPERS
# ============================================================

def safe_float(
    value: Any,
    default: float = 0.0,
) -> float:
    """
    Safely convert a value to float.
    """

    if value is None:
        return default

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


def safe_int(
    value: Any,
    default: int = 0,
) -> int:
    """
    Safely convert a value to integer.
    """

    return int(
        round(
            safe_float(
                value,
                float(default),
            )
        )
    )


def clamp_score(
    value: Any,
) -> int:
    """
    Normalize any score into the 0-100 range.
    """

    score = safe_int(
        value,
        0,
    )

    return max(
        0,
        min(
            100,
            score,
        ),
    )


def safe_string(
    value: Any,
    default: str = "",
) -> str:
    """
    Return a safe non-empty string.
    """

    if value is None:
        return default

    text = str(
        value
    ).strip()

    return (
        text
        if text
        else default
    )


def parse_json_value(
    value: Any,
    default: Any,
) -> Any:
    """
    Parse JSON values from either:
        - PostgreSQL JSON/JSONB
        - Python dict/list
        - legacy JSON strings
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


def get_model_value(
    session: InterviewSession,
    field_name: str,
    default: Any = None,
) -> Any:
    """
    Safely access model fields.

    Supports schema consolidation where some older
    InterviewSession versions may not yet contain every field.
    """

    return getattr(
        session,
        field_name,
        default,
    )


def get_final_report(
    session: InterviewSession,
) -> dict[str, Any]:
    """
    Return normalized final_report data.
    """

    report = parse_json_value(

        get_model_value(
            session,
            "final_report",
            None,
        ),

        {},
    )

    return (
        report
        if isinstance(
            report,
            dict,
        )
        else {}
    )


def get_evaluations(
    session: InterviewSession,
) -> list[dict[str, Any]]:
    """
    Return normalized answer evaluations.
    """

    evaluations = parse_json_value(

        get_model_value(
            session,
            "evaluations",
            None,
        ),

        [],
    )

    if not isinstance(
        evaluations,
        list,
    ):
        return []

    return [

        item

        for item in evaluations

        if isinstance(
            item,
            dict,
        )

    ]


def get_first_valid_score(
    *values: Any,
) -> int:
    """
    Return the first score greater than zero.
    """

    for value in values:

        score = clamp_score(
            value
        )

        if score > 0:
            return score

    return 0


def get_average(
    values: list[float],
) -> int:
    """
    Calculate the average of valid scores.
    """

    valid_values = [

        safe_float(
            value
        )

        for value in values

        if safe_float(
            value
        ) > 0

    ]

    if not valid_values:
        return 0

    return clamp_score(

        sum(
            valid_values
        )

        /

        len(
            valid_values
        )

    )


def get_evaluation_average(
    session: InterviewSession,
    *keys: str,
) -> int:
    """
    Calculate a metric average from answer-level evaluations.
    """

    evaluations = get_evaluations(
        session
    )

    values: list[float] = []

    for evaluation in evaluations:

        for key in keys:

            if key not in evaluation:
                continue

            score = safe_float(
                evaluation.get(
                    key
                )
            )

            if score > 0:

                values.append(
                    score
                )

                break

    return get_average(
        values
    )


# ============================================================
# SCORE EXTRACTION
# ============================================================

def calculate_technical_score(
    session: InterviewSession,
) -> int:

    report = get_final_report(
        session
    )

    return get_first_valid_score(

        get_model_value(
            session,
            "technical_score",
            0,
        ),

        report.get(
            "technical_score"
        ),

        report.get(
            "technical"
        ),

        get_evaluation_average(

            session,

            "technical_score",

            "technical",

        ),

    )


def calculate_communication_score(
    session: InterviewSession,
) -> int:

    report = get_final_report(
        session
    )

    return get_first_valid_score(

        get_model_value(
            session,
            "communication_score",
            0,
        ),

        report.get(
            "communication_score"
        ),

        report.get(
            "communication"
        ),

        get_evaluation_average(

            session,

            "communication_score",

            "communication",

        ),

    )


def calculate_confidence_score(
    session: InterviewSession,
) -> int:

    report = get_final_report(
        session
    )

    return get_first_valid_score(

        get_model_value(
            session,
            "confidence_score",
            0,
        ),

        report.get(
            "confidence_score"
        ),

        report.get(
            "confidence"
        ),

        get_evaluation_average(

            session,

            "confidence_score",

            "confidence",

        ),

    )


def calculate_relevance_score(
    session: InterviewSession,
) -> int:

    report = get_final_report(
        session
    )

    return get_first_valid_score(

        get_model_value(
            session,
            "relevance_score",
            0,
        ),

        report.get(
            "relevance_score"
        ),

        report.get(
            "relevance"
        ),

        get_evaluation_average(

            session,

            "relevance_score",

            "relevance",

        ),

    )


def calculate_resume_score(
    session: InterviewSession,
) -> int:

    report = get_final_report(
        session
    )

    return get_first_valid_score(

        get_model_value(
            session,
            "resume_score",
            0,
        ),

        report.get(
            "resume_score"
        ),

    )


def calculate_jd_match_score(
    session: InterviewSession,
) -> int:

    report = get_final_report(
        session
    )

    return get_first_valid_score(

        get_model_value(
            session,
            "jd_match_score",
            0,
        ),

        report.get(
            "jd_match_score"
        ),

        report.get(
            "jd_match"
        ),

    )


def calculate_candidate_score(
    session: InterviewSession,
) -> int:
    """
    Determine the primary candidate score.

    Priority:
        1. Stored candidate_score
        2. Stored overall_score
        3. final_report score
        4. Calculated interview metric average
    """

    report = get_final_report(
        session
    )

    stored_score = get_first_valid_score(

        get_model_value(
            session,
            "candidate_score",
            0,
        ),

        get_model_value(
            session,
            "overall_score",
            0,
        ),

        report.get(
            "candidate_score"
        ),

        report.get(
            "overall_score"
        ),

        report.get(
            "score"
        ),

    )

    if stored_score > 0:
        return stored_score

    scores = [

        calculate_technical_score(
            session
        ),

        calculate_communication_score(
            session
        ),

        calculate_confidence_score(
            session
        ),

        calculate_relevance_score(
            session
        ),

    ]

    valid_scores = [

        score

        for score in scores

        if score > 0

    ]

    if not valid_scores:
        return 0

    return get_average(
        valid_scores
    )


def calculate_hiring_probability(
    session: InterviewSession,
) -> int:
    """
    Return stored hiring probability when available.

    Otherwise calculate a weighted candidate score.
    """

    report = get_final_report(
        session
    )

    stored_probability = get_first_valid_score(

        get_model_value(
            session,
            "hiring_probability",
            0,
        ),

        report.get(
            "hiring_probability"
        ),

    )

    if stored_probability > 0:
        return stored_probability

    candidate_score = calculate_candidate_score(
        session
    )

    resume_score = calculate_resume_score(
        session
    )

    jd_match_score = calculate_jd_match_score(
        session
    )

    if (
        candidate_score == 0
        and resume_score == 0
        and jd_match_score == 0
    ):
        return 0

    weighted_total = 0.0
    total_weight = 0.0

    if candidate_score > 0:

        weighted_total += (
            candidate_score
            * 0.65
        )

        total_weight += 0.65

    if resume_score > 0:

        weighted_total += (
            resume_score
            * 0.15
        )

        total_weight += 0.15

    if jd_match_score > 0:

        weighted_total += (
            jd_match_score
            * 0.20
        )

        total_weight += 0.20

    if total_weight == 0:
        return 0

    return clamp_score(

        weighted_total
        /
        total_weight

    )


# ============================================================
# CANDIDATE STATUS
# ============================================================

def get_candidate_status(
    session: InterviewSession,
) -> str:

    status = safe_string(

        get_model_value(
            session,
            "status",
            "",
        )

    ).lower()

    if status:
        return status

    report = get_final_report(
        session
    )

    if (

        report.get(
            "_type"
        )
        == "session_progress"

    ):

        if report.get(
            "is_paused"
        ):

            return "paused"

        return safe_string(

            report.get(
                "status"
            ),

            "in_progress",

        ).lower()

    completed_at = get_model_value(

        session,

        "completed_at",

        None,

    )

    if completed_at:
        return "completed"

    return "completed"


def get_recruiter_recommendation(
    session: InterviewSession,
) -> str:

    report = get_final_report(
        session
    )

    recommendation = safe_string(

        get_model_value(
            session,
            "recruiter_recommendation",
            "",
        )

    )

    if recommendation:
        return recommendation

    report_recommendation = safe_string(

        report.get(
            "recruiter_recommendation"
        )

        or

        report.get(
            "recommendation"
        ),

        "",

    )

    if report_recommendation:
        return report_recommendation

    probability = calculate_hiring_probability(
        session
    )

    if probability >= STRONG_HIRE_THRESHOLD:
        return "Strong Hire"

    if probability >= HIRE_THRESHOLD:
        return "Hire"

    if probability >= CONSIDER_THRESHOLD:
        return "Consider"

    return "No Hire"


# ============================================================
# QUALITATIVE DATA
# ============================================================

def get_string_list(
    value: Any,
) -> list[str]:

    parsed = parse_json_value(
        value,
        [],
    )

    if isinstance(
        parsed,
        list,
    ):

        return [

            safe_string(
                item
            )

            for item in parsed

            if safe_string(
                item
            )

        ]

    return []


def get_candidate_strengths(
    session: InterviewSession,
) -> list[str]:

    report = get_final_report(
        session
    )

    strengths = get_string_list(

        get_model_value(
            session,
            "strengths",
            None,
        )

    )

    if strengths:
        return strengths

    strengths = get_string_list(

        report.get(
            "strengths"
        )

    )

    return strengths


def get_improvement_areas(
    session: InterviewSession,
) -> list[str]:

    report = get_final_report(
        session
    )

    improvements = get_string_list(

        get_model_value(
            session,
            "improvement_areas",
            None,
        )

    )

    if improvements:
        return improvements

    improvements = get_string_list(

        report.get(
            "improvement_areas"
        )

    )

    return improvements


# ============================================================
# SERIALIZATION
# ============================================================

def serialize_datetime(
    value: Any,
) -> str | None:

    if value is None:
        return None

    if isinstance(
        value,
        datetime,
    ):
        return value.isoformat()

    return str(
        value
    )


def get_interview_type(
    session: InterviewSession,
) -> str:

    return safe_string(

        get_model_value(
            session,
            "interview_type",
            None,
        ),

        "Technical",

    )


def get_user_name(
    user: User | None,
) -> str:

    if user is None:
        return "Candidate"

    for field_name in [

        "full_name",

        "name",

        "username",

    ]:

        value = safe_string(

            getattr(
                user,
                field_name,
                "",
            )

        )

        if value:
            return value

    return "Candidate"


def get_user_email(
    user: User | None,
) -> str:

    if user is None:
        return ""

    return safe_string(

        getattr(
            user,
            "email",
            "",
        )

    )


def serialize_candidate(
    session: InterviewSession,
    user: User | None = None,
) -> dict[str, Any]:

    technical_score = calculate_technical_score(
        session
    )

    communication_score = calculate_communication_score(
        session
    )

    confidence_score = calculate_confidence_score(
        session
    )

    relevance_score = calculate_relevance_score(
        session
    )

    resume_score = calculate_resume_score(
        session
    )

    jd_match_score = calculate_jd_match_score(
        session
    )

    candidate_score = calculate_candidate_score(
        session
    )

    hiring_probability = calculate_hiring_probability(
        session
    )

    recommendation = get_recruiter_recommendation(
        session
    )

    return {

        "id":
            get_model_value(
                session,
                "id",
                None,
            ),

        "session_id":
            get_model_value(
                session,
                "id",
                None,
            ),

        "user_id":
            get_model_value(
                session,
                "user_id",
                None,
            ),

        "candidate_name":
            get_user_name(
                user
            ),

        "name":
            get_user_name(
                user
            ),

        "email":
            get_user_email(
                user
            ),

        "role":
            safe_string(

                get_model_value(
                    session,
                    "role",
                    None,
                ),

                "Mock Interview",

            ),

        "level":
            safe_string(

                get_model_value(
                    session,
                    "level",
                    None,
                ),

                "General",

            ),

        "interview_type":
            get_interview_type(
                session
            ),

        "status":
            get_candidate_status(
                session
            ),

        "candidate_score":
            candidate_score,

        "score":
            candidate_score,

        "overall_score":
            candidate_score,

        "technical":
            technical_score,

        "technical_score":
            technical_score,

        "communication":
            communication_score,

        "communication_score":
            communication_score,

        "confidence":
            confidence_score,

        "confidence_score":
            confidence_score,

        "relevance":
            relevance_score,

        "relevance_score":
            relevance_score,

        "resume_score":
            resume_score,

        "jd_match_score":
            jd_match_score,

        "hiring_probability":
            hiring_probability,

        "recommendation":
            recommendation,

        "recruiter_recommendation":
            recommendation,

        "strengths":
            get_candidate_strengths(
                session
            ),

        "improvement_areas":
            get_improvement_areas(
                session
            ),

        "recruiter_notes":
            safe_string(

                get_model_value(
                    session,
                    "recruiter_notes",
                    "",
                )

            ),

        "expected_salary":

            get_model_value(
                session,
                "expected_salary",
                None,
            ),

        "created_at":
            serialize_datetime(

                get_model_value(
                    session,
                    "created_at",
                    None,
                )

            ),

        "completed_at":
            serialize_datetime(

                get_model_value(
                    session,
                    "completed_at",
                    None,
                )

            ),

    }


# ============================================================
# DATA COLLECTION
# ============================================================

def get_all_sessions(
    db: Session,
) -> list[InterviewSession]:

    return (

        db.query(
            InterviewSession
        )

        .order_by(
            InterviewSession.created_at.desc(),
            InterviewSession.id.desc(),
        )

        .all()

    )


def get_candidate_users(
    db: Session,
    sessions: list[InterviewSession],
) -> dict[int, User]:

    user_ids = list({

        session.user_id

        for session in sessions

        if getattr(
            session,
            "user_id",
            None,
        )

    })

    if not user_ids:
        return {}

    users = (

        db.query(
            User
        )

        .filter(
            User.id.in_(
                user_ids
            )
        )

        .all()

    )

    return {

        user.id: user

        for user in users

    }


def build_candidates(
    db: Session,
    sessions: list[InterviewSession],
) -> list[dict[str, Any]]:

    users = get_candidate_users(
        db,
        sessions,
    )

    return [

        serialize_candidate(

            session,

            users.get(
                session.user_id
            ),

        )

        for session in sessions

    ]


def calculate_average(
    values: list[float],
) -> int:

    return get_average(
        values
    )


def build_recruiter_summary(
    candidates: list[dict[str, Any]],
) -> dict[str, Any]:

    total_candidates = len(
        candidates
    )

    completed_candidates = [

        candidate

        for candidate in candidates

        if candidate[
            "status"
        ].lower()

        == "completed"

    ]

    active_candidates = [

        candidate

        for candidate in candidates

        if candidate[
            "status"
        ].lower()

        in [

            "active",

            "in_progress",

            "started",

            "paused",

        ]

    ]

    candidate_scores = [

        candidate[
            "candidate_score"
        ]

        for candidate in candidates

    ]

    technical_scores = [

        candidate[
            "technical_score"
        ]

        for candidate in candidates

    ]

    communication_scores = [

        candidate[
            "communication_score"
        ]

        for candidate in candidates

    ]

    confidence_scores = [

        candidate[
            "confidence_score"
        ]

        for candidate in candidates

    ]

    hiring_candidates = [

        candidate

        for candidate in candidates

        if candidate[
            "hiring_probability"
        ]

        >= HIRE_THRESHOLD

    ]

    return {

        "total_candidates":
            total_candidates,

        "total_interviews":
            total_candidates,

        "completed_interviews":
            len(
                completed_candidates
            ),

        "completed_candidates":
            len(
                completed_candidates
            ),

        "active_interviews":
            len(
                active_candidates
            ),

        "active_candidates":
            len(
                active_candidates
            ),

        "average_score":
            calculate_average(
                candidate_scores
            ),

        "average_candidate_score":
            calculate_average(
                candidate_scores
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

        "hiring_probability":
            calculate_average(

                [

                    candidate[
                        "hiring_probability"
                    ]

                    for candidate

                    in candidates

                ]

            ),

        "strong_candidates":
            len(
                hiring_candidates
            ),

        "top_candidates":

            sorted(

                candidates,

                key=lambda candidate:

                    (

                        candidate[
                            "candidate_score"
                        ],

                        candidate[
                            "hiring_probability"
                        ],

                    ),

                reverse=True,

            )[:10],

        "recent_candidates":
            candidates[:10],

        "candidate_score_distribution": {

            "excellent":

                len(

                    [

                        candidate

                        for candidate

                        in candidates

                        if candidate[
                            "candidate_score"
                        ]

                        >= STRONG_HIRE_THRESHOLD

                    ]

                ),

            "good":

                len(

                    [

                        candidate

                        for candidate

                        in candidates

                        if HIRE_THRESHOLD
                        <= candidate[
                            "candidate_score"
                        ]
                        < STRONG_HIRE_THRESHOLD

                    ]

                ),

            "average":

                len(

                    [

                        candidate

                        for candidate

                        in candidates

                        if CONSIDER_THRESHOLD
                        <= candidate[
                            "candidate_score"
                        ]
                        < HIRE_THRESHOLD

                    ]

                ),

            "needs_improvement":

                len(

                    [

                        candidate

                        for candidate

                        in candidates

                        if candidate[
                            "candidate_score"
                        ]
                        < CONSIDER_THRESHOLD

                    ]

                ),

        },

    }


# ============================================================
# RECRUITER HEALTH
#
# GET /api/recruiter/health
# ============================================================

@router.get(
    "/recruiter/health"
)
def recruiter_health(

    db: Session = Depends(
        get_db
    ),

):

    try:

        total_interviews = (

            db.query(
                InterviewSession
            )

            .count()

        )

        return {

            "status":
                "healthy",

            "service":
                "Recruiter Intelligence",

            "database":
                "connected",

            "total_interviews":
                total_interviews,

            "endpoints": {

                "dashboard":
                    "/api/recruiter-dashboard",

                "insights":
                    "/api/recruiter-insights",

                "summary":
                    "/api/recruiter/summary",

                "candidates":
                    "/api/recruiter/candidates",

                "analytics":
                    "/api/recruiter/analytics",

                "health":
                    "/api/recruiter/health",

            },

        }

    except Exception as error:

        raise HTTPException(

            status_code=500,

            detail=(

                "Recruiter Intelligence health check failed: "

                f"{str(error)}"

            ),

        ) from error


# ============================================================
# RECRUITER DASHBOARD
#
# GET /api/recruiter-dashboard
# ============================================================

@router.get(
    "/recruiter-dashboard"
)
def recruiter_dashboard(

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_active_user
    ),

):

    try:

        sessions = get_all_sessions(
            db
        )

        candidates = build_candidates(
            db,
            sessions,
        )

        response = build_recruiter_summary(
            candidates
        )

        response.update({

            "generated_at":

                datetime.now(
                    timezone.utc
                ).isoformat(),

            "viewer_id":
                current_user.id,

        })

        return response

    except Exception as error:

        print(

            "Recruiter Dashboard Error:",

            str(
                error
            ),

        )

        raise HTTPException(

            status_code=500,

            detail=(
                "Failed to generate recruiter dashboard."
            ),

        ) from error


# ============================================================
# RECRUITER INSIGHTS
#
# GET /api/recruiter-insights
# ============================================================

@router.get(
    "/recruiter-insights"
)
def recruiter_insights(

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_active_user
    ),

):

    try:

        sessions = get_all_sessions(
            db
        )

        candidates = build_candidates(
            db,
            sessions,
        )

        total_interviews = len(
            candidates
        )

        average_score = calculate_average(

            [

                candidate[
                    "candidate_score"
                ]

                for candidate

                in candidates

            ]

        )

        technical_average = calculate_average(

            [

                candidate[
                    "technical_score"
                ]

                for candidate

                in candidates

            ]

        )

        communication_average = calculate_average(

            [

                candidate[
                    "communication_score"
                ]

                for candidate

                in candidates

            ]

        )

        confidence_average = calculate_average(

            [

                candidate[
                    "confidence_score"
                ]

                for candidate

                in candidates

            ]

        )

        role_counter = Counter(

            candidate[
                "role"
            ]

            for candidate

            in candidates

            if candidate[
                "role"
            ]

        )

        strengths_counter = Counter()

        improvements_counter = Counter()

        for candidate in candidates:

            for strength in candidate[
                "strengths"
            ]:

                strengths_counter[
                    strength
                ] += 1

            for improvement in candidate[
                "improvement_areas"
            ]:

                improvements_counter[
                    improvement
                ] += 1

        metric_scores = {

            "Technical":
                technical_average,

            "Communication":
                communication_average,

            "Confidence":
                confidence_average,

        }

        non_zero_metrics = {

            name: score

            for name, score

            in metric_scores.items()

            if score > 0

        }

        strongest_area = (

            max(

                non_zero_metrics,

                key=non_zero_metrics.get,

            )

            if non_zero_metrics

            else None

        )

        weakest_area = (

            min(

                non_zero_metrics,

                key=non_zero_metrics.get,

            )

            if non_zero_metrics

            else None

        )

        improvements: list[str] = []

        if weakest_area:

            improvements.append(
                weakest_area
            )

        if (
            technical_average > 0
            and technical_average < 60
        ):

            improvements.append(
                "Technical"
            )

        if (
            communication_average > 0
            and communication_average < 60
        ):

            improvements.append(
                "Communication"
            )

        if (
            confidence_average > 0
            and confidence_average < 60
        ):

            improvements.append(
                "Confidence"
            )

        improvements = list(

            dict.fromkeys(
                improvements
            )

        )

        technical_text = (

            f"Average technical performance is "

            f"{technical_average}%."

        )

        communication_text = (

            f"Average communication performance is "

            f"{communication_average}%."

        )

        confidence_text = (

            f"Average confidence performance is "

            f"{confidence_average}%."

        )

        if total_interviews == 0:

            recommendation = (

                "No interview data is available yet. "

                "Conduct and complete interviews to generate "

                "meaningful recruiter intelligence."

            )

        elif average_score >= 80:

            recommendation = (

                "Candidate performance is strong overall. "

                "Prioritize high-scoring candidates and validate "

                "role-specific depth during final evaluation."

            )

        elif average_score >= 60:

            recommendation = (

                "Overall candidate performance is moderate. "

                "Prioritize targeted interview practice and "

                "role-specific technical improvement."

            )

        else:

            recommendation = (

                "Candidate performance requires significant "

                "improvement. Focus on technical fundamentals, "

                "communication quality, and interview confidence."

            )

        return {

            "technical":
                technical_text,

            "communication":
                communication_text,

            "confidence":
                confidence_text,

            "recommendation":
                recommendation,

            "average_score":
                average_score,

            "candidate_score":
                average_score,

            "hiring_probability":

                calculate_average(

                    [

                        candidate[
                            "hiring_probability"
                        ]

                        for candidate

                        in candidates

                    ]

                ),

            "technical_average":
                technical_average,

            "communication_average":
                communication_average,

            "confidence_average":
                confidence_average,

            "strongest_area":
                strongest_area,

            "weakest_area":
                weakest_area,

            "improvements":
                improvements,

            "top_strengths":

                [

                    {

                        "name":
                            name,

                        "count":
                            count,

                    }

                    for name, count

                    in strengths_counter.most_common(
                        10
                    )

                ],

            "common_improvements":

                [

                    {

                        "name":
                            name,

                        "count":
                            count,

                    }

                    for name, count

                    in improvements_counter.most_common(
                        10
                    )

                ],

            "role_distribution":

                [

                    {

                        "role":
                            role,

                        "count":
                            count,

                    }

                    for role, count

                    in role_counter.most_common(
                        10
                    )

                ],

            "total_interviews":
                total_interviews,

            "candidate_count":
                total_interviews,

            "generated_at":

                datetime.now(
                    timezone.utc
                ).isoformat(),

            "viewer_id":
                current_user.id,

        }

    except Exception as error:

        print(

            "Recruiter Insights Error:",

            str(
                error
            ),

        )

        raise HTTPException(

            status_code=500,

            detail=(
                "Failed to generate recruiter insights."
            ),

        ) from error


# ============================================================
# RECRUITER SUMMARY
#
# GET /api/recruiter/summary
# ============================================================

@router.get(
    "/recruiter/summary"
)
def recruiter_summary(

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_active_user
    ),

):

    sessions = get_all_sessions(
        db
    )

    candidates = build_candidates(
        db,
        sessions,
    )

    top_candidate = (

        max(

            candidates,

            key=lambda candidate:

                candidate[
                    "candidate_score"
                ],

            default=None,

        )

    )

    return {

        "total_candidates":
            len(
                candidates
            ),

        "average_score":

            calculate_average(

                [

                    candidate[
                        "candidate_score"
                    ]

                    for candidate

                    in candidates

                ]

            ),

        "top_candidate":
            top_candidate,

        "last_updated":

            datetime.now(
                timezone.utc
            ).isoformat(),

        "viewer_id":
            current_user.id,

    }


# ============================================================
# GET ALL CANDIDATES
#
# GET /api/recruiter/candidates
# ============================================================

@router.get(
    "/recruiter/candidates"
)
def get_recruiter_candidates(

    limit: int = Query(
        100,
        ge=1,
        le=500,
    ),

    offset: int = Query(
        0,
        ge=0,
    ),

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_active_user
    ),

):

    total = (

        db.query(
            InterviewSession
        )

        .count()

    )

    sessions = (

        db.query(
            InterviewSession
        )

        .order_by(

            InterviewSession.created_at.desc(),

            InterviewSession.id.desc(),

        )

        .offset(
            offset
        )

        .limit(
            limit
        )

        .all()

    )

    candidates = build_candidates(
        db,
        sessions,
    )

    return {

        "count":
            len(
                candidates
            ),

        "total":
            total,

        "offset":
            offset,

        "limit":
            limit,

        "candidates":
            candidates,

        "viewer_id":
            current_user.id,

    }


# ============================================================
# GET SINGLE CANDIDATE
#
# GET /api/recruiter/candidates/{session_id}
# ============================================================

@router.get(
    "/recruiter/candidates/{session_id}"
)
def get_recruiter_candidate(

    session_id: int,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_active_user
    ),

):

    session = (

        db.query(
            InterviewSession
        )

        .filter(

            InterviewSession.id
            == session_id

        )

        .first()

    )

    if not session:

        raise HTTPException(

            status_code=404,

            detail=
                "Candidate interview session not found.",

        )

    user = (

        db.query(
            User
        )

        .filter(
            User.id
            == session.user_id
        )

        .first()

    )

    candidate = serialize_candidate(
        session,
        user,
    )

    candidate[
        "viewer_id"
    ] = current_user.id

    return candidate


# ============================================================
# TOP CANDIDATES
#
# GET /api/recruiter/top-candidates
# ============================================================

@router.get(
    "/recruiter/top-candidates"
)
def get_top_candidates(

    limit: int = Query(
        10,
        ge=1,
        le=100,
    ),

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_active_user
    ),

):

    sessions = get_all_sessions(
        db
    )

    candidates = build_candidates(
        db,
        sessions,
    )

    candidates.sort(

        key=lambda candidate:

            (

                candidate[
                    "candidate_score"
                ],

                candidate[
                    "hiring_probability"
                ],

            ),

        reverse=True,

    )

    return {

        "count":

            min(

                len(
                    candidates
                ),

                limit,

            ),

        "candidates":
            candidates[:limit],

        "viewer_id":
            current_user.id,

    }


# ============================================================
# RECRUITER ANALYTICS
#
# GET /api/recruiter/analytics
# ============================================================

@router.get(
    "/recruiter/analytics"
)
def recruiter_analytics(

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_active_user
    ),

):

    sessions = get_all_sessions(
        db
    )

    candidates = build_candidates(
        db,
        sessions,
    )

    return {

        "total_interviews":

            len(
                candidates
            ),

        "score_metrics": {

            "overall":

                calculate_average(

                    [

                        candidate[
                            "candidate_score"
                        ]

                        for candidate

                        in candidates

                    ]

                ),

            "technical":

                calculate_average(

                    [

                        candidate[
                            "technical_score"
                        ]

                        for candidate

                        in candidates

                    ]

                ),

            "communication":

                calculate_average(

                    [

                        candidate[
                            "communication_score"
                        ]

                        for candidate

                        in candidates

                    ]

                ),

            "confidence":

                calculate_average(

                    [

                        candidate[
                            "confidence_score"
                        ]

                        for candidate

                        in candidates

                    ]

                ),

        },

        "hiring_pipeline": {

            "strong_hire":

                len(

                    [

                        candidate

                        for candidate

                        in candidates

                        if candidate[
                            "hiring_probability"
                        ]

                        >= STRONG_HIRE_THRESHOLD

                    ]

                ),

            "hire":

                len(

                    [

                        candidate

                        for candidate

                        in candidates

                        if HIRE_THRESHOLD
                        <= candidate[
                            "hiring_probability"
                        ]
                        < STRONG_HIRE_THRESHOLD

                    ]

                ),

            "consider":

                len(

                    [

                        candidate

                        for candidate

                        in candidates

                        if CONSIDER_THRESHOLD
                        <= candidate[
                            "hiring_probability"
                        ]
                        < HIRE_THRESHOLD

                    ]

                ),

            "no_hire":

                len(

                    [

                        candidate

                        for candidate

                        in candidates

                        if candidate[
                            "hiring_probability"
                        ]
                        < CONSIDER_THRESHOLD

                    ]

                ),

        },

        "viewer_id":
            current_user.id,

        "generated_at":

            datetime.now(
                timezone.utc
            ).isoformat(),

    }


# ============================================================
# ADMIN RECRUITER DATA
#
# GET /api/recruiter/admin/overview
#
# Explicit admin-only endpoint for administrative use.
# ============================================================

@router.get(
    "/recruiter/admin/overview"
)
def recruiter_admin_overview(

    db: Session = Depends(
        get_db
    ),

    current_admin: User = Depends(
        get_current_admin_user
    ),

):

    sessions = get_all_sessions(
        db
    )

    candidates = build_candidates(
        db,
        sessions,
    )

    summary = build_recruiter_summary(
        candidates
    )

    return {

        "success":
            True,

        "admin_id":
            current_admin.id,

        "summary":
            summary,

        "total_users":

            db.query(
                User
            ).count(),

        "generated_at":

            datetime.now(
                timezone.utc
            ).isoformat(),

    }
