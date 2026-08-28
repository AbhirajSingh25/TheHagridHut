from __future__ import annotations

import logging

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)

from sqlalchemy import inspect
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_active_user
from app.models import (
    InterviewSession,
    User,
)
from app.services.candidate_service import (
    build_candidate_intelligence,
)


# ============================================================
# LOGGING
# ============================================================

logger = logging.getLogger(
    __name__
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/candidate",
    tags=[
        "Candidate Intelligence",
    ],
)


# ============================================================
# DATABASE COLUMN HELPERS
# ============================================================

def get_interview_session_columns(
    db: Session,
) -> set[str]:
    """
    Return the actual columns currently available in the
    interview_sessions database table.

    This protects the backend during schema consolidation where
    the SQLAlchemy model and existing Neon schema may temporarily
    differ.
    """

    try:

        inspector = inspect(
            db.get_bind()
        )

        columns = inspector.get_columns(
            InterviewSession.__tablename__
        )

        return {
            column["name"]
            for column in columns
        }

    except Exception:

        return set()


def interview_session_supports_user_id(
    db: Session,
) -> bool:
    """
    Determine whether the actual Neon interview_sessions table
    currently contains a user_id column.
    """

    database_columns = (
        get_interview_session_columns(
            db
        )
    )

    return (
        "user_id"
        in database_columns
    )


def apply_candidate_filter(
    query,
    db: Session,
    current_user: User,
    requested_user_id: int | None = None,
):
    """
    Apply the safest available candidate ownership filter.

    Priority:

        1. Authenticated user's own sessions.
        2. Optional requested_user_id is only honored when it
           matches the authenticated user.
        3. If the Neon table has not yet been migrated with
           user_id, the existing data remains available for the
           current single-user compatibility mode.

    This prevents one authenticated user from requesting another
    user's intelligence through:

        ?user_id=<someone_else>
    """

    if requested_user_id is not None:

        if (
            requested_user_id
            != current_user.id
        ):

            raise HTTPException(
                status_code=(
                    status.HTTP_403_FORBIDDEN
                ),
                detail=(
                    "You can only access your own "
                    "candidate intelligence."
                ),
            )

    if not interview_session_supports_user_id(
        db
    ):

        return query

    return query.filter(
        InterviewSession.user_id
        == current_user.id
    )


def order_candidate_sessions(
    query,
):
    """
    Order candidate sessions newest first.

    created_at is preferred. id is always included as a stable
    secondary ordering field when available.
    """

    if hasattr(
        InterviewSession,
        "created_at",
    ):

        if hasattr(
            InterviewSession,
            "id",
        ):

            return query.order_by(
                InterviewSession.created_at.desc(),
                InterviewSession.id.desc(),
            )

        return query.order_by(
            InterviewSession.created_at.desc()
        )

    if hasattr(
        InterviewSession,
        "id",
    ):

        return query.order_by(
            InterviewSession.id.desc()
        )

    return query


def load_candidate_sessions(
    db: Session,
    current_user: User,
    requested_user_id: int | None = None,
) -> list[InterviewSession]:
    """
    Load all interview sessions available to the authenticated
    candidate.

    The function centralizes:

        - ownership filtering
        - Neon schema compatibility
        - ordering
        - future multi-user support
    """

    query = (
        db.query(
            InterviewSession
        )
    )

    query = apply_candidate_filter(
        query=query,
        db=db,
        current_user=current_user,
        requested_user_id=requested_user_id,
    )

    query = order_candidate_sessions(
        query
    )

    return query.all()


def build_candidate_response(
    sessions: list[InterviewSession],
) -> dict:
    """
    Generate the complete frontend-facing candidate intelligence
    payload.

    The heavy analysis remains inside candidate_service.py so the
    route is responsible only for HTTP, authentication and data
    loading.
    """

    intelligence = (
        build_candidate_intelligence(
            sessions
        )
    )

    if not isinstance(
        intelligence,
        dict,
    ):

        raise ValueError(
            "Candidate intelligence service returned "
            "an invalid response."
        )

    return intelligence


# ============================================================
# CANDIDATE INTELLIGENCE
# ============================================================

@router.get(
    "/intelligence",
)
def get_candidate_intelligence(
    user_id: int | None = Query(
        default=None,
        description=(
            "Optional legacy compatibility parameter. "
            "Authenticated users may only request their own "
            "candidate intelligence."
        ),
    ),
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        get_current_active_user
    ),
):
    """
    Return the complete AI-generated candidate intelligence
    profile for the authenticated user.

    Frontend contract:

        GET /api/candidate/intelligence

    The response is generated from persisted interview sessions
    stored in Neon PostgreSQL.
    """

    try:

        sessions = (
            load_candidate_sessions(
                db=db,
                current_user=current_user,
                requested_user_id=user_id,
            )
        )

        intelligence = (
            build_candidate_response(
                sessions
            )
        )

        return intelligence

    except HTTPException:

        raise

    except Exception:

        logger.exception(
            "Candidate intelligence generation failed "
            "for user_id=%s",
            current_user.id,
        )

        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "Failed to generate candidate intelligence."
            ),
        )


# ============================================================
# CANDIDATE SUMMARY
# ============================================================

@router.get(
    "/summary",
)
def get_candidate_summary(
    user_id: int | None = Query(
        default=None,
        description=(
            "Optional legacy compatibility parameter. "
            "Authenticated users may only request their own "
            "candidate summary."
        ),
    ),
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        get_current_active_user
    ),
):
    """
    Return a compact candidate intelligence summary.

    Frontend/API consumers receive the most important metrics
    without needing the complete intelligence payload.
    """

    try:

        sessions = (
            load_candidate_sessions(
                db=db,
                current_user=current_user,
                requested_user_id=user_id,
            )
        )

        intelligence = (
            build_candidate_response(
                sessions
            )
        )

        assessment_summary = (
            intelligence.get(
                "assessment_summary",
                {},
            )
        )

        return {

            "overall":
                intelligence.get(
                    "overall",
                    0,
                ),

            "recommendation":
                intelligence.get(
                    "recommendation",
                    "",
                ),

            "readiness":
                intelligence.get(
                    "readiness",
                    "",
                ),

            "hiring_probability":
                intelligence.get(
                    "hiring_probability",
                    0,
                ),

            "salary_prediction":
                intelligence.get(
                    "salary_prediction",
                    {},
                ),

            "strengths":
                intelligence.get(
                    "strengths",
                    [],
                ),

            "improvements":
                intelligence.get(
                    "improvements",
                    [],
                ),

            "sessions_analyzed":
                assessment_summary.get(
                    "sessions_analyzed",
                    len(
                        sessions
                    ),
                ),

        }

    except HTTPException:

        raise

    except Exception:

        logger.exception(
            "Candidate summary generation failed "
            "for user_id=%s",
            current_user.id,
        )

        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "Failed to generate candidate summary."
            ),
        )


# ============================================================
# CANDIDATE SESSION COUNT
# ============================================================

@router.get(
    "/sessions",
)
def get_candidate_sessions_summary(
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        get_current_active_user
    ),
):
    """
    Return a lightweight summary of persisted interview sessions.

    This endpoint is useful for future frontend widgets without
    regenerating the entire candidate intelligence profile.
    """

    try:

        sessions = (
            load_candidate_sessions(
                db=db,
                current_user=current_user,
            )
        )

        completed_sessions = 0

        for session in sessions:

            final_report = getattr(
                session,
                "final_report",
                None,
            )

            if final_report:

                completed_sessions += 1

        return {

            "total_sessions":
                len(
                    sessions
                ),

            "completed_sessions":
                completed_sessions,

            "incomplete_sessions":
                max(
                    0,
                    len(
                        sessions
                    )
                    - completed_sessions,
                ),

        }

    except HTTPException:

        raise

    except Exception:

        logger.exception(
            "Candidate session summary failed "
            "for user_id=%s",
            current_user.id,
        )

        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "Failed to load candidate sessions."
            ),
        )
