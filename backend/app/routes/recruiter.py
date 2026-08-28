from __future__ import annotations


import json
from collections import Counter
from datetime import datetime
from typing import Any

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from sqlalchemy.orm import Session

from app.database import get_db
from app.models import InterviewSession


router = APIRouter()


# ============================================================
# HELPERS
# ============================================================

def safe_float(
    value: Any,
    default: float = 0.0,
) -> float:

    try:

        if value is None:

            return default


        return float(
            value
        )

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


        return int(
            float(
                value
            )
        )

    except (
        TypeError,
        ValueError,
    ):

        return default


def clamp_score(
    value: Any,
) -> int:

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

    if value is None:

        return default


    return str(
        value
    )


def parse_json_value(
    value: Any,
    default: Any,
) -> Any:

    if value is None:

        return default


    if isinstance(
        value,
        (
            list,
            dict,
        ),
    ):

        return value


    if isinstance(
        value,
        str,
    ):

        try:

            parsed = json.loads(
                value
            )

            return parsed

        except Exception:

            return default


    return default


def get_model_value(
    session: InterviewSession,
    field_name: str,
    default: Any = None,
) -> Any:

    return getattr(
        session,
        field_name,
        default,
    )


def calculate_candidate_score(
    session: InterviewSession,
) -> int:

    stored_score = clamp_score(
        get_model_value(
            session,
            "candidate_score",
            0,
        )
    )


    if stored_score > 0:

        return stored_score


    overall_score = clamp_score(
        get_model_value(
            session,
            "overall_score",
            0,
        )
    )


    if overall_score > 0:

        return overall_score


    scores = [

        clamp_score(
            get_model_value(
                session,
                "technical_score",
                0,
            )
        ),

        clamp_score(
            get_model_value(
                session,
                "communication_score",
                0,
            )
        ),

        clamp_score(
            get_model_value(
                session,
                "confidence_score",
                0,
            )
        ),

        clamp_score(
            get_model_value(
                session,
                "relevance_score",
                0,
            )
        ),

    ]


    valid_scores = [

        score

        for score in scores

        if score > 0

    ]


    if not valid_scores:

        return 0


    return clamp_score(

        sum(
            valid_scores
        )

        / len(
            valid_scores
        )

    )


def calculate_hiring_probability(
    session: InterviewSession,
) -> int:

    stored_probability = clamp_score(
        get_model_value(
            session,
            "hiring_probability",
            0,
        )
    )


    if stored_probability > 0:

        return stored_probability


    candidate_score = calculate_candidate_score(
        session
    )


    resume_score = clamp_score(
        get_model_value(
            session,
            "resume_score",
            0,
        )
    )


    jd_match_score = clamp_score(
        get_model_value(
            session,
            "jd_match_score",
            0,
        )
    )


    additional_scores = [

        candidate_score,

        resume_score,

        jd_match_score,

    ]


    valid_scores = [

        score

        for score in additional_scores

        if score > 0

    ]


    if not valid_scores:

        return 0


    probability = (

        sum(
            valid_scores
        )

        / len(
            valid_scores
        )

    )


    return clamp_score(
        probability
    )


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


    completed_at = get_model_value(
        session,
        "completed_at",
        None,
    )


    if completed_at:

        return "completed"


    return "active"


def get_recruiter_recommendation(
    session: InterviewSession,
) -> str:

    recommendation = safe_string(

        get_model_value(
            session,
            "recruiter_recommendation",
            "",
        )

    )


    if recommendation:

        return recommendation


    probability = calculate_hiring_probability(
        session
    )


    if probability >= 85:

        return "Strong Hire"


    if probability >= 70:

        return "Hire"


    if probability >= 50:

        return "Consider"


    return "No Hire"


def get_candidate_strengths(
    session: InterviewSession,
) -> list[str]:

    strengths = parse_json_value(

        get_model_value(
            session,
            "strengths",
            None,
        ),

        [],
    )


    if isinstance(
        strengths,
        list,
    ):

        return [

            str(
                item
            )

            for item in strengths

            if str(
                item
            ).strip()

        ]


    return []


def get_improvement_areas(
    session: InterviewSession,
) -> list[str]:

    improvements = parse_json_value(

        get_model_value(
            session,
            "improvement_areas",
            None,
        ),

        [],
    )


    if isinstance(
        improvements,
        list,
    ):

        return [

            str(
                item
            )

            for item in improvements

            if str(
                item
            ).strip()

        ]


    return []


def get_interview_type(
    session: InterviewSession,
) -> str:

    return safe_string(

        get_model_value(
            session,
            "interview_type",
            "Technical",
        ),

        "Technical",

    )


def get_created_at(
    session: InterviewSession,
) -> Any:

    return get_model_value(
        session,
        "created_at",
        None,
    )


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


def serialize_candidate(
    session: InterviewSession,
) -> dict[str, Any]:

    candidate_score = calculate_candidate_score(
        session
    )


    hiring_probability = calculate_hiring_probability(
        session
    )


    technical_score = clamp_score(

        get_model_value(
            session,
            "technical_score",
            0,
        )

    )


    communication_score = clamp_score(

        get_model_value(
            session,
            "communication_score",
            0,
        )

    )


    confidence_score = clamp_score(

        get_model_value(
            session,
            "confidence_score",
            0,
        )

    )


    relevance_score = clamp_score(

        get_model_value(
            session,
            "relevance_score",
            0,
        )

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

        "role":
            safe_string(
                get_model_value(
                    session,
                    "role",
                    "Unknown Role",
                ),
                "Unknown Role",
            ),

        "level":
            safe_string(
                get_model_value(
                    session,
                    "level",
                    "Unknown",
                ),
                "Unknown",
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

        "overall_score":
            candidate_score,

        "technical_score":
            technical_score,

        "communication_score":
            communication_score,

        "confidence_score":
            confidence_score,

        "relevance_score":
            relevance_score,

        "resume_score":
            clamp_score(
                get_model_value(
                    session,
                    "resume_score",
                    0,
                )
            ),

        "jd_match_score":
            clamp_score(
                get_model_value(
                    session,
                    "jd_match_score",
                    0,
                )
            ),

        "hiring_probability":
            hiring_probability,

        "recommendation":
            get_recruiter_recommendation(
                session
            ),

        "recruiter_recommendation":
            get_recruiter_recommendation(
                session
            ),

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
                get_created_at(
                    session
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
            InterviewSession.created_at.desc()
        )

        .all()

    )


def calculate_average(
    values: list[float],
) -> int:

    valid_values = [

        value

        for value in values

        if value > 0

    ]


    if not valid_values:

        return 0


    return clamp_score(

        sum(
            valid_values
        )

        / len(
            valid_values
        )

    )


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
):

    try:

        sessions = get_all_sessions(
            db
        )


        candidates = [

            serialize_candidate(
                session
            )

            for session in sessions

        ]


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

            >= 70

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

            "active_interviews":
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

                        candidate[
                            "candidate_score"
                        ],

                    reverse=True,

                )[:10],

            "recent_candidates":

                candidates[:10],

            "candidate_score_distribution":

                {

                    "excellent":

                        len(

                            [

                                candidate

                                for candidate
                                in candidates

                                if candidate[
                                    "candidate_score"
                                ]

                                >= 85

                            ]

                        ),

                    "good":

                        len(

                            [

                                candidate

                                for candidate
                                in candidates

                                if 70
                                <= candidate[
                                    "candidate_score"
                                ]
                                < 85

                            ]

                        ),

                    "average":

                        len(

                            [

                                candidate

                                for candidate
                                in candidates

                                if 50
                                <= candidate[
                                    "candidate_score"
                                ]
                                < 70

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

                                < 50

                            ]

                        ),

                },

        }


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
):

    try:

        sessions = get_all_sessions(
            db
        )


        candidates = [

            serialize_candidate(
                session
            )

            for session in sessions

        ]


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


        strongest_area = max(

            {

                "Technical":
                    technical_average,

                "Communication":
                    communication_average,

                "Confidence":
                    confidence_average,

            },

            key=lambda key:

                {

                    "Technical":
                        technical_average,

                    "Communication":
                        communication_average,

                    "Confidence":
                        confidence_average,

                }[
                    key
                ],

        )


        weakest_area = min(

            {

                "Technical":
                    technical_average,

                "Communication":
                    communication_average,

                "Confidence":
                    confidence_average,

            },

            key=lambda key:

                {

                    "Technical":
                        technical_average,

                    "Communication":
                        communication_average,

                    "Confidence":
                        confidence_average,

                }[
                    key
                ],

        )


        improvements = [

            weakest_area
        ]


        if technical_average < 60:

            improvements.append(
                "Technical"
            )


        if communication_average < 60:

            improvements.append(
                "Communication"
            )


        if confidence_average < 60:

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

                "No completed interview data is available yet. "
                "Conduct interviews to generate meaningful "
                "recruiter intelligence."
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

                    for name,
                    count

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

                    for name,
                    count

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

                    for role,
                    count

                    in role_counter.most_common(
                        10
                    )

                ],

            "total_interviews":
                total_interviews,

            "candidate_count":
                total_interviews,

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
):

    sessions = get_all_sessions(
        db
    )


    candidates = [

        serialize_candidate(
            session
        )

        for session in sessions

    ]


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

            max(

                candidates,

                key=lambda candidate:

                    candidate[
                        "candidate_score"
                    ],

                default=None,

            ),

        "last_updated":

            datetime.utcnow().isoformat(),

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
):

    sessions = (

        db.query(
            InterviewSession
        )

        .order_by(
            InterviewSession.created_at.desc()
        )

        .offset(
            offset
        )

        .limit(
            limit
        )

        .all()

    )


    candidates = [

        serialize_candidate(
            session
        )

        for session in sessions

    ]


    return {

        "count":
            len(
                candidates
            ),

        "offset":
            offset,

        "limit":
            limit,

        "candidates":
            candidates,

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


    return serialize_candidate(
        session
    )


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
):

    sessions = get_all_sessions(
        db
    )


    candidates = [

        serialize_candidate(
            session
        )

        for session in sessions

    ]


    candidates.sort(

        key=lambda candidate:

            candidate[
                "candidate_score"
            ],

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
):

    sessions = get_all_sessions(
        db
    )


    candidates = [

        serialize_candidate(
            session
        )

        for session in sessions

    ]


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

                        >= 85

                    ]

                ),

            "hire":

                len(

                    [

                        candidate

                        for candidate
                        in candidates

                        if 70
                        <= candidate[
                            "hiring_probability"
                        ]
                        < 85

                    ]

                ),

            "consider":

                len(

                    [

                        candidate

                        for candidate
                        in candidates

                        if 50
                        <= candidate[
                            "hiring_probability"
                        ]
                        < 70

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

                        < 50

                    ]

                ),

        },

    }