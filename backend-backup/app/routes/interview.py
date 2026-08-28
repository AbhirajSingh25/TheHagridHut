from __future__ import annotations

import json
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import (
    InterviewSession,
    User,
)
from app.services.groq_service import ask_groq_json


router = APIRouter(
    prefix="/api/interview",
    tags=["Interview AI"],
)


# ============================================================
# HELPERS
# ============================================================


def clamp_score(
    value: Any,
    default: float = 0.0,
) -> float:

    try:
        score = float(value)

    except (
        TypeError,
        ValueError,
    ):
        score = default

    return round(
        max(
            0.0,
            min(
                100.0,
                score,
            ),
        ),
        2,
    )


def safe_json_loads(
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

    try:
        return json.loads(
            value
        )

    except Exception:
        return default


def safe_json_dumps(
    value: Any,
) -> str:

    try:
        return json.dumps(
            value,
            default=str,
        )

    except Exception:
        return json.dumps(
            {}
        )


def safe_list(
    value: Any,
) -> List[Any]:

    if isinstance(
        value,
        list,
    ):
        return value

    if value is None:
        return []

    return [value]


def clean_string_list(
    value: Any,
    limit: int = 10,
) -> List[str]:

    items = safe_list(
        value
    )

    results: List[str] = []

    seen = set()

    for item in items:

        text = str(
            item
        ).strip()

        if not text:
            continue

        key = text.lower()

        if key in seen:
            continue

        seen.add(
            key
        )

        results.append(
            text
        )

        if len(
            results
        ) >= limit:
            break

    return results


def calculate_average(
    values: List[Any],
) -> float:

    valid_values = []

    for value in values:

        try:

            number = float(
                value
            )

            if 0 <= number <= 100:
                valid_values.append(
                    number
                )

        except (
            TypeError,
            ValueError,
        ):
            continue

    if not valid_values:
        return 0.0

    return round(
        sum(
            valid_values
        )
        /
        len(
            valid_values
        ),
        2,
    )


def unwrap_evaluation(
    value: Any,
) -> Dict[str, Any]:

    if not isinstance(
        value,
        dict,
    ):
        return {}

    nested = value.get(
        "evaluation"
    )

    if isinstance(
        nested,
        dict,
    ):
        return nested

    return value


def get_metric_score(
    metrics: Optional[
        Dict[str, Any]
    ],
    *keys: str,
    default: float = 0.0,
) -> float:

    if not isinstance(
        metrics,
        dict,
    ):
        return default

    for key in keys:

        if key in metrics:

            value = clamp_score(
                metrics.get(
                    key
                ),
                default=default,
            )

            if value > 0:
                return value

    return default


# ============================================================
# SERIALIZER
# ============================================================


def serialize_session(
    session: InterviewSession,
) -> Dict[str, Any]:

    return {
        "id":
            str(
                session.id
            ),

        "session_id":
            str(
                session.id
            ),

        "user_id":
            getattr(
                session,
                "user_id",
                None,
            ),

        "role":
            getattr(
                session,
                "role",
                "General Interview",
            ),

        "level":
            getattr(
                session,
                "level",
                "Intermediate",
            ),

        "interview_type":
            getattr(
                session,
                "interview_type",
                "mock",
            ),

        "questions":
            safe_json_loads(
                getattr(
                    session,
                    "questions",
                    "[]",
                ),
                [],
            ),

        "answers":
            safe_json_loads(
                getattr(
                    session,
                    "answers",
                    "[]",
                ),
                [],
            ),

        "evaluations":
            safe_json_loads(
                getattr(
                    session,
                    "evaluations",
                    "[]",
                ),
                [],
            ),

        "final_report":
            safe_json_loads(
                getattr(
                    session,
                    "final_report",
                    "{}",
                ),
                {},
            ),

        "status":
            getattr(
                session,
                "status",
                "completed",
            ),

        "is_paused":
            bool(
                getattr(
                    session,
                    "is_paused",
                    False,
                )
            ),

        "current_question_index":
            getattr(
                session,
                "current_question_index",
                0,
            )
            or 0,

        "overall_score":
            getattr(
                session,
                "overall_score",
                0,
            )
            or 0,

        "technical_score":
            getattr(
                session,
                "technical_score",
                0,
            )
            or 0,

        "communication_score":
            getattr(
                session,
                "communication_score",
                0,
            )
            or 0,

        "confidence_score":
            getattr(
                session,
                "confidence_score",
                0,
            )
            or 0,

        "relevance_score":
            getattr(
                session,
                "relevance_score",
                0,
            )
            or 0,

        "candidate_score":
            getattr(
                session,
                "candidate_score",
                0,
            )
            or 0,

        "hiring_probability":
            getattr(
                session,
                "hiring_probability",
                0,
            )
            or 0,

        "resume_score":
            getattr(
                session,
                "resume_score",
                0,
            )
            or 0,

        "jd_match_score":
            getattr(
                session,
                "jd_match_score",
                0,
            )
            or 0,

        "speech_score":
            getattr(
                session,
                "speech_score",
                0,
            )
            or 0,

        "filler_words":
            getattr(
                session,
                "filler_words",
                0,
            )
            or 0,

        "speaking_speed":
            getattr(
                session,
                "speaking_speed",
                0,
            )
            or 0,

        "pause_score":
            getattr(
                session,
                "pause_score",
                0,
            )
            or 0,

        "pronunciation_score":
            getattr(
                session,
                "pronunciation_score",
                0,
            )
            or 0,

        "clarity_score":
            getattr(
                session,
                "clarity_score",
                0,
            )
            or 0,

        "vision_score":
            getattr(
                session,
                "vision_score",
                0,
            )
            or 0,

        "eye_contact_score":
            getattr(
                session,
                "eye_contact_score",
                0,
            )
            or 0,

        "attention_score":
            getattr(
                session,
                "attention_score",
                0,
            )
            or 0,

        "engagement_score":
            getattr(
                session,
                "engagement_score",
                0,
            )
            or 0,

        "posture_score":
            getattr(
                session,
                "posture_score",
                0,
            )
            or 0,

        "recruiter_recommendation":
            getattr(
                session,
                "recruiter_recommendation",
                None,
            ),

        "recruiter_notes":
            getattr(
                session,
                "recruiter_notes",
                None,
            ),

        "expected_salary":
            getattr(
                session,
                "expected_salary",
                None,
            ),

        "strengths":
            safe_json_loads(
                getattr(
                    session,
                    "strengths",
                    "[]",
                ),
                [],
            ),

        "improvement_areas":
            safe_json_loads(
                getattr(
                    session,
                    "improvement_areas",
                    "[]",
                ),
                [],
            ),

        "certificate_id":
            getattr(
                session,
                "certificate_id",
                None,
            ),

        "certificate_generated":
            bool(
                getattr(
                    session,
                    "certificate_generated",
                    False,
                )
            ),

        "created_at":
            (
                session.created_at.isoformat()
                if getattr(
                    session,
                    "created_at",
                    None,
                )
                else None
            ),

        "updated_at":
            (
                session.updated_at.isoformat()
                if getattr(
                    session,
                    "updated_at",
                    None,
                )
                else None
            ),

        "completed_at":
            (
                session.completed_at.isoformat()
                if getattr(
                    session,
                    "completed_at",
                    None,
                )
                else None
            ),
    }


# ============================================================
# REQUEST MODELS
# ============================================================


class QuestionGenerationRequest(
    BaseModel
):

    role: str = Field(
        min_length=2,
    )

    level: str = "Intermediate"

    count: int = Field(
        default=5,
        ge=1,
        le=10,
    )


class AnswerEvaluationRequest(
    BaseModel
):

    question: str = Field(
        min_length=1,
    )

    answer: str = Field(
        min_length=1,
    )

    role: str = (
        "General Professional"
    )

    level: str = (
        "Intermediate"
    )

    speech_metrics: Optional[
        Dict[str, Any]
    ] = None


class FollowupQuestionRequest(
    BaseModel
):

    role: str = "General"

    level: str = "Intermediate"

    question: str = Field(
        min_length=1,
    )

    answer: str = Field(
        min_length=1,
    )

    evaluation: Optional[
        Dict[str, Any]
    ] = None


class InterviewReportRequest(
    BaseModel
):

    role: str

    level: str

    questions: List[str] = []

    answers: List[str] = []

    evaluations: List[Any] = []


class SaveInterviewRequest(
    BaseModel
):

    role: str

    level: str

    questions: List[str] = []

    answers: List[str] = []

    evaluations: List[Any] = []

    final_report: Optional[
        Dict[str, Any]
    ] = None

    interview_type: Optional[
        str
    ] = "mock"

    resume_score: Optional[
        float
    ] = 0

    jd_match_score: Optional[
        float
    ] = 0

    speech_score: Optional[
        float
    ] = 0

    filler_words: Optional[
        int
    ] = 0

    speaking_speed: Optional[
        float
    ] = 0

    pause_score: Optional[
        float
    ] = 0

    pronunciation_score: Optional[
        float
    ] = 0

    clarity_score: Optional[
        float
    ] = 0

    vision_score: Optional[
        float
    ] = 0

    eye_contact_score: Optional[
        float
    ] = 0

    attention_score: Optional[
        float
    ] = 0

    engagement_score: Optional[
        float
    ] = 0

    posture_score: Optional[
        float
    ] = 0

    hiring_probability: Optional[
        float
    ] = 0

    candidate_score: Optional[
        float
    ] = 0

    recruiter_recommendation: Optional[
        str
    ] = None

    recruiter_notes: Optional[
        str
    ] = None

    expected_salary: Optional[
        str
    ] = None

    certificate_id: Optional[
        str
    ] = None


# ============================================================
# AI QUESTION GENERATION
# ============================================================


def generate_questions_with_ai(
    role: str,
    level: str,
    count: int,
) -> List[str]:

    prompt = f"""
Generate exactly {count} realistic
job interview questions.

Target role:
{role}

Candidate level:
{level}

Requirements:

- Questions must match the target role.
- Questions must match the candidate level.
- Include a useful mix of technical,
  practical, problem-solving and
  behavioral questions.
- Avoid duplicate questions.
- Do not number the questions.
- Keep each question concise.
- Make them suitable for a realistic
  professional interview.

Return valid JSON only:

{{
    "questions": [
        "Question 1",
        "Question 2"
    ]
}}
"""

    result = ask_groq_json(
        prompt=prompt,
        system_prompt=(
            "You are an expert technical "
            "recruiter and interview designer. "
            "Return valid JSON only."
        ),
        temperature=0.4,
        max_tokens=1800,
    )

    questions = []

    if isinstance(
        result,
        dict,
    ):

        questions = clean_string_list(
            result.get(
                "questions",
                [],
            ),
            limit=count,
        )

    if len(
        questions
    ) < count:

        fallback_questions = [
            (
                f"Tell me about your experience "
                f"and why you are interested in "
                f"the {role} role."
            ),
            (
                f"Describe a challenging problem "
                f"you would expect to solve as a "
                f"{role}."
            ),
            (
                f"How would you approach a complex "
                f"technical problem in this role?"
            ),
            (
                "Describe a situation where your "
                "first approach did not work. "
                "What did you do next?"
            ),
            (
                "What skills do you believe are most "
                "important for succeeding in this role?"
            ),
            (
                "How do you learn new technologies "
                "or solve problems you have not "
                "encountered before?"
            ),
        ]

        for question in fallback_questions:

            if (
                question
                not in questions
            ):
                questions.append(
                    question
                )

            if len(
                questions
            ) >= count:
                break

    return questions[:count]


# ============================================================
# AI ANSWER EVALUATION
# ============================================================


def evaluate_answer_with_ai(
    question: str,
    answer: str,
    role: str,
    level: str,
    speech_metrics: Optional[
        Dict[str, Any]
    ] = None,
) -> Dict[str, Any]:

    prompt = f"""
Evaluate this interview answer.

Target role:
{role}

Candidate level:
{level}

Interview question:
{question}

Candidate answer:
{answer}

Speech metrics:
{speech_metrics or {}}

Evaluate:

1. Technical understanding
2. Communication quality
3. Confidence expressed in the answer
4. Relevance to the question
5. Answer structure
6. Practical reasoning
7. Professional interview readiness

Rules:

- Analyze the actual answer.
- Do not reward length by itself.
- Do not invent skills or experience.
- Do not claim acoustic facts unless
  speech metrics provide them.
- Use speech metrics only as supporting
  evidence.
- Be specific and constructive.
- Every score must be between 0 and 100.

Return valid JSON only:

{{
    "technical_score": 0,
    "communication_score": 0,
    "confidence_score": 0,
    "relevance_score": 0,
    "structure_score": 0,
    "overall_score": 0,
    "strengths": [],
    "improvements": [],
    "feedback": "",
    "summary": ""
}}
"""

    result = ask_groq_json(
        prompt=prompt,
        system_prompt=(
            "You are a senior interviewer and "
            "candidate assessment expert. "
            "Return only valid JSON."
        ),
        temperature=0.2,
        max_tokens=2200,
    )

    if not isinstance(
        result,
        dict,
    ):
        raise ValueError(
            "AI returned an invalid "
            "interview evaluation."
        )

    return result


# ============================================================
# AI FOLLOW-UP GENERATION
# ============================================================


def generate_followup_with_ai(
    role: str,
    level: str,
    question: str,
    answer: str,
    evaluation: Optional[
        Dict[str, Any]
    ] = None,
) -> str:

    prompt = f"""
Generate the next adaptive interview
question.

Target role:
{role}

Candidate level:
{level}

Previous question:
{question}

Candidate answer:
{answer}

Previous evaluation:
{evaluation or {}}

Your next question must:

- Build naturally on the candidate's answer.
- Test weak or unclear areas when relevant.
- Avoid repeating the same question.
- Match the candidate level.
- Be realistic for an actual interview.
- Be one concise question.

Return valid JSON only:

{{
    "question": ""
}}
"""

    result = ask_groq_json(
        prompt=prompt,
        system_prompt=(
            "You are an adaptive AI interviewer. "
            "Generate the most useful next "
            "interview question. "
            "Return JSON only."
        ),
        temperature=0.5,
        max_tokens=900,
    )

    if isinstance(
        result,
        dict,
    ):

        question = str(
            result.get(
                "question",
                "",
            )
        ).strip()

        if question:
            return question

    return (
        f"Can you give a concrete example "
        f"showing how you would apply your "
        f"approach as a {role}?"
    )


# ============================================================
# AI FINAL REPORT
# ============================================================


def generate_report_with_ai(
    role: str,
    level: str,
    questions: List[str],
    answers: List[str],
    evaluations: List[Any],
) -> Dict[str, Any]:

    compact_data = []

    for index, question in enumerate(
        questions
    ):

        answer = (
            answers[index]
            if index < len(answers)
            else ""
        )

        evaluation = (
            unwrap_evaluation(
                evaluations[index]
            )
            if index < len(evaluations)
            else {}
        )

        compact_data.append(
            {
                "question": question,
                "answer": answer,
                "evaluation": evaluation,
            }
        )

    prompt = f"""
Create a final AI interview report.

Target role:
{role}

Candidate level:
{level}

Interview data:
{json.dumps(compact_data, default=str)}

Analyze the full interview and return
a professional candidate assessment.

Every score must be between 0 and 100.

Return valid JSON only:

{{
    "overall_score": 0,
    "technical_score": 0,
    "communication_score": 0,
    "confidence_score": 0,
    "relevance_score": 0,
    "hiring_probability": 0,
    "candidate_score": 0,
    "recommendation": "",
    "recruiter_recommendation": "",
    "summary": "",
    "strengths": [],
    "improvement_areas": [],
    "recruiter_notes": ""
}}
"""

    result = ask_groq_json(
        prompt=prompt,
        system_prompt=(
            "You are a senior recruiter and "
            "interview assessment specialist. "
            "Create evidence-based final "
            "candidate reports. "
            "Return valid JSON only."
        ),
        temperature=0.25,
        max_tokens=3000,
    )

    if not isinstance(
        result,
        dict,
    ):
        raise ValueError(
            "AI returned an invalid "
            "final interview report."
        )

    return result


# ============================================================
# POST /generate-questions
# ============================================================


@router.post(
    "/generate-questions"
)
def generate_questions(
    data: QuestionGenerationRequest,
    current_user: User = Depends(
        get_current_user
    ),
):

    role = (
        data.role
        or "General Professional"
    ).strip()

    level = (
        data.level
        or "Intermediate"
    ).strip()

    try:

        questions = (
            generate_questions_with_ai(
                role=role,
                level=level,
                count=data.count,
            )
        )

    except Exception as exc:

        raise HTTPException(
            status_code=502,
            detail=(
                "AI question generation failed: "
                f"{str(exc)}"
            ),
        ) from exc

    return {
        "success": True,
        "role": role,
        "level": level,
        "questions": questions,
        "count": len(
            questions
        ),
    }


# ============================================================
# POST /evaluate-answer
# ============================================================


@router.post(
    "/evaluate-answer"
)
def evaluate_answer(
    data: AnswerEvaluationRequest,
    current_user: User = Depends(
        get_current_user
    ),
):

    question = (
        data.question
        or ""
    ).strip()

    answer = (
        data.answer
        or ""
    ).strip()

    if not question:

        raise HTTPException(
            status_code=400,
            detail=(
                "Interview question is required."
            ),
        )

    if not answer:

        raise HTTPException(
            status_code=400,
            detail=(
                "Answer cannot be empty."
            ),
        )

    try:

        ai_result = (
            evaluate_answer_with_ai(
                question=question,
                answer=answer,
                role=data.role,
                level=data.level,
                speech_metrics=
                    data.speech_metrics,
            )
        )

    except Exception as exc:

        raise HTTPException(
            status_code=502,
            detail=(
                "AI answer evaluation failed: "
                f"{str(exc)}"
            ),
        ) from exc

    speech_confidence = (
        get_metric_score(
            data.speech_metrics,
            "confidence_score",
        )
    )

    speech_communication = (
        get_metric_score(
            data.speech_metrics,
            "communication_score",
        )
    )

    speech_clarity = (
        get_metric_score(
            data.speech_metrics,
            "clarity_score",
        )
    )

    technical_score = clamp_score(
        ai_result.get(
            "technical_score"
        )
    )

    relevance_score = clamp_score(
        ai_result.get(
            "relevance_score"
        )
    )

    structure_score = clamp_score(
        ai_result.get(
            "structure_score"
        )
    )

    ai_confidence = clamp_score(
        ai_result.get(
            "confidence_score"
        )
    )

    ai_communication = clamp_score(
        ai_result.get(
            "communication_score"
        )
    )

    if speech_confidence > 0:

        confidence_score = clamp_score(
            (
                ai_confidence * 0.7
            )
            +
            (
                speech_confidence * 0.3
            )
        )

    else:

        confidence_score = ai_confidence

    if speech_communication > 0:

        communication_score = clamp_score(
            (
                ai_communication * 0.7
            )
            +
            (
                speech_communication * 0.3
            )
        )

    else:

        communication_score = ai_communication

    clarity_score = speech_clarity

    overall_score = clamp_score(
        calculate_average(
            [
                technical_score,
                relevance_score,
                communication_score,
                confidence_score,
                structure_score,
            ]
        )
    )

    filler_words = 0

    if isinstance(
        data.speech_metrics,
        dict,
    ):

        filler_words = int(
            data.speech_metrics.get(
                "filler_word_count",
                data.speech_metrics.get(
                    "filler_words",
                    0,
                ),
            )
            or 0
        )

    evaluation = {
        "question": question,
        "technical_score": technical_score,
        "communication_score": communication_score,
        "confidence_score": confidence_score,
        "relevance_score": relevance_score,
        "structure_score": structure_score,
        "clarity_score": clarity_score,
        "overall_score": overall_score,
        "filler_words": filler_words,
        "strengths": clean_string_list(
            ai_result.get(
                "strengths",
                [],
            ),
            limit=6,
        ),
        "improvements": clean_string_list(
            ai_result.get(
                "improvements",
                [],
            ),
            limit=6,
        ),
        "feedback": str(
            ai_result.get(
                "feedback",
                ai_result.get(
                    "summary",
                    "",
                ),
            )
            or ""
        ),
        "summary": str(
            ai_result.get(
                "summary",
                "",
            )
            or ""
        ),
    }

    return {
        "success": True,
        "evaluation": evaluation,
    }


# ============================================================
# POST /generate-followup
# ============================================================


@router.post(
    "/generate-followup"
)
def generate_followup_question(
    data: FollowupQuestionRequest,
    current_user: User = Depends(
        get_current_user
    ),
):

    role = (
        data.role
        or "General Professional"
    ).strip()

    level = (
        data.level
        or "Intermediate"
    ).strip()

    question = (
        data.question
        or ""
    ).strip()

    answer = (
        data.answer
        or ""
    ).strip()

    if not answer:

        raise HTTPException(
            status_code=400,
            detail=(
                "Previous answer cannot be empty."
            ),
        )

    try:

        followup = (
            generate_followup_with_ai(
                role=role,
                level=level,
                question=question,
                answer=answer,
                evaluation=data.evaluation,
            )
        )

    except Exception as exc:

        raise HTTPException(
            status_code=502,
            detail=(
                "AI follow-up generation failed: "
                f"{str(exc)}"
            ),
        ) from exc

    return {
        "success": True,
        "question": followup,
        "followup_question": followup,
        "role": role,
        "level": level,
    }


# ============================================================
# POST /generate-report
# ============================================================


@router.post(
    "/generate-report"
)
def generate_report(
    data: InterviewReportRequest,
    current_user: User = Depends(
        get_current_user
    ),
):

    if not data.questions:

        raise HTTPException(
            status_code=400,
            detail=(
                "At least one interview question "
                "is required."
            ),
        )

    if not data.answers:

        raise HTTPException(
            status_code=400,
            detail=(
                "At least one interview answer "
                "is required."
            ),
        )

    try:

        ai_report = (
            generate_report_with_ai(
                role=data.role,
                level=data.level,
                questions=data.questions,
                answers=data.answers,
                evaluations=data.evaluations,
            )
        )

    except Exception as exc:

        raise HTTPException(
            status_code=502,
            detail=(
                "AI report generation failed: "
                f"{str(exc)}"
            ),
        ) from exc

    report = {
        "role": data.role,
        "level": data.level,
        "overall_score": clamp_score(
            ai_report.get(
                "overall_score"
            )
        ),
        "technical_score": clamp_score(
            ai_report.get(
                "technical_score"
            )
        ),
        "communication_score": clamp_score(
            ai_report.get(
                "communication_score"
            )
        ),
        "confidence_score": clamp_score(
            ai_report.get(
                "confidence_score"
            )
        ),
        "relevance_score": clamp_score(
            ai_report.get(
                "relevance_score"
            )
        ),
        "hiring_probability": clamp_score(
            ai_report.get(
                "hiring_probability"
            )
        ),
        "candidate_score": clamp_score(
            ai_report.get(
                "candidate_score",
                ai_report.get(
                    "overall_score",
                    0,
                ),
            )
        ),
        "recommendation": str(
            ai_report.get(
                "recommendation",
                "Needs Improvement",
            )
        ),
        "recruiter_recommendation": str(
            ai_report.get(
                "recruiter_recommendation",
                ai_report.get(
                    "recommendation",
                    "Needs Improvement",
                ),
            )
        ),
        "summary": str(
            ai_report.get(
                "summary",
                "",
            )
        ),
        "strengths": clean_string_list(
            ai_report.get(
                "strengths",
                [],
            ),
            limit=8,
        ),
        "improvement_areas": clean_string_list(
            ai_report.get(
                "improvement_areas",
                [],
            ),
            limit=8,
        ),
        "recruiter_notes": str(
            ai_report.get(
                "recruiter_notes",
                "",
            )
        ),
        "questions_answered": len(
            data.answers
        ),
        "generated_at": (
            datetime.utcnow()
            .isoformat()
        ),
    }

    return {
        "success": True,
        "report": report,
    }


# ============================================================
# POST /save-interview
# ============================================================


@router.post(
    "/save-interview"
)
def save_interview(
    data: SaveInterviewRequest,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        get_current_user
    ),
):

    evaluations = [
        unwrap_evaluation(
            evaluation
        )
        for evaluation in (
            data.evaluations
            or []
        )
    ]

    final_report = (
        data.final_report
        or {}
    )

    overall_score = clamp_score(
        final_report.get(
            "overall_score",
            calculate_average(
                [
                    evaluation.get(
                        "overall_score",
                        0,
                    )
                    for evaluation
                    in evaluations
                ]
            ),
        )
    )

    technical_score = clamp_score(
        final_report.get(
            "technical_score",
            calculate_average(
                [
                    evaluation.get(
                        "technical_score",
                        0,
                    )
                    for evaluation
                    in evaluations
                ]
            ),
        )
    )

    communication_score = clamp_score(
        final_report.get(
            "communication_score",
            calculate_average(
                [
                    evaluation.get(
                        "communication_score",
                        0,
                    )
                    for evaluation
                    in evaluations
                ]
            ),
        )
    )

    confidence_score = clamp_score(
        final_report.get(
            "confidence_score",
            calculate_average(
                [
                    evaluation.get(
                        "confidence_score",
                        0,
                    )
                    for evaluation
                    in evaluations
                ]
            ),
        )
    )

    relevance_score = clamp_score(
        final_report.get(
            "relevance_score",
            calculate_average(
                [
                    evaluation.get(
                        "relevance_score",
                        0,
                    )
                    for evaluation
                    in evaluations
                ]
            ),
        )
    )

    certificate_id = (
        data.certificate_id
        or f"HS-{uuid.uuid4().hex[:12].upper()}"
    )

    strengths = (
        clean_string_list(
            final_report.get(
                "strengths",
                [],
            ),
            limit=10,
        )
    )

    improvement_areas = (
        clean_string_list(
            final_report.get(
                "improvement_areas",
                [],
            ),
            limit=10,
        )
    )

    session = InterviewSession(
        user_id=current_user.id,

        role=data.role,

        level=data.level,

        interview_type=(
            data.interview_type
            or "mock"
        ),

        questions=safe_json_dumps(
            data.questions
        ),

        answers=safe_json_dumps(
            data.answers
        ),

        evaluations=safe_json_dumps(
            evaluations
        ),

        final_report=safe_json_dumps(
            final_report
        ),

        status="completed",

        is_paused=False,

        current_question_index=len(
            data.answers
        ),

        overall_score=overall_score,

        technical_score=technical_score,

        communication_score=communication_score,

        confidence_score=confidence_score,

        relevance_score=relevance_score,

        candidate_score=clamp_score(
            data.candidate_score
            or final_report.get(
                "candidate_score",
                overall_score,
            )
        ),

        hiring_probability=clamp_score(
            data.hiring_probability
            or final_report.get(
                "hiring_probability",
                overall_score,
            )
        ),

        resume_score=clamp_score(
            data.resume_score
        ),

        jd_match_score=clamp_score(
            data.jd_match_score
        ),

        speech_score=clamp_score(
            data.speech_score
        ),

        filler_words=int(
            data.filler_words
            or 0
        ),

        speaking_speed=float(
            data.speaking_speed
            or 0
        ),

        pause_score=clamp_score(
            data.pause_score
        ),

        pronunciation_score=clamp_score(
            data.pronunciation_score
        ),

        clarity_score=clamp_score(
            data.clarity_score
        ),

        vision_score=clamp_score(
            data.vision_score
        ),

        eye_contact_score=clamp_score(
            data.eye_contact_score
        ),

        attention_score=clamp_score(
            data.attention_score
        ),

        engagement_score=clamp_score(
            data.engagement_score
        ),

        posture_score=clamp_score(
            data.posture_score
        ),

        recruiter_recommendation=(
            data.recruiter_recommendation
            or final_report.get(
                "recruiter_recommendation"
            )
            or final_report.get(
                "recommendation"
            )
        ),

        recruiter_notes=(
            data.recruiter_notes
            or final_report.get(
                "recruiter_notes"
            )
        ),

        expected_salary=(
            data.expected_salary
        ),

        strengths=safe_json_dumps(
            strengths
        ),

        improvement_areas=safe_json_dumps(
            improvement_areas
        ),

        certificate_id=certificate_id,

        certificate_generated=True,

        completed_at=datetime.utcnow(),
    )

    try:

        db.add(
            session
        )

        db.commit()

        db.refresh(
            session
        )

    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to save interview "
                f"session: {str(exc)}"
            ),
        ) from exc

    return {
        "success": True,

        "message":
            "Interview session saved successfully.",

        "session":
            serialize_session(
                session
            ),

        "session_id":
            str(
                session.id
            ),

        "certificate_id":
            certificate_id,
    }


# ============================================================
# GET /history
# ============================================================


@router.get(
    "/history"
)
def get_interview_history(
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
            InterviewSession.created_at
            .desc()
        )
        .all()
    )

    return {
        "success": True,

        "total": len(
            sessions
        ),

        "sessions": [
            serialize_session(
                session
            )
            for session
            in sessions
        ],
    }


# ============================================================
# GET /session/{session_id}
# ============================================================


@router.get(
    "/session/{session_id}"
)
def get_interview_session(
    session_id: int,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        get_current_user
    ),
):

    session = (
        db.query(
            InterviewSession
        )
        .filter(
            InterviewSession.id
            == session_id,

            InterviewSession.user_id
            == current_user.id,
        )
        .first()
    )

    if not session:

        raise HTTPException(
            status_code=404,
            detail=(
                "Interview session not found."
            ),
        )

    return {
        "success": True,

        "session":
            serialize_session(
                session
            ),
    }


# ============================================================
# GET /latest-report
# ============================================================


@router.get(
    "/latest-report"
)
def get_latest_report(
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        get_current_user
    ),
):

    session = (
        db.query(
            InterviewSession
        )
        .filter(
            InterviewSession.user_id
            == current_user.id
        )
        .order_by(
            InterviewSession.created_at
            .desc()
        )
        .first()
    )

    if not session:

        raise HTTPException(
            status_code=404,
            detail=(
                "No interview report found."
            ),
        )

    return {
        "success": True,

        "session_id":
            str(
                session.id
            ),

        "report":
            safe_json_loads(
                session.final_report,
                {},
            ),

        "session":
            serialize_session(
                session
            ),
    }


# ============================================================
# GET /playback/{session_id}
# ============================================================


@router.get(
    "/playback/{session_id}"
)
def get_interview_playback(
    session_id: int,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        get_current_user
    ),
):

    session = (
        db.query(
            InterviewSession
        )
        .filter(
            InterviewSession.id
            == session_id,

            InterviewSession.user_id
            == current_user.id,
        )
        .first()
    )

    if not session:

        raise HTTPException(
            status_code=404,
            detail=(
                "Playback session not found."
            ),
        )

    questions = safe_json_loads(
        session.questions,
        [],
    )

    answers = safe_json_loads(
        session.answers,
        [],
    )

    evaluations = safe_json_loads(
        session.evaluations,
        [],
    )

    timeline = []

    max_items = max(
        len(
            questions
        ),
        len(
            answers
        ),
        len(
            evaluations
        ),
    )

    for index in range(
        max_items
    ):

        timeline.append(
            {
                "index": index,

                "question":
                    (
                        questions[index]
                        if index
                        < len(questions)
                        else None
                    ),

                "answer":
                    (
                        answers[index]
                        if index
                        < len(answers)
                        else None
                    ),

                "evaluation":
                    (
                        evaluations[index]
                        if index
                        < len(evaluations)
                        else None
                    ),
            }
        )

    return {
        "success": True,

        "session_id":
            str(
                session.id
            ),

        "role":
            session.role,

        "level":
            session.level,

        "timeline":
            timeline,

        "final_report":
            safe_json_loads(
                session.final_report,
                {},
            ),
    }


# ============================================================
# GET /health
# ============================================================


@router.get(
    "/health"
)
def interview_health():

    return {
        "success": True,

        "service":
            "Interview AI",

        "features": [
            "ai_question_generation",
            "ai_answer_evaluation",
            "adaptive_followup_questions",
            "speech_aware_evaluation",
            "ai_final_report",
            "interview_persistence",
        ],
    }