import json

from datetime import datetime

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
    User,
)

from app.dependencies import get_current_user


router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"],
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

        return round(
            float(value),
            2,
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


def parse_json_value(
    value,
    default,
):

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


def get_session_date(
    session: InterviewSession,
):

    completed_at = getattr(
        session,
        "completed_at",
        None,
    )

    if completed_at:

        return completed_at

    updated_at = getattr(
        session,
        "updated_at",
        None,
    )

    if updated_at:

        return updated_at

    return getattr(
        session,
        "created_at",
        None,
    )


# ============================================================
# SCORE CALCULATOR
# ============================================================

def calculate_overall_score(
    session: InterviewSession,
) -> float:

    existing_score = clamp_score(
        getattr(
            session,
            "overall_score",
            None,
        )
    )

    if existing_score > 0:

        return existing_score

    weighted_scores = []

    score_fields = [

        (
            "technical_score",
            0.30,
        ),

        (
            "communication_score",
            0.20,
        ),

        (
            "confidence_score",
            0.15,
        ),

        (
            "relevance_score",
            0.20,
        ),

        (
            "speech_score",
            0.075,
        ),

        (
            "vision_score",
            0.075,
        ),
    ]

    total_weight = 0.0

    weighted_total = 0.0

    for field, weight in score_fields:

        value = clamp_score(
            getattr(
                session,
                field,
                None,
            )
        )

        if value > 0:

            weighted_total += (
                value
                * weight
            )

            total_weight += weight

    if total_weight == 0:

        candidate_score = clamp_score(
            getattr(
                session,
                "candidate_score",
                None,
            )
        )

        return candidate_score

    return round(
        weighted_total
        / total_weight,
        2,
    )


# ============================================================
# PERFORMANCE LEVEL
# ============================================================

def get_performance_level(
    score: float,
) -> str:

    if score >= 90:

        return "Exceptional"

    if score >= 80:

        return "Excellent"

    if score >= 70:

        return "Strong"

    if score >= 60:

        return "Good"

    if score >= 50:

        return "Developing"

    return "Needs Improvement"


# ============================================================
# HIRING RECOMMENDATION
# ============================================================

def get_hiring_recommendation(
    score: float,
) -> dict:

    if score >= 85:

        return {

            "recommendation":
                "Strong Hire",

            "status":
                "highly_recommended",

            "confidence":
                "High",

            "description":
                (
                    "The candidate demonstrates "
                    "strong interview readiness and "
                    "consistent performance across "
                    "key evaluation areas."
                ),
        }

    if score >= 75:

        return {

            "recommendation":
                "Hire",

            "status":
                "recommended",

            "confidence":
                "High",

            "description":
                (
                    "The candidate demonstrates "
                    "solid technical and communication "
                    "capabilities with good overall "
                    "interview performance."
                ),
        }

    if score >= 65:

        return {

            "recommendation":
                "Consider",

            "status":
                "consider",

            "confidence":
                "Medium",

            "description":
                (
                    "The candidate shows promising "
                    "performance but should improve "
                    "specific weaker areas before "
                    "high-stakes interviews."
                ),
        }

    if score >= 50:

        return {

            "recommendation":
                "Further Development Needed",

            "status":
                "development_required",

            "confidence":
                "Medium",

            "description":
                (
                    "The candidate has a reasonable "
                    "foundation but needs additional "
                    "practice and targeted preparation."
                ),
        }

    return {

        "recommendation":
            "Not Ready Yet",

        "status":
            "not_recommended",

        "confidence":
            "Low",

        "description":
            (
                "The candidate should focus on "
                "fundamental interview preparation "
                "before proceeding to important "
                "recruitment interviews."
            ),
    }


# ============================================================
# SKILL ANALYSIS
# ============================================================

def build_skill_analysis(
    session: InterviewSession,
):

    skills = [

        {
            "name":
                "Technical Skills",

            "key":
                "technical_score",

            "description":
                (
                    "Technical understanding, "
                    "problem-solving and role "
                    "specific knowledge."
                ),
        },

        {
            "name":
                "Communication",

            "key":
                "communication_score",

            "description":
                (
                    "Clarity, structure and "
                    "effectiveness of responses."
                ),
        },

        {
            "name":
                "Confidence",

            "key":
                "confidence_score",

            "description":
                (
                    "Confidence, composure and "
                    "ability to present answers."
                ),
        },

        {
            "name":
                "Answer Relevance",

            "key":
                "relevance_score",

            "description":
                (
                    "How accurately and directly "
                    "responses addressed questions."
                ),
        },

        {
            "name":
                "Speech Performance",

            "key":
                "speech_score",

            "description":
                (
                    "Pacing, fluency, filler-word "
                    "usage and speaking clarity."
                ),
        },

        {
            "name":
                "Visual Presence",

            "key":
                "vision_score",

            "description":
                (
                    "Attention, engagement, posture "
                    "and visual interview presence."
                ),
        },
    ]

    results = []

    for skill in skills:

        score = clamp_score(
            getattr(
                session,
                skill["key"],
                None,
            )
        )

        results.append({

            "name":
                skill["name"],

            "score":
                score,

            "level":
                get_performance_level(
                    score
                ),

            "description":
                skill["description"],
        })

    return results


# ============================================================
# STRENGTHS ANALYSIS
# ============================================================

def generate_strengths(
    skill_analysis,
):

    strengths = []

    for skill in skill_analysis:

        if skill["score"] >= 75:

            strengths.append({

                "area":
                    skill["name"],

                "score":
                    skill["score"],

                "description":
                    (
                        f"Strong performance in "
                        f"{skill['name'].lower()} "
                        f"demonstrates reliable "
                        f"interview capability."
                    ),
            })

    return strengths


# ============================================================
# IMPROVEMENT ANALYSIS
# ============================================================

def generate_improvements(
    skill_analysis,
):

    improvements = []

    improvement_advice = {

        "Technical Skills":
            (
                "Practice deeper technical explanations, "
                "real-world examples and structured "
                "problem-solving."
            ),

        "Communication":
            (
                "Use structured answers such as STAR "
                "and avoid unnecessarily long responses."
            ),

        "Confidence":
            (
                "Practice speaking aloud and simulate "
                "real interview pressure more frequently."
            ),

        "Answer Relevance":
            (
                "Focus on directly answering the "
                "question before expanding with examples."
            ),

        "Speech Performance":
            (
                "Reduce filler words and maintain "
                "consistent pacing."
            ),

        "Visual Presence":
            (
                "Maintain eye contact, upright posture "
                "and consistent engagement."
            ),
    }

    for skill in skill_analysis:

        if skill["score"] < 70:

            improvements.append({

                "area":
                    skill["name"],

                "score":
                    skill["score"],

                "priority":
                    (
                        "High"
                        if skill["score"] < 50
                        else "Medium"
                    ),

                "recommendation":
                    improvement_advice.get(
                        skill["name"],
                        (
                            "Continue practicing "
                            "this skill area."
                        ),
                    ),
            })

    return improvements


# ============================================================
# ANSWER ANALYSIS
# ============================================================

def build_answer_summary(
    session: InterviewSession,
):

    questions = parse_json_value(

        getattr(
            session,
            "questions",
            None,
        ),

        [],
    )

    answers = parse_json_value(

        getattr(
            session,
            "answers",
            None,
        ),

        [],
    )

    evaluations = parse_json_value(

        getattr(
            session,
            "evaluations",
            None,
        ),

        [],
    )

    result = []

    max_items = max(

        len(questions),

        len(answers),

        len(evaluations),

        0,
    )

    for index in range(
        max_items
    ):

        question = (

            questions[index]

            if index < len(questions)

            else None
        )

        answer = (

            answers[index]

            if index < len(answers)

            else None
        )

        evaluation = (

            evaluations[index]

            if index < len(evaluations)

            else None
        )

        result.append({

            "index":
                index + 1,

            "question":
                question,

            "answer":
                answer,

            "evaluation":
                evaluation,
        })

    return result


# ============================================================
# FULL REPORT BUILDER
# ============================================================

def build_full_report(
    session: InterviewSession,
):

    overall_score = (
        calculate_overall_score(
            session
        )
    )

    skill_analysis = (
        build_skill_analysis(
            session
        )
    )

    strengths = generate_strengths(
        skill_analysis
    )

    improvements = generate_improvements(
        skill_analysis
    )

    stored_strengths = parse_json_value(

        getattr(
            session,
            "strengths",
            None,
        ),

        [],
    )

    stored_improvements = parse_json_value(

        getattr(
            session,
            "improvement_areas",
            None,
        ),

        [],
    )

    if stored_strengths:

        strengths = stored_strengths

    if stored_improvements:

        improvements = stored_improvements

    hiring_probability = clamp_score(

        getattr(
            session,
            "hiring_probability",
            None,
        )
    )

    if hiring_probability == 0:

        hiring_probability = overall_score

    recommendation = (
        getattr(
            session,
            "recruiter_recommendation",
            None,
        )
        or get_hiring_recommendation(
            overall_score
        )["recommendation"]
    )

    recruiter_notes = (
        getattr(
            session,
            "recruiter_notes",
            None,
        )
        or (
            "Performance analysis generated "
            "from the candidate's interview "
            "evaluation data."
        )
    )

    session_date = get_session_date(
        session
    )

    return {

        "session_id":
            session.id,

        "generated_at":
            datetime.utcnow().isoformat(),

        "candidate": {

            "user_id":
                getattr(
                    session,
                    "user_id",
                    None,
                ),
        },

        "interview": {

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

            "date":
                (
                    session_date.isoformat()
                    if session_date
                    else None
                ),
        },

        "overall_assessment": {

            "score":
                overall_score,

            "level":
                get_performance_level(
                    overall_score
                ),

            "hiring_probability":
                hiring_probability,

            "recommendation":
                recommendation,

            "recruiter_notes":
                recruiter_notes,
        },

        "skill_analysis":
            skill_analysis,

        "strengths":
            strengths,

        "improvement_areas":
            improvements,

        "answer_analysis":
            build_answer_summary(
                session
            ),

        "next_steps": [

            (
                "Review the weakest skill "
                "areas identified in this report."
            ),

            (
                "Practice another mock interview "
                "focused on the target role."
            ),

            (
                "Compare future performance "
                "against this baseline score."
            ),
        ],
    }


# ============================================================
# GET ALL REPORTS
# ============================================================

@router.get("/")
def get_reports(
    limit: int = Query(
        default=50,
        ge=1,
        le=200,
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

    reports = []

    for session in sessions:

        overall_score = (
            calculate_overall_score(
                session
            )
        )

        session_date = get_session_date(
            session
        )

        reports.append({

            "session_id":
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

            "score":
                overall_score,

            "performance_level":
                get_performance_level(
                    overall_score
                ),

            "status":
                getattr(
                    session,
                    "status",
                    None,
                ),

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

        "reports":
            reports,

        "total":
            len(
                reports
            ),
    }


# ============================================================
# REPORT SUMMARY
# ============================================================

@router.get(
    "/summary"
)
def get_report_summary(
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
            InterviewSession.created_at.asc()
        )

        .all()
    )

    if not sessions:

        return {

            "success":
                True,

            "summary": {

                "total_reports":
                    0,

                "average_score":
                    0,

                "best_score":
                    0,

                "latest_score":
                    0,

                "improvement":
                    0,

                "latest_recommendation":
                    None,
            },
        }

    scores = [

        calculate_overall_score(
            session
        )

        for session
        in sessions
    ]

    valid_scores = [

        score

        for score
        in scores

        if score > 0
    ]

    average_score = (

        round(
            sum(
                valid_scores
            )
            / len(
                valid_scores
            ),
            2,
        )

        if valid_scores

        else 0
    )

    best_score = (

        max(
            valid_scores
        )

        if valid_scores

        else 0
    )

    latest_score = (

        valid_scores[-1]

        if valid_scores

        else 0
    )

    first_score = (

        valid_scores[0]

        if valid_scores

        else 0
    )

    improvement = (

        round(
            latest_score
            - first_score,
            2,
        )

        if len(
            valid_scores
        ) > 1

        else 0
    )

    latest_session = sessions[-1]

    latest_recommendation = (

        getattr(
            latest_session,
            "recruiter_recommendation",
            None,
        )

        or get_hiring_recommendation(
            latest_score
        )["recommendation"]
    )

    return {

        "success":
            True,

        "summary": {

            "total_reports":
                len(
                    sessions
                ),

            "average_score":
                average_score,

            "best_score":
                best_score,

            "latest_score":
                latest_score,

            "improvement":
                improvement,

            "latest_recommendation":
                latest_recommendation,
        },
    }


# ============================================================
# GET SINGLE REPORT
# ============================================================

@router.get(
    "/{session_id}"
)
def get_report(
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
                "Interview report "
                "not found."
            ),
        )

    return {

        "success":
            True,

        "report":
            build_full_report(
                session
            ),
    }


# ============================================================
# REPORT EXPORT DATA
# ============================================================

@router.get(
    "/{session_id}/export"
)
def export_report_data(
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
                "Interview report "
                "not found."
            ),
        )

    report = build_full_report(
        session
    )

    return {

        "success":
            True,

        "filename":
            (
                f"hiresense_report_"
                f"{session.id}.json"
            ),

        "report":
            report,
    }
