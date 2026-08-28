from sqlalchemy.orm import Session

from app.models import CodingSession
from app.schemas import CodingSessionCreate


# ============================================================
# CREATE CODING SESSION
# ============================================================

def create_coding_session(
    db: Session,
    data: CodingSessionCreate,
):

    session = CodingSession(

        interview_id=data.interview_id,

        role=data.role,

        level=data.level,

        language=data.language,

        question=data.question,

        solution=data.solution,

        score=max(
            0,
            min(data.score, 100),
        ),

        time_complexity=data.time_complexity,

        space_complexity=data.space_complexity,

        execution_result=data.execution_result,

        ai_feedback=data.ai_feedback,
    )

    db.add(session)

    db.commit()

    db.refresh(session)

    return session


# ============================================================
# GET SINGLE CODING SESSION
# ============================================================

def get_coding_session(
    db: Session,
    session_id: int,
):

    return (
        db.query(CodingSession)
        .filter(
            CodingSession.id
            == session_id
        )
        .first()
    )


# ============================================================
# GET INTERVIEW CODING HISTORY
# ============================================================

def get_interview_coding_history(
    db: Session,
    interview_id: int,
):

    return (
        db.query(CodingSession)
        .filter(
            CodingSession.interview_id
            == interview_id
        )
        .order_by(
            CodingSession.created_at.desc()
        )
        .all()
    )


# ============================================================
# DELETE CODING SESSION
# ============================================================

def delete_coding_session(
    db: Session,
    session: CodingSession,
):

    db.delete(session)

    db.commit()