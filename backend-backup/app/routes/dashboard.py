from __future__ import annotations

import json
from typing import Any

from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    User,
    InterviewSession,
)

from app.dependencies import get_current_user


router = APIRouter()


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


def average(
    values: list[Any],
) -> int:

    valid_values = []


    for value in values:

        try:

            number = float(
                value
            )


            if number >= 0:

                valid_values.append(
                    number
                )

        except (
            TypeError,
            ValueError,
        ):

            continue


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


def get_completed_interviews(
    interviews: list[InterviewSession],
) -> list[InterviewSession]:

    return [

        interview

        for interview
        in interviews

        if get_status(
            interview
        )
        == "completed"

    ]


def get_recent_sessions(
    interviews: list[InterviewSession],
    limit: int = 5,
) -> list[dict[str, Any]]:

    recent = []


    for interview in interviews[:limit]:

        recent.append({

            "id":
                interview.id,

            "session_id":
                interview.id,

            "role":
                interview.role
                or "Mock Interview",

            "level":
                interview.level
                or "General",

            "score":

                clamp_score(

                    interview.overall_score

                    or

                    interview.candidate_score

                ),

            "overall_score":

                clamp_score(

                    interview.overall_score

                    or

                    interview.candidate_score

                ),

            "status":

                get_status(
                    interview
                ),

            "created_at":

                interview.created_at.isoformat()

                if interview.created_at

                else None,

        })


    return recent


def calculate_rank(
    score: int,
    total_completed: int,
) -> int:

    if total_completed <= 0:

        return 0


    if score >= 95:

        return 1


    if score >= 90:

        return 2


    if score >= 85:

        return 5


    if score >= 80:

        return 10


    if score >= 75:

        return 20


    if score >= 70:

        return 35


    if score >= 60:

        return 50


    return min(
        100,
        max(
            50,
            100 - total_completed,
        ),
    )


# ============================================================
# DASHBOARD
# ============================================================


@router.get(
    "/dashboard"
)
def dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    query = (
    db.query(
        InterviewSession
    )
    .filter(
        InterviewSession.user_id
        == current_user.id
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


    completed_interviews = (

        get_completed_interviews(
            interviews
        )

    )


    total_interviews = len(
        completed_interviews
    )


    all_scores = [

        clamp_score(
            interview.overall_score
        )

        for interview
        in completed_interviews

    ]


    technical_scores = [

        clamp_score(
            interview.technical_score
        )

        for interview
        in completed_interviews

    ]


    communication_scores = [

        clamp_score(
            interview.communication_score
        )

        for interview
        in completed_interviews

    ]


    confidence_scores = [

        clamp_score(
            interview.confidence_score
        )

        for interview
        in completed_interviews

    ]


    hiring_scores = [

        clamp_score(
            interview.hiring_probability
        )

        for interview
        in completed_interviews

        if (
            interview.hiring_probability
            or 0
        ) > 0

    ]


    average_score = average(
        all_scores
    )


    average_technical = average(
        technical_scores
    )


    average_communication = average(
        communication_scores
    )


    average_confidence = average(
        confidence_scores
    )


    average_hiring_probability = average(
        hiring_scores
    )


    latest_completed = (

        completed_interviews[0]

        if completed_interviews

        else None

    )


    latest_score = (

        clamp_score(
            latest_completed.overall_score
        )

        if latest_completed

        else 0

    )


    improvement = 0


    if len(
        completed_interviews
    ) >= 2:

        oldest_score = clamp_score(

            completed_interviews[-1]
            .overall_score

        )


        improvement = (

            latest_score
            - oldest_score

        )


    ai_rank = calculate_rank(

        average_score,

        total_interviews,

    )


    return {

        # ----------------------------------------------------
        # Existing frontend contract
        # ----------------------------------------------------

        "total_interviews":
            total_interviews,

        "avg_confidence":
            average_confidence,

        "communication":
            average_communication,

        "ai_rank":
            ai_rank,

        # ----------------------------------------------------
        # Expanded production dashboard data
        # ----------------------------------------------------

        "average_score":
            average_score,

        "overall_score":
            average_score,

        "technical":
            average_technical,

        "technical_score":
            average_technical,

        "communication_score":
            average_communication,

        "confidence_score":
            average_confidence,

        "hiring_probability":
            average_hiring_probability,

        "latest_score":
            latest_score,

        "improvement":
            improvement,

        "completed_interviews":
            total_interviews,

        "total_sessions":
            len(
                interviews
            ),

        "recent_sessions":

            get_recent_sessions(
                interviews,
                limit=5,
            ),

        "performance": {

            "overall":
                average_score,

            "technical":
                average_technical,

            "communication":
                average_communication,

            "confidence":
                average_confidence,

            "hiring_probability":
                average_hiring_probability,

        },

        "activity": {

            "completed":
                total_interviews,

            "paused":

                sum(

                    1

                    for interview
                    in interviews

                    if get_status(
                        interview
                    )
                    == "paused"

                ),

            "in_progress":

                sum(

                    1

                    for interview
                    in interviews

                    if get_status(
                        interview
                    )
                    == "in_progress"

                ),

        },

    }


# ============================================================
# ACHIEVEMENTS
# ============================================================


@router.get(
    "/achievements"
)
def achievements(
    user_id: int | None = None,
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
            InterviewSession.created_at.desc()
        )
        .all()

    )


    completed_interviews = (

        get_completed_interviews(
            interviews
        )

    )


    total_interviews = len(
        completed_interviews
    )


    best_score = max(

        [

            clamp_score(
                interview.overall_score
            )

            for interview
            in completed_interviews

        ],

        default=0,

    )


    average_score = average(

        [

            clamp_score(
                interview.overall_score
            )

            for interview
            in completed_interviews

        ]

    )


    high_score_count = sum(

        1

        for interview
        in completed_interviews

        if clamp_score(
            interview.overall_score
        )
        >= 80

    )


    total_filler_words = sum(

        max(
            0,
            interview.filler_words
            or 0,
        )

        for interview
        in completed_interviews

    )


    achievements_data = [

        {

            "id":
                "first_interview",

            "title":
                "First Interview",

            "description":
                (
                    "Complete your first AI-powered "
                    "interview."
                ),

            "category":
                "milestone",

            "unlocked":
                total_interviews >= 1,

            "progress":

                min(
                    total_interviews,
                    1,
                ),

            "target":
                1,

            "value":
                total_interviews,

        },

        {

            "id":
                "practice_streak",

            "title":
                "Practice Warrior",

            "description":
                (
                    "Complete five interview sessions."
                ),

            "category":
                "practice",

            "unlocked":
                total_interviews >= 5,

            "progress":

                min(
                    total_interviews,
                    5,
                ),

            "target":
                5,

            "value":
                total_interviews,

        },

        {

            "id":
                "strong_candidate",

            "title":
                "Strong Candidate",

            "description":
                (
                    "Achieve an interview score of 80 "
                    "or higher."
                ),

            "category":
                "performance",

            "unlocked":
                best_score >= 80,

            "progress":

                min(
                    best_score,
                    80,
                ),

            "target":
                80,

            "value":
                best_score,

        },

        {

            "id":
                "interview_master",

            "title":
                "Interview Master",

            "description":
                (
                    "Achieve an interview score of 90 "
                    "or higher."
                ),

            "category":
                "performance",

            "unlocked":
                best_score >= 90,

            "progress":

                min(
                    best_score,
                    90,
                ),

            "target":
                90,

            "value":
                best_score,

        },

        {

            "id":
                "consistent_performer",

            "title":
                "Consistent Performer",

            "description":
                (
                    "Maintain an average interview score "
                    "of at least 75."
                ),

            "category":
                "consistency",

            "unlocked":
                (
                    total_interviews >= 3
                    and
                    average_score >= 75
                ),

            "progress":

                min(
                    average_score,
                    75,
                ),

            "target":
                75,

            "value":
                average_score,

        },

        {

            "id":
                "high_performer",

            "title":
                "High Performer",

            "description":
                (
                    "Complete three interviews with scores "
                    "of 80 or higher."
                ),

            "category":
                "performance",

            "unlocked":
                high_score_count >= 3,

            "progress":

                min(
                    high_score_count,
                    3,
                ),

            "target":
                3,

            "value":
                high_score_count,

        },

        {

            "id":
                "communication_ready",

            "title":
                "Communication Ready",

            "description":
                (
                    "Complete three interviews with strong "
                    "communication performance."
                ),

            "category":
                "communication",

            "unlocked":

                sum(

                    1

                    for interview
                    in completed_interviews

                    if clamp_score(
                        interview.communication_score
                    )
                    >= 75

                )
                >= 3,

            "progress":

                min(

                    sum(

                        1

                        for interview
                        in completed_interviews

                        if clamp_score(
                            interview.communication_score
                        )
                        >= 75

                    ),

                    3,

                ),

            "target":
                3,

        },

        {

            "id":
                "focused_speaker",

            "title":
                "Focused Speaker",

            "description":
                (
                    "Complete an interview with low filler "
                    "word usage."
                ),

            "category":
                "speech",

            "unlocked":

                total_interviews >= 1
                and
                total_filler_words <= (
                    total_interviews * 10
                ),

            "progress":

                max(

                    0,

                    (
                        total_interviews * 10
                    )

                    - total_filler_words,

                ),

            "target":

                max(
                    1,
                    total_interviews * 10,
                ),

        },

    ]


    unlocked_count = sum(

        1

        for item
        in achievements_data

        if item[
            "unlocked"
        ]

    )


    return {

        "total":
            len(
                achievements_data
            ),

        "unlocked":
            unlocked_count,

        "locked":

            len(
                achievements_data
            )

            - unlocked_count,

        "completion_rate":

            round(

                (

                    unlocked_count

                    /

                    len(
                        achievements_data
                    )

                )

                * 100,

                2,

            )

            if achievements_data

            else 0,

        "achievements":
            achievements_data,

        # Backward compatibility with the
        # older frontend expecting an array.
        "items":
            achievements_data,

    }


# ============================================================
# RECRUITER INSIGHTS
# ============================================================


@router.get(
    "/recruiter-insights"
)
def recruiter_insights(
    user_id: int | None = None,
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
            InterviewSession.created_at.desc()
        )
        .all()

    )


    completed_interviews = (

        get_completed_interviews(
            interviews
        )

    )


    if not completed_interviews:

        return {

            "technical":
                (
                    "No completed interview data is "
                    "available yet."
                ),

            "communication":
                (
                    "Complete an interview to generate "
                    "communication insights."
                ),

            "confidence":
                (
                    "Confidence insights will appear after "
                    "interview evaluations are saved."
                ),

            "recommendation":
                (
                    "Complete a full interview session to "
                    "generate recruiter intelligence."
                ),

            "average_score":
                0,

            "candidate_score":
                0,

            "hiring_probability":
                0,

            "strengths":
                [],

            "improvements": [
                (
                    "Complete more interview sessions to "
                    "build a meaningful performance profile."
                ),
            ],

        }


    average_score = average(

        [

            interview.candidate_score

            or

            interview.overall_score

            or 0

            for interview
            in completed_interviews

        ]

    )


    technical_average = average(

        [

            interview.technical_score
            or 0

            for interview
            in completed_interviews

        ]

    )


    communication_average = average(

        [

            interview.communication_score
            or 0

            for interview
            in completed_interviews

        ]

    )


    confidence_average = average(

        [

            interview.confidence_score
            or 0

            for interview
            in completed_interviews

        ]

    )


    hiring_probability = average(

        [

            interview.hiring_probability
            or 0

            for interview
            in completed_interviews

            if (
                interview.hiring_probability
                or 0
            ) > 0

        ]

    )


    metrics = [

        (
            "Technical",
            technical_average,
        ),

        (
            "Communication",
            communication_average,
        ),

        (
            "Confidence",
            confidence_average,
        ),

    ]


    strengths = [

        name

        for name, score
        in metrics

        if score >= 75

    ]


    improvements = [

        name

        for name, score
        in metrics

        if score < 70

    ]


    if average_score >= 85:

        recommendation = (

            "Strong overall candidate performance. "
            "Prioritize advanced role-specific interview "
            "practice and high-quality project discussions."

        )

    elif average_score >= 75:

        recommendation = (

            "The candidate is approaching interview readiness. "
            "Focus on improving weaker dimensions and building "
            "more consistent high-quality responses."

        )

    elif average_score >= 60:

        recommendation = (

            "The candidate has a solid foundation but should "
            "continue targeted practice before high-stakes "
            "interviews."

        )

    else:

        recommendation = (

            "The candidate needs structured interview practice "
            "across technical knowledge, communication and "
            "confidence."

        )


    return {

        "technical":

            (
                f"Average technical performance is "
                f"{technical_average}%."
            ),

        "communication":

            (
                f"Average communication performance is "
                f"{communication_average}%."
            ),

        "confidence":

            (
                f"Average confidence performance is "
                f"{confidence_average}%."
            ),

        "recommendation":
            recommendation,

        "average_score":
            average_score,

        "candidate_score":
            average_score,

        "hiring_probability":
            hiring_probability,

        "technical_average":
            technical_average,

        "communication_average":
            communication_average,

        "confidence_average":
            confidence_average,

        "strengths":
            strengths,

        "improvements":
            improvements,

        "total_interviews":

            len(
                completed_interviews
            ),

    }
