# backend/app/routes/coding.py

from __future__ import annotations

from typing import Any

from fastapi import (
    APIRouter,
    HTTPException,
)
from pydantic import (
    BaseModel,
    Field,
)

from app.services.coding_ai import (
    evaluate_solution,
    generate_question,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/coding",
    tags=["Coding AI"],
)


# ============================================================
# REQUEST MODELS
# ============================================================

class GenerateQuestionRequest(
    BaseModel
):

    role: str = Field(
        default="Software Engineer",
        min_length=1,
        max_length=200,
    )

    level: str = Field(
        default="Medium",
        min_length=1,
        max_length=100,
    )

    language: str = Field(
        default="Python",
        min_length=1,
        max_length=100,
    )


class EvaluateSolutionRequest(
    BaseModel
):

    role: str = Field(
        default="Software Engineer",
        min_length=1,
        max_length=200,
    )

    language: str = Field(
        default="Python",
        min_length=1,
        max_length=100,
    )

    question: str = Field(
        ...,
        min_length=1,
        max_length=15000,
    )

    solution: str = Field(
        ...,
        min_length=1,
        max_length=20000,
    )


# ============================================================
# RESPONSE MODELS
# ============================================================

class CodingQuestionResponse(
    BaseModel
):

    success: bool

    title: str | None = None

    description: str | None = None

    difficulty: str | None = None

    language: str | None = None

    input_format: str | None = None

    output_format: str | None = None

    constraints: list[str] = Field(
        default_factory=list
    )

    examples: list[
        dict[str, str]
    ] = Field(
        default_factory=list
    )

    test_cases: list[
        dict[str, str]
    ] = Field(
        default_factory=list
    )

    model: str | None = None

    error: str | None = None


class CodingEvaluationResponse(
    BaseModel
):

    success: bool

    score: int = 0

    correctness_score: int = 0

    code_quality_score: int = 0

    algorithm_score: int = 0

    edge_case_score: int = 0

    time_complexity: str = (
        "Not determined"
    )

    space_complexity: str = (
        "Not determined"
    )

    strengths: list[str] = Field(
        default_factory=list
    )

    weaknesses: list[str] = Field(
        default_factory=list
    )

    improvements: list[str] = Field(
        default_factory=list
    )

    verdict: str = ""

    interview_recommendation: str = (
        "Borderline"
    )

    model: str | None = None

    error: str | None = None


# ============================================================
# GENERATE QUESTION
# ============================================================

@router.post(
    "/generate-question",
    response_model=CodingQuestionResponse,
)
def generate_coding_question(
    data: GenerateQuestionRequest,
):

    try:

        result = generate_question(
            role=data.role,
            level=data.level,
            language=data.language,
        )

        if not result.get(
            "success",
            False,
        ):

            return CodingQuestionResponse(
                success=False,
                error=result.get(
                    "error",
                    "Unable to generate "
                    "coding question.",
                ),
            )

        return CodingQuestionResponse(
            success=True,

            title=result.get(
                "title"
            ),

            description=result.get(
                "description"
            ),

            difficulty=result.get(
                "difficulty"
            ),

            language=result.get(
                "language"
            ),

            input_format=result.get(
                "input_format"
            ),

            output_format=result.get(
                "output_format"
            ),

            constraints=result.get(
                "constraints",
                [],
            ),

            examples=result.get(
                "examples",
                [],
            ),

            test_cases=result.get(
                "test_cases",
                [],
            ),

            model=result.get(
                "model"
            ),
        )

    except ValueError as error:

        raise HTTPException(
            status_code=422,
            detail=str(error),
        )

    except Exception as error:

        print(
            "Generate coding question error:",
            str(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to generate "
                "coding question."
            ),
        )


# ============================================================
# EVALUATE SOLUTION
# ============================================================

@router.post(
    "/evaluate",
    response_model=CodingEvaluationResponse,
)
def evaluate_coding_solution(
    data: EvaluateSolutionRequest,
):

    try:

        result = evaluate_solution(
            role=data.role,
            language=data.language,
            question=data.question,
            solution=data.solution,
        )

        if not result.get(
            "success",
            False,
        ):

            return CodingEvaluationResponse(
                success=False,

                score=int(
                    result.get(
                        "score",
                        0,
                    )
                ),

                error=result.get(
                    "error",
                    "Unable to evaluate "
                    "coding solution.",
                ),
            )

        return CodingEvaluationResponse(
            success=True,

            score=int(
                result.get(
                    "score",
                    0,
                )
            ),

            correctness_score=int(
                result.get(
                    "correctness_score",
                    0,
                )
            ),

            code_quality_score=int(
                result.get(
                    "code_quality_score",
                    0,
                )
            ),

            algorithm_score=int(
                result.get(
                    "algorithm_score",
                    0,
                )
            ),

            edge_case_score=int(
                result.get(
                    "edge_case_score",
                    0,
                )
            ),

            time_complexity=str(
                result.get(
                    "time_complexity",
                    "Not determined",
                )
            ),

            space_complexity=str(
                result.get(
                    "space_complexity",
                    "Not determined",
                )
            ),

            strengths=result.get(
                "strengths",
                [],
            ),

            weaknesses=result.get(
                "weaknesses",
                [],
            ),

            improvements=result.get(
                "improvements",
                [],
            ),

            verdict=str(
                result.get(
                    "verdict",
                    "",
                )
            ),

            interview_recommendation=str(
                result.get(
                    "interview_recommendation",
                    "Borderline",
                )
            ),

            model=result.get(
                "model"
            ),
        )

    except ValueError as error:

        raise HTTPException(
            status_code=422,
            detail=str(error),
        )

    except Exception as error:

        print(
            "Coding evaluation route error:",
            str(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to evaluate "
                "coding solution."
            ),
        )


# ============================================================
# HEALTH
# ============================================================

@router.get(
    "/health",
)
def coding_health() -> dict[
    str,
    Any,
]:

    from app.services.groq_service import (
        get_groq_status,
    )

    status = get_groq_status()

    return {
        "status":
            (
                "healthy"
                if status.get(
                    "available"
                )
                else "unavailable"
            ),

        "service":
            "HireSense Coding AI",

        "ai_enabled":
            status.get(
                "enabled"
            ),

        "groq_available":
            status.get(
                "available"
            ),

        "groq_api_key_loaded":
            status.get(
                "api_key_loaded"
            ),

        "model":
            status.get(
                "model"
            ),
    }