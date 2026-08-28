from collections import defaultdict
from datetime import (
    datetime,
    timedelta,
)

from fastapi import (
    APIRouter,
    Depends,
    Query,
)

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db

from app.models import (
    InterviewSession,
    User,
)

from app.dependencies import (
    get_current_user,
)


router = APIRouter(
    prefix="/api/progress",
    tags=["Progress"],
)


# ============================================================
# HELPERS
# ============================================================

def safe_float(
    value,
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


def clamp_score(
    value,
) -> float:

    score = safe_float(
        value
    )

    return max(
        0.0,
        min(
            100.0,
            score,
        ),
    )


def get_session_score(
    session: InterviewSession,
) -> float:

    score_fields = [

        "overall_score",

        "candidate_score",

        "technical_score",

        "communication_score",

        "confidence_score",

        "relevance_score",
    ]

    scores = []

    for field in score_fields:

        value = getattr(
            session,
            field,
            None,
        )

        if value is not None:

            score = clamp_score(
                value
            )

            if score > 0:

                scores.append(
                    score
                )

    if not scores:

        return 0.0

    return round(
        sum(scores)
        / len(scores),
        2,
    )


def get_created_at(
    session: InterviewSession,
):

    value = getattr(
        session,
        "completed_at",
        None,
    )

    if value:

        return value

    value = getattr(
        session,
        "updated_at",
        None,
    )

    if value:

        return value

    return getattr(
        session,
        "created_at",
        None,
    )


def serialize_session(
    session: InterviewSession,
):

    created_at = get_created_at(
        session
    )

    return {

        "id":
            session.id,

        "role":
            getattr(
                session,
                "role",
                None,
            ),

        "level":
            getattr(
                session,
                "level",
                None,
            ),

        "interview_type":
            getattr(
                session,
                "interview_type",
                None,
            ),

        "status":
            getattr(
                session,
                "status",
                None,
            ),

        "score":
            get_session_score(
                session
            ),

        "overall_score":
            clamp_score(
                getattr(
                    session,
                    "overall_score",
                    0,
                )
            ),

        "technical_score":
            clamp_score(
                getattr(
                    session,
                    "technical_score",
                    0,
                )
            ),

        "communication_score":
            clamp_score(
                getattr(
                    session,
                    "communication_score",
                    0,
                )
            ),

        "confidence_score":
            clamp_score(
                getattr(
                    session,
                    "confidence_score",
                    0,
                )
            ),

        "relevance_score":
            clamp_score(
                getattr(
                    session,
                    "relevance_score",
                    0,
                )
            ),

        "created_at":
            (
                created_at.isoformat()
                if created_at
                else None
            ),
    }


# ============================================================
# GET ALL PROGRESS DATA
# ============================================================

@router.get("/")
def get_progress(
    days: int = Query(
        default=30,
        ge=7,
        le=365,
    ),

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):

    cutoff_date = (
        datetime.utcnow()
        - timedelta(
            days=days
        )
    )

    sessions = (
        db.query(
            InterviewSession
        )
        .filter(
            InterviewSession.user_id
            == current_user.id,

            InterviewSession.created_at
            >= cutoff_date,
        )
        .order_by(
            InterviewSession.created_at.asc()
        )
        .all()
    )

    return build_progress_response(
        sessions=sessions,
        days=days,
    )


# ============================================================
# OVERVIEW
# ============================================================

@router.get(
    "/overview"
)
def get_progress_overview(
    days: int = Query(
        default=30,
        ge=7,
        le=365,
    ),

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):

    cutoff_date = (
        datetime.utcnow()
        - timedelta(
            days=days
        )
    )

    sessions = (
        db.query(
            InterviewSession
        )
        .filter(
            InterviewSession.user_id
            == current_user.id,

            InterviewSession.created_at
            >= cutoff_date,
        )
        .order_by(
            InterviewSession.created_at.asc()
        )
        .all()
    )

    response = build_progress_response(
        sessions=sessions,
        days=days,
    )

    return {

        "success":
            True,

        "overview":
            response[
                "overview"
            ],

        "period":
            response[
                "period"
            ],
    }


# ============================================================
# PERFORMANCE TREND
# ============================================================

@router.get(
    "/trend"
)
def get_progress_trend(
    days: int = Query(
        default=30,
        ge=7,
        le=365,
    ),

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):

    cutoff_date = (
        datetime.utcnow()
        - timedelta(
            days=days
        )
    )

    sessions = (
        db.query(
            InterviewSession
        )
        .filter(
            InterviewSession.user_id
            == current_user.id,

            InterviewSession.created_at
            >= cutoff_date,
        )
        .order_by(
            InterviewSession.created_at.asc()
        )
        .all()
    )

    response = build_progress_response(
        sessions=sessions,
        days=days,
    )

    return {

        "success":
            True,

        "trend":
            response[
                "trend"
            ],

        "period":
            response[
                "period"
            ],
    }


# ============================================================
# SKILL PROGRESS
# ============================================================

@router.get(
    "/skills"
)
def get_skill_progress(
    days: int = Query(
        default=90,
        ge=7,
        le=365,
    ),

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):

    cutoff_date = (
        datetime.utcnow()
        - timedelta(
            days=days
        )
    )

    sessions = (
        db.query(
            InterviewSession
        )
        .filter(
            InterviewSession.user_id
            == current_user.id,

            InterviewSession.created_at
            >= cutoff_date,
        )
        .order_by(
            InterviewSession.created_at.asc()
        )
        .all()
    )

    response = build_progress_response(
        sessions=sessions,
        days=days,
    )

    return {

        "success":
            True,

        "skills":
            response[
                "skills"
            ],
    }


# ============================================================
# RECENT ACTIVITY
# ============================================================

@router.get(
    "/activity"
)
def get_progress_activity(
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):

    sessions = (
        db.query(
            InterviewSession
        )
        .filter(
            InterviewSession.user_id
            == current_user.id
        )
        .order_by(
            InterviewSession.created_at.desc()
        )
        .limit(
            limit
        )
        .all()
    )

    activity = []

    for session in sessions:

        session_date = get_created_at(
            session
        )

        score = get_session_score(
            session
        )

        status = (
            getattr(
                session,
                "status",
                None,
            )
            or "completed"
        )

        activity.append({

            "id":
                session.id,

            "type":
                "interview",

            "title":
                (
                    f"{session.role} "
                    f"Interview"
                ),

            "subtitle":
                (
                    getattr(
                        session,
                        "interview_type",
                        None,
                    )
                    or getattr(
                        session,
                        "level",
                        None,
                    )
                    or "Interview"
                ),

            "score":
                score,

            "status":
                status,

            "date":
                (
                    session_date.isoformat()
                    if session_date
                    else None
                ),
        })

    return {

        "success":
            True,

        "activity":
            activity,
    }


# ============================================================
# PROGRESS CALCULATOR
# ============================================================

def build_progress_response(
    sessions,
    days: int,
):

    total_sessions = len(
        sessions
    )

    if not sessions:

        return {

            "success":
                True,

            "period": {

                "days":
                    days,

                "start_date":
                    (
                        datetime.utcnow()
                        - timedelta(
                            days=days
                        )
                    ).isoformat(),

                "end_date":
                    datetime.utcnow().isoformat(),
            },

            "overview": {

                "total_sessions":
                    0,

                "average_score":
                    0,

                "latest_score":
                    0,

                "best_score":
                    0,

                "score_improvement":
                    0,

                "completion_rate":
                    0,

                "streak":
                    0,
            },

            "trend":
                [],

            "skills":
                [],

            "recent_sessions":
                [],
        }

    session_scores = [

        get_session_score(
            session
        )

        for session
        in sessions
    ]

    scored_values = [

        score

        for score
        in session_scores

        if score > 0
    ]

    average_score = (
        round(
            sum(
                scored_values
            )
            / len(
                scored_values
            ),
            2,
        )

        if scored_values

        else 0
    )

    latest_score = (
        scored_values[-1]
        if scored_values
        else 0
    )

    best_score = (
        max(
            scored_values
        )

        if scored_values

        else 0
    )

    first_score = (
        scored_values[0]
        if scored_values
        else 0
    )

    score_improvement = (
        round(
            latest_score
            - first_score,
            2,
        )

        if len(
            scored_values
        ) > 1

        else 0
    )

    completed_sessions = [

        session

        for session
        in sessions

        if (
            getattr(
                session,
                "status",
                None,
            )
            in {
                "completed",
                None,
            }
        )
    ]

    completion_rate = round(

        (
            len(
                completed_sessions
            )
            / total_sessions
        )
        * 100,

        2,
    )

    # --------------------------------------------------------
    # DAILY TREND
    # --------------------------------------------------------

    daily_scores = defaultdict(
        list
    )

    for session in sessions:

        session_date = get_created_at(
            session
        )

        if not session_date:

            continue

        date_key = (
            session_date.strftime(
                "%Y-%m-%d"
            )
        )

        score = get_session_score(
            session
        )

        if score > 0:

            daily_scores[
                date_key
            ].append(
                score
            )

    trend = []

    current_date = (
        datetime.utcnow()
        - timedelta(
            days=days - 1
        )
    ).date()

    today = datetime.utcnow().date()

    while current_date <= today:

        date_key = (
            current_date.isoformat()
        )

        scores = daily_scores.get(
            date_key,
            [],
        )

        average = (

            round(
                sum(scores)
                / len(scores),
                2,
            )

            if scores

            else 0
        )

        trend.append({

            "date":
                date_key,

            "score":
                average,

            "sessions":
                len(
                    scores
                ),
        })

        current_date += timedelta(
            days=1
        )

    # --------------------------------------------------------
    # SKILL BREAKDOWN
    # --------------------------------------------------------

    skill_fields = [

        (
            "Technical",
            "technical_score",
        ),

        (
            "Communication",
            "communication_score",
        ),

        (
            "Confidence",
            "confidence_score",
        ),

        (
            "Relevance",
            "relevance_score",
        ),
    ]

    skills = []

    for label, field in skill_fields:

        values = []

        for session in sessions:

            value = getattr(
                session,
                field,
                None,
            )

            if value is not None:

                score = clamp_score(
                    value
                )

                if score > 0:

                    values.append(
                        score
                    )

        average = (

            round(
                sum(values)
                / len(values),
                2,
            )

            if values

            else 0
        )

        first = (
            values[0]
            if values
            else 0
        )

        latest = (
            values[-1]
            if values
            else 0
        )

        improvement = (

            round(
                latest
                - first,
                2,
            )

            if len(values) > 1

            else 0
        )

        skills.append({

            "name":
                label,

            "score":
                average,

            "latest_score":
                latest,

            "improvement":
                improvement,

            "sessions":
                len(
                    values
                ),
        })

    # --------------------------------------------------------
    # STREAK
    # --------------------------------------------------------

    active_dates = {

        get_created_at(
            session
        ).date()

        for session
        in sessions

        if get_created_at(
            session
        )
    }

    streak = 0

    streak_date = (
        datetime.utcnow().date()
    )

    if streak_date not in active_dates:

        streak_date -= timedelta(
            days=1
        )

    while streak_date in active_dates:

        streak += 1

        streak_date -= timedelta(
            days=1
        )

    recent_sessions = [

        serialize_session(
            session
        )

        for session
        in sorted(
            sessions,
            key=lambda item: (
                get_created_at(
                    item
                )
                or datetime.min
            ),
            reverse=True,
        )[:10]
    ]

    return {

        "success":
            True,

        "period": {

            "days":
                days,

            "start_date":
                (
                    datetime.utcnow()
                    - timedelta(
                        days=days
                    )
                ).isoformat(),

            "end_date":
                datetime.utcnow().isoformat(),
        },

        "overview": {

            "total_sessions":
                total_sessions,

            "average_score":
                average_score,

            "latest_score":
                latest_score,

            "best_score":
                best_score,

            "score_improvement":
                score_improvement,

            "completion_rate":
                completion_rate,

            "streak":
                streak,
        },

        "trend":
            trend,

        "skills":
            skills,

        "recent_sessions":
            recent_sessions,
    }
