from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from pydantic import BaseModel

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas import (
    CodingSessionCreate,
    CodingSessionResponse,
)

from app.services.coding_ai import (
    generate_question,
    evaluate_solution,
)

from app.services.coding_service import (
    create_coding_session,
    get_coding_session,
    get_interview_coding_history,
    delete_coding_session,
)

from app.services.coding_score_service import (
    update_candidate_score,
)


router = APIRouter(
    prefix="/coding",
    tags=["Coding Interview"],
)


# ============================================================
# REQUEST MODELS
# ============================================================

class CodingQuestionRequest(BaseModel):

    role: str

    level: str

    language: str


class CodingEvaluationRequest(BaseModel):

    role: str

    language: str

    question: str

    solution: str


# ============================================================
# GENERATE CODING QUESTION
# ============================================================

@router.post("/generate")
def coding_question(
    data: CodingQuestionRequest,
):

    try:

        result = generate_question(
            data.role,
            data.level,
            data.language,
        )

        return result

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Question generation failed: "
                f"{str(e)}"
            ),
        )


# ============================================================
# EVALUATE SOLUTION
# ============================================================

@router.post("/evaluate")
def coding_evaluation(
    data: CodingEvaluationRequest,
):

    try:

        result = evaluate_solution(
            data.role,
            data.language,
            data.question,
            data.solution,
        )

        return result

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Code evaluation failed: "
                f"{str(e)}"
            ),
        )


# ============================================================
# SAVE CODING SESSION
# ============================================================

@router.post("/session")
def save_coding_session(
    data: CodingSessionCreate,
    db: Session = Depends(get_db),
):

    try:

        session = create_coding_session(
            db,
            data,
        )

        updated_score = None

        if data.interview_id is not None:

            updated_score = (
                update_candidate_score(
                    db,
                    data.interview_id,
                )
            )

        return {

            "message":
                "Coding session saved successfully.",

            "coding_session": {

                "id":
                    session.id,

                "interview_id":
                    session.interview_id,

                "role":
                    session.role,

                "level":
                    session.level,

                "language":
                    session.language,

                "question":
                    session.question,

                "solution":
                    session.solution,

                "score":
                    session.score,

                "time_complexity":
                    session.time_complexity,

                "space_complexity":
                    session.space_complexity,

                "execution_result":
                    session.execution_result,

                "ai_feedback":
                    session.ai_feedback,

                "created_at":
                    session.created_at,
            },

            "candidate":
                updated_score,
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Coding session could not "
                f"be saved: {str(e)}"
            ),
        )


# ============================================================
# GET CODING SESSION
# ============================================================

@router.get(
    "/session/{session_id}",
    response_model=CodingSessionResponse,
)
def coding_session_details(
    session_id: int,
    db: Session = Depends(get_db),
):

    session = get_coding_session(
        db,
        session_id,
    )

    if not session:

        raise HTTPException(
            status_code=404,
            detail="Coding session not found.",
        )

    return session


# ============================================================
# CODING HISTORY
# ============================================================

@router.get(
    "/history/{interview_id}",
    response_model=list[CodingSessionResponse],
)
def coding_history(
    interview_id: int,
    db: Session = Depends(get_db),
):

    return get_interview_coding_history(
        db,
        interview_id,
    )


# ============================================================
# DELETE CODING SESSION
# ============================================================

@router.delete(
    "/session/{session_id}"
)
def remove_coding_session(
    session_id: int,
    db: Session = Depends(get_db),
):

    session = get_coding_session(
        db,
        session_id,
    )

    if not session:

        raise HTTPException(
            status_code=404,
            detail="Coding session not found.",
        )

    delete_coding_session(
        db,
        session,
    )

    return {

        "message":
            "Coding session deleted successfully."
    }


# ============================================================
# CANDIDATE SCORE
# ============================================================

@router.get(
    "/score/{interview_id}"
)
def coding_candidate_score(
    interview_id: int,
    db: Session = Depends(get_db),
):

    result = update_candidate_score(
        db,
        interview_id,
    )

    if not result:

        raise HTTPException(
            status_code=404,
            detail="Interview session not found.",
        )

    return result