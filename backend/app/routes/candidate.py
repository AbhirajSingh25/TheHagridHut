from __future__ import annotations

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.models import (
    InterviewSession,
)

from app.services.candidate_service import (
    build_candidate_intelligence,
)


router = APIRouter(
    prefix="/api/candidate",
    tags=[
        "Candidate Intelligence"
    ],
)


# ============================================================
# CANDIDATE INTELLIGENCE
# ============================================================


@router.get(
    "/intelligence"
)
def get_candidate_intelligence(
    user_id: int | None = Query(
        default=None,
        description=(
            "Optional user ID for future "
            "multi-user candidate filtering."
        ),
    ),
    db: Session = Depends(
        get_db
    ),
):

    try:

        query = (
            db.query(
                InterviewSession
            )
        )


        # ====================================================
        # OPTIONAL USER FILTER
        # ====================================================
        #
        # getattr is intentionally used so the backend
        # continues working even if an older database model
        # does not yet contain user_id.
        #


        if (
            user_id is not None
            and hasattr(
                InterviewSession,
                "user_id",
            )
        ):

            query = query.filter(
                InterviewSession.user_id
                == user_id
            )


        # ====================================================
        # LOAD ALL AVAILABLE CANDIDATE SESSIONS
        # ====================================================


        if hasattr(
            InterviewSession,
            "created_at",
        ):

            sessions = (
                query
                .order_by(
                    InterviewSession.created_at.desc()
                )
                .all()
            )

        else:

            sessions = (
                query
                .order_by(
                    InterviewSession.id.desc()
                )
                .all()
            )


        # ====================================================
        # BUILD PRODUCTION CANDIDATE PROFILE
        # ====================================================


        intelligence = (
            build_candidate_intelligence(
                sessions
            )
        )


        return intelligence


    except Exception as error:

        print(
            "Candidate Intelligence Error:",
            str(
                error
            ),
        )


        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to generate candidate intelligence."
            ),
        )


# ============================================================
# CANDIDATE SUMMARY
# ============================================================


@router.get(
    "/summary"
)
def get_candidate_summary(
    user_id: int | None = Query(
        default=None,
    ),
    db: Session = Depends(
        get_db
    ),
):

    query = (
        db.query(
            InterviewSession
        )
    )


    if (
        user_id is not None
        and hasattr(
            InterviewSession,
            "user_id",
        )
    ):

        query = query.filter(
            InterviewSession.user_id
            == user_id
        )


    if hasattr(
        InterviewSession,
        "created_at",
    ):

        sessions = (
            query
            .order_by(
                InterviewSession.created_at.desc()
            )
            .all()
        )

    else:

        sessions = (
            query
            .order_by(
                InterviewSession.id.desc()
            )
            .all()
        )


    intelligence = (
        build_candidate_intelligence(
            sessions
        )
    )


    return {

        "overall":
            intelligence[
                "overall"
            ],

        "recommendation":
            intelligence[
                "recommendation"
            ],

        "readiness":
            intelligence[
                "readiness"
            ],

        "hiring_probability":
            intelligence[
                "hiring_probability"
            ],

        "salary_prediction":
            intelligence[
                "salary_prediction"
            ],

        "strengths":
            intelligence[
                "strengths"
            ],

        "improvements":
            intelligence[
                "improvements"
            ],

        "sessions_analyzed":
            intelligence[
                "assessment_summary"
            ][
                "sessions_analyzed"
            ],

    }