import json
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from pydantic import BaseModel

from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import (
    InterviewSession,
    User,
)
from app.services.groq_service import ask_groq, ask_groq_json


# ============================================================
# ROUTER
# ============================================================

router = APIRouter()


# ============================================================
# HELPERS
# ============================================================

def safe_json_loads(
    value: Optional[str],
    default: Any,
):
    """
    Safely convert JSON database strings.
    """

    if not value:
        return default

    try:

        return json.loads(
            value
        )

    except Exception:

        return default


def safe_json_dumps(
    value: Any,
):
    """
    Safely convert Python objects
    into JSON strings for PostgreSQL.
    """

    try:

        return json.dumps(
            value,
            default=str,
        )

    except Exception:

        return json.dumps(
            {}
        )


def calculate_average(
    values: List[float],
):
    """
    Calculate a safe average.
    """

    valid_values = [
        float(value)
        for value in values
        if value is not None
    ]

    if not valid_values:
        return 0.0

    return round(
        sum(valid_values)
        / len(valid_values),
        2,
    )


def clamp_score(
    value: Any,
    minimum: float = 0,
    maximum: float = 100,
):
    """
    Ensure a score remains
    between 0 and 100.
    """

    try:

        score = float(
            value
        )

    except Exception:

        score = 0.0

    return round(
        max(
            minimum,
            min(
                maximum,
                score,
            ),
        ),
        2,
    )


def ai_evaluate_answer(
    question: str,
    answer: str,
) -> Optional[Dict[str, Any]]:
    """
    Ask Groq to evaluate an interview answer and return a structured
    score/feedback dict. Returns None (never raises) if the AI call
    fails or the response doesn't have the shape we need, so callers
    can fall back to the deterministic heuristic scoring below.
    """

    try:
        result = ask_groq_json(
            prompt=f"""
Evaluate this interview answer.

QUESTION:
{question}

CANDIDATE ANSWER:
{answer}

Score each dimension from 0 to 100 based on the actual content of
the answer. Be honest and discriminating - do not default to
similar scores for every answer.

Return a JSON object with exactly these keys:
{{
  "technical_score": number,
  "communication_score": number,
  "confidence_score": number,
  "relevance_score": number,
  "strengths": ["short specific point", ...],
  "improvements": ["short specific point", ...],
  "feedback": "2-3 sentence feedback on this specific answer"
}}
""",
            system_prompt=(
                "You are an expert technical interviewer evaluating "
                "a candidate's spoken interview answer. Be specific "
                "to what the candidate actually said, not generic."
            ),
            temperature=0.3,
        )

        if not isinstance(result, dict):
            return None

        required_numeric_keys = [
            "technical_score",
            "communication_score",
            "confidence_score",
            "relevance_score",
        ]

        for key in required_numeric_keys:
            float(result.get(key))

        strengths = result.get("strengths", [])
        improvements = result.get("improvements", [])
        feedback = result.get("feedback", "")

        if not isinstance(strengths, list):
            strengths = []

        if not isinstance(improvements, list):
            improvements = []

        if not isinstance(feedback, str) or not feedback.strip():
            feedback = (
                "The response has been evaluated across technical "
                "relevance, communication and confidence."
            )

        return {
            "technical_score": clamp_score(result["technical_score"]),
            "communication_score": clamp_score(
                result["communication_score"]
            ),
            "confidence_score": clamp_score(result["confidence_score"]),
            "relevance_score": clamp_score(result["relevance_score"]),
            "strengths": [str(s) for s in strengths if str(s).strip()][:5],
            "improvements": [
                str(s) for s in improvements if str(s).strip()
            ][:5],
            "feedback": feedback.strip(),
        }

    except Exception as error:
        print("ai_evaluate_answer fallback (heuristic will be used):", error)
        return None


def serialize_session(
    session: InterviewSession,
):
    """
    Convert an InterviewSession database
    object into a frontend-safe response.
    """

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
            session.user_id,

        "role":
            session.role,

        "level":
            session.level,

        "interview_type":
            session.interview_type,

        "questions":
            safe_json_loads(
                session.questions,
                [],
            ),

        "answers":
            safe_json_loads(
                session.answers,
                [],
            ),

        "evaluations":
            safe_json_loads(
                session.evaluations,
                [],
            ),

        "final_report":
            safe_json_loads(
                session.final_report,
                {},
            ),

        "status":
            session.status,

        "is_paused":
            bool(
                session.is_paused
            ),

        "current_question_index":
            session.current_question_index
            or 0,

        "overall_score":
            session.overall_score
            or 0,

        "technical_score":
            session.technical_score
            or 0,

        "communication_score":
            session.communication_score
            or 0,

        "confidence_score":
            session.confidence_score
            or 0,

        "relevance_score":
            session.relevance_score
            or 0,

        "candidate_score":
            session.candidate_score
            or 0,

        "hiring_probability":
            session.hiring_probability
            or 0,

        "resume_score":
            session.resume_score
            or 0,

        "jd_match_score":
            session.jd_match_score
            or 0,

        "resume_analysis":
            safe_json_loads(
                session.resume_analysis,
                {},
            ),

        "jd_analysis":
            safe_json_loads(
                session.jd_analysis,
                {},
            ),

        "speech_score":
            session.speech_score
            or 0,

        "filler_words":
            session.filler_words
            or 0,

        "speaking_speed":
            session.speaking_speed
            or 0,

        "pause_score":
            session.pause_score
            or 0,

        "pronunciation_score":
            session.pronunciation_score
            or 0,

        "clarity_score":
            session.clarity_score
            or 0,

        "vision_score":
            session.vision_score
            or 0,

        "eye_contact_score":
            session.eye_contact_score
            or 0,

        "attention_score":
            session.attention_score
            or 0,

        "engagement_score":
            session.engagement_score
            or 0,

        "posture_score":
            session.posture_score
            or 0,

        "vision_analysis":
            safe_json_loads(
                session.vision_analysis,
                {},
            ),

        "recruiter_recommendation":
            session.recruiter_recommendation,

        "recruiter_notes":
            session.recruiter_notes,

        "expected_salary":
            session.expected_salary,

        "strengths":
            safe_json_loads(
                session.strengths,
                [],
            ),

        "improvement_areas":
            safe_json_loads(
                session.improvement_areas,
                [],
            ),

        "certificate_id":
            session.certificate_id,

        "certificate_generated":
            bool(
                session.certificate_generated
            ),

        "created_at":
            (
                session.created_at.isoformat()
                if session.created_at
                else None
            ),

        "updated_at":
            (
                session.updated_at.isoformat()
                if session.updated_at
                else None
            ),

        "completed_at":
            (
                session.completed_at.isoformat()
                if session.completed_at
                else None
            ),
    }


# ============================================================
# REQUEST MODELS
# ============================================================

class AnswerEvaluationRequest(
    BaseModel
):

    question: str

    answer: str

    speech_metrics: Optional[
        Dict[str, Any]
    ] = None


class FollowupQuestionRequest(
    BaseModel
):

    role: str = "General"

    level: str = "Intermediate"

    question: str

    answer: str


class InterviewReportRequest(
    BaseModel
):

    role: str

    level: str

    questions: List[str]

    answers: List[str]

    evaluations: List[Any]


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
# EVALUATE ANSWER
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
    """
    Evaluate an interview answer.

    This endpoint is user-protected and
    returns the frontend-compatible
    evaluation structure.
    """

    answer = (
        data.answer
        or ""
    ).strip()

    question = (
        data.question
        or ""
    ).strip()

    if not answer:

        raise HTTPException(
            status_code=400,
            detail=(
                "Answer cannot be empty."
            ),
        )


    answer_words = (
        len(
            answer.split()
        )
    )


    length_score = min(
        100,
        answer_words * 2.5,
    )


    communication_score = clamp_score(
        45
        + (
            length_score * 0.45
        )
    )


    relevance_score = clamp_score(
        50
        + (
            min(
                answer_words,
                100,
            )
            * 0.45
        )
    )


    technical_keywords = [
        "algorithm",
        "database",
        "api",
        "system",
        "performance",
        "optimization",
        "architecture",
        "python",
        "java",
        "sql",
        "machine learning",
        "security",
        "cloud",
        "data",
        "implementation",
    ]


    answer_lower = (
        answer.lower()
    )


    keyword_matches = sum(
        1
        for keyword
        in technical_keywords
        if keyword
        in answer_lower
    )


    technical_score = clamp_score(
        40
        + (
            keyword_matches
            * 8
        )
    )


    confidence_score = clamp_score(
        50
        + min(
            35,
            answer_words * 0.35,
        )
    )


    filler_words_list = [
        "um",
        "uh",
        "like",
        "basically",
        "actually",
    ]


    filler_count = sum(
        answer_lower.count(
            filler
        )
        for filler
        in filler_words_list
    )


    # --- Try a real AI evaluation first ---
    # If Groq is configured and responds with a valid, well-formed
    # evaluation, use its scores/strengths/improvements/feedback
    # instead of the keyword-counting heuristic above. The heuristic
    # values computed above remain as the fallback if the AI call
    # fails, times out, or returns something malformed - the
    # endpoint should never break just because the AI provider is
    # unavailable.
    ai_result = ai_evaluate_answer(
        question=question,
        answer=answer,
    )

    ai_feedback = None
    ai_strengths = None
    ai_improvements = None

    if ai_result:
        technical_score = ai_result["technical_score"]
        communication_score = ai_result["communication_score"]
        confidence_score = ai_result["confidence_score"]
        relevance_score = ai_result["relevance_score"]
        ai_feedback = ai_result["feedback"]
        ai_strengths = ai_result["strengths"] or None
        ai_improvements = ai_result["improvements"] or None


    if data.speech_metrics:

        confidence_score = clamp_score(
            data.speech_metrics.get(
                "confidence_score",
                confidence_score,
            )
        )

        communication_score = clamp_score(
            data.speech_metrics.get(
                "communication_score",
                communication_score,
            )
        )

        filler_count = int(
            data.speech_metrics.get(
                "filler_words",
                filler_count,
            )
        )


    overall_score = calculate_average(
        [
            technical_score,
            communication_score,
            relevance_score,
            confidence_score,
        ]
    )


    strengths = ai_strengths or []

    improvements = ai_improvements or []

    if not ai_strengths and not ai_improvements:

        if technical_score >= 70:

            strengths.append(
                "Demonstrates relevant technical understanding."
            )

        else:

            improvements.append(
                "Add more specific technical concepts and examples."
            )


        if communication_score >= 70:

            strengths.append(
                "Communicates ideas clearly."
            )

        else:

            improvements.append(
                "Structure the answer more clearly using a beginning, explanation and conclusion."
            )


        if relevance_score >= 70:

            strengths.append(
                "Answer is relevant to the question."
            )

        else:

            improvements.append(
                "Focus more directly on the question being asked."
            )


        if confidence_score >= 70:

            strengths.append(
                "Shows a reasonably confident response style."
            )

        else:

            improvements.append(
                "Use stronger and more confident language."
            )


    return {

        "success":
            True,

        "evaluation": {

            "question":
                question,

            "technical_score":
                technical_score,

            "communication_score":
                communication_score,

            "confidence_score":
                confidence_score,

            "relevance_score":
                relevance_score,

            "overall_score":
                overall_score,

            "filler_words":
                filler_count,

            "strengths":
                strengths,

            "improvements":
                improvements,

            "feedback":
                ai_feedback
                or (
                    "The response has been evaluated "
                    "across technical relevance, "
                    "communication and confidence."
                ),

            "ai_generated":
                ai_result is not None,
        },
    }


# ============================================================
# GENERATE FOLLOW-UP QUESTION
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
    """
    Generate an adaptive follow-up question.
    """

    role = (
        data.role
        or "General"
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


    answer_words = (
        len(
            answer.split()
        )
    )


    followup = None

    try:
        ai_followup = ask_groq(
            prompt=f"""
Role: {role}
Level: {data.level}

Previous Question:
{data.question}

Candidate Answer:
{answer}

Generate ONE adaptive, intelligent follow-up interview question that
digs deeper into what the candidate just said. Ask only the question
itself, with no preamble, numbering, or quotation marks.
""",
            system_prompt=(
                "You are an expert technical interviewer running a "
                "live, adaptive interview."
            ),
            temperature=0.7,
            max_tokens=200,
        )

        ai_followup = ai_followup.strip().strip('"')

        if ai_followup and len(ai_followup) < 500:
            followup = ai_followup

    except Exception as error:
        print(
            "generate_followup_question AI fallback "
            "(template will be used):",
            error,
        )

    if not followup:

        if answer_words < 20:

            followup = (
                f"You mentioned that briefly. "
                f"Could you explain in more detail "
                f"how you would apply this as a "
                f"{role}?"
            )

        elif answer_words < 60:

            followup = (
                f"Can you provide a real example "
                f"from your experience related to "
                f"your answer for this {role} role?"
            )

        else:

            followup = (
                f"Suppose your approach did not work "
                f"as expected. How would you identify "
                f"the problem and improve the solution "
                f"as a {role}?"
            )


    return {

        "success":
            True,

        "question":
            followup,

        "followup_question":
            followup,

        "role":
            role,

        "level":
            data.level,
    }


# ============================================================
# GENERATE FINAL REPORT
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
    """
    Generate the final interview report.
    """

    evaluations = (
        data.evaluations
        or []
    )


    technical_scores = []

    communication_scores = []

    confidence_scores = []

    relevance_scores = []

    overall_scores = []


    strengths = []

    improvements = []


    for evaluation in evaluations:

        if isinstance(
            evaluation,
            dict,
        ):

            technical_scores.append(
                evaluation.get(
                    "technical_score",
                    0,
                )
            )

            communication_scores.append(
                evaluation.get(
                    "communication_score",
                    0,
                )
            )

            confidence_scores.append(
                evaluation.get(
                    "confidence_score",
                    0,
                )
            )

            relevance_scores.append(
                evaluation.get(
                    "relevance_score",
                    0,
                )
            )

            overall_scores.append(
                evaluation.get(
                    "overall_score",
                    0,
                )
            )

            strengths.extend(
                evaluation.get(
                    "strengths",
                    [],
                )
            )

            improvements.extend(
                evaluation.get(
                    "improvements",
                    [],
                )
            )


    technical_score = calculate_average(
        technical_scores
    )

    communication_score = calculate_average(
        communication_scores
    )

    confidence_score = calculate_average(
        confidence_scores
    )

    relevance_score = calculate_average(
        relevance_scores
    )


    overall_score = (
        calculate_average(
            overall_scores
        )
    )


    if overall_score == 0:

        overall_score = calculate_average(
            [
                technical_score,
                communication_score,
                confidence_score,
                relevance_score,
            ]
        )


    if overall_score >= 85:

        recommendation = (
            "Strong Hire"
        )

    elif overall_score >= 70:

        recommendation = (
            "Hire"
        )

    elif overall_score >= 55:

        recommendation = (
            "Consider"
        )

    else:

        recommendation = (
            "Needs Improvement"
        )


    unique_strengths = list(
        dict.fromkeys(
            strengths
        )
    )[:5]


    unique_improvements = list(
        dict.fromkeys(
            improvements
        )
    )[:5]


    ai_summary = None

    try:
        ai_summary = ask_groq(
            prompt=f"""
Candidate role: {data.role} ({data.level})
Overall score: {overall_score}/100
Technical: {technical_score}/100
Communication: {communication_score}/100
Confidence: {confidence_score}/100
Relevance: {relevance_score}/100
Recommendation: {recommendation}

Key strengths observed:
{chr(10).join(f"- {s}" for s in unique_strengths) or "- None recorded"}

Areas for improvement:
{chr(10).join(f"- {i}" for i in unique_improvements) or "- None recorded"}

Write a concise, professional 3-4 sentence overall interview summary
for this candidate, referencing the specific scores and points above.
Write it directly, with no preamble like "Here is a summary".
""",
            system_prompt=(
                "You are an expert technical recruiter writing the "
                "closing summary of a candidate's interview report."
            ),
            temperature=0.4,
            max_tokens=400,
        )

        ai_summary = ai_summary.strip()

        if not ai_summary or len(ai_summary) > 2000:
            ai_summary = None

    except Exception as error:
        print(
            "generate_report AI summary fallback "
            "(templated summary will be used):",
            error,
        )

    if not ai_summary:
        ai_summary = (
            f"This {data.level} {data.role} candidate scored "
            f"{overall_score}/100 overall, with a recommendation of "
            f"'{recommendation}'. Technical ability scored "
            f"{technical_score}/100 and communication scored "
            f"{communication_score}/100 across "
            f"{len(data.answers)} answered questions."
        )


    report = {

        "role":
            data.role,

        "level":
            data.level,

        "overall_score":
            overall_score,

        "technical_score":
            technical_score,

        "communication_score":
            communication_score,

        "confidence_score":
            confidence_score,

        "relevance_score":
            relevance_score,

        "recommendation":
            recommendation,

        "strengths":
            unique_strengths,

        "improvement_areas":
            unique_improvements,

        "summary":
            ai_summary,

        "questions_answered":
            len(
                data.answers
            ),

        "generated_at":
            datetime.utcnow()
            .isoformat(),
    }


    return {

        "success":
            True,

        "report":
            report,
    }


# ============================================================
# SAVE INTERVIEW
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
    """
    Save an interview session.

    The user_id is ALWAYS taken from
    the JWT-authenticated user.

    The frontend cannot choose another
    user's ID.
    """

    evaluations = (
        data.evaluations
        or []
    )


    final_report = (
        data.final_report
        or {}
    )


    technical_score = clamp_score(
        final_report.get(
            "technical_score",
            0,
        )
    )


    communication_score = clamp_score(
        final_report.get(
            "communication_score",
            0,
        )
    )


    confidence_score = clamp_score(
        final_report.get(
            "confidence_score",
            0,
        )
    )


    relevance_score = clamp_score(
        final_report.get(
            "relevance_score",
            0,
        )
    )


    overall_score = clamp_score(
        final_report.get(
            "overall_score",
            0,
        )
    )


    if overall_score == 0:

        evaluation_scores = []

        for evaluation in evaluations:

            if isinstance(
                evaluation,
                dict,
            ):

                evaluation_scores.append(
                    evaluation.get(
                        "overall_score",
                        0,
                    )
                )


        overall_score = calculate_average(
            evaluation_scores
        )


    candidate_score = clamp_score(
        data.candidate_score
        or overall_score
    )


    certificate_id = (
        data.certificate_id
        or f"HS-{uuid.uuid4().hex[:12].upper()}"
    )


    session = InterviewSession(

        user_id=
            current_user.id,

        role=
            data.role,

        level=
            data.level,

        interview_type=
            data.interview_type
            or "mock",

        questions=
            safe_json_dumps(
                data.questions
            ),

        answers=
            safe_json_dumps(
                data.answers
            ),

        evaluations=
            safe_json_dumps(
                evaluations
            ),

        final_report=
            safe_json_dumps(
                final_report
            ),

        status=
            "completed",

        is_paused=
            False,

        current_question_index=
            len(
                data.answers
            ),

        overall_score=
            overall_score,

        technical_score=
            technical_score,

        communication_score=
            communication_score,

        confidence_score=
            confidence_score,

        relevance_score=
            relevance_score,

        candidate_score=
            candidate_score,

        hiring_probability=
            clamp_score(
                data.hiring_probability
                or overall_score
            ),

        resume_score=
            clamp_score(
                data.resume_score
            ),

        jd_match_score=
            clamp_score(
                data.jd_match_score
            ),

        speech_score=
            clamp_score(
                data.speech_score
            ),

        filler_words=
            data.filler_words
            or 0,

        speaking_speed=
            float(
                data.speaking_speed
                or 0
            ),

        pause_score=
            clamp_score(
                data.pause_score
            ),

        pronunciation_score=
            clamp_score(
                data.pronunciation_score
            ),

        clarity_score=
            clamp_score(
                data.clarity_score
            ),

        vision_score=
            clamp_score(
                data.vision_score
            ),

        eye_contact_score=
            clamp_score(
                data.eye_contact_score
            ),

        attention_score=
            clamp_score(
                data.attention_score
            ),

        engagement_score=
            clamp_score(
                data.engagement_score
            ),

        posture_score=
            clamp_score(
                data.posture_score
            ),

        recruiter_recommendation=
            data.recruiter_recommendation
            or final_report.get(
                "recommendation"
            ),

        recruiter_notes=
            data.recruiter_notes,

        expected_salary=
            data.expected_salary,

        strengths=
            safe_json_dumps(
                final_report.get(
                    "strengths",
                    [],
                )
            ),

        improvement_areas=
            safe_json_dumps(
                final_report.get(
                    "improvement_areas",
                    [],
                )
            ),

        certificate_id=
            certificate_id,

        certificate_generated=
            True,

        completed_at=
            datetime.utcnow(),
    )


    db.add(
        session
    )

    db.commit()

    db.refresh(
        session
    )


    return {

        "success":
            True,

        "message":
            (
                "Interview session saved "
                "successfully."
            ),

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
# GET USER INTERVIEW HISTORY
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
    """
    Return only the authenticated
    user's interview sessions.
    """

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

        "success":
            True,

        "total":
            len(
                sessions
            ),

        "sessions":
            [
                serialize_session(
                    session
                )
                for session
                in sessions
            ],
    }


# ============================================================
# GET SINGLE SESSION
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
    """
    Return a session only when it belongs
    to the authenticated user.
    """

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

        "success":
            True,

        "session":
            serialize_session(
                session
            ),
    }


# ============================================================
# GET LATEST REPORT
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
    """
    Return only the authenticated user's
    latest completed interview report.
    """

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

        "success":
            True,

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
# PLAYBACK
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
    """
    Return playback data only for the
    authenticated user's own session.
    """

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

        timeline.append({

            "index":
                index,

            "question":
                (
                    questions[index]
                    if index
                    < len(
                        questions
                    )
                    else None
                ),

            "answer":
                (
                    answers[index]
                    if index
                    < len(
                        answers
                    )
                    else None
                ),

            "evaluation":
                (
                    evaluations[index]
                    if index
                    < len(
                        evaluations
                    )
                    else None
                ),
        })


    return {

        "success":
            True,

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