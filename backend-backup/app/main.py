import os

from dotenv import load_dotenv
from app.routes import auth
from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
)
from app.routes.profile import (
    router as profile_router,
)
from fastapi.middleware.cors import CORSMiddleware
from app.routes.progress import (
    router as progress_router,
)
from pydantic import BaseModel
from app.routes.settings import (
    router as settings_router,
)

from app.routes.scheduler import (
    router as scheduler_router,
)

from app.database import (
    Base,
    engine,
    get_db,
)
from sqlalchemy.orm import Session
from fastapi.staticfiles import StaticFiles

from app.routes.notes import (
    router as notes_router,
)

from app.routes.notifications import (
    router as notifications_router,
)
from app.routes.candidate import (
    router as candidate_router,
)

from app.routes.analytics import (
    router as analytics_router,
)

from app.routes.speech import (
    router as speech_router,
)

from app.routes.history import (
    router as history_router,
)

from app.routes.certificate import (
    router as certificate_router,
)

from app.routes.leaderboard import (
    router as leaderboard_router,
)

from app.routes.recruiter import (
    router as recruiter_router,
)

from app.routes.dashboard import (
    router as dashboard_router,
)

from app.routes.resume import (
    router as resume_router,
)

from app.routes.hiring import (
    router as hiring_router,
)

from app.routes.admin import (
    router as admin_router,
)

from app.routes.copilot import (
    router as copilot_router,
)

from app.routes.interview import (
    router as interview_router,
)

from app.routes.candidate_score import (
    router as candidate_score_router,
)

from app.routes.coding import (
    router as coding_router,
)

from app.routes.report import (
    router as report_router,
)

from app.routes.vision import (
    router as vision_router,
)

from app.routes.interview import (
    get_latest_report as _get_latest_report_fn,
)

from app.routes.admin import (
    get_admin_dashboard as _get_admin_dashboard_fn,
)

from app.models import User, InterviewSession
from app.security import get_current_user
from app.services.groq_service import ask_groq, ask_groq_json


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()


# ============================================================
# APP
# ============================================================

app = FastAPI(

    title="HireSense AI API",

    description=(
        "AI-powered recruitment, "
        "resume analysis and interview platform."
    ),

    version="1.0.0",

)


# ============================================================
# DATABASE
# ============================================================

Base.metadata.create_all(
    bind=engine
)


# ============================================================
# CORS
# ============================================================

frontend_url = os.getenv(

    "FRONTEND_URL",

    "http://localhost:5173",

)


allowed_origins = [

    "http://localhost:5173",

    "http://127.0.0.1:5173",

]


if frontend_url not in allowed_origins:

    allowed_origins.append(
        frontend_url
    )


app.add_middleware(

    CORSMiddleware,

    allow_origins=allowed_origins,

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)


# ============================================================
# ROUTERS
# ============================================================

app.include_router(

    copilot_router,

    prefix="/api",

    tags=[
        "AI Copilot"
    ],

)

app.include_router(
    # auth.py already declares prefix="/auth" internally.
    # This used to be mounted with an extra prefix="/api" here,
    # which produced /api/auth/signup and /api/auth/login while the
    # frontend calls /auth/signup and /auth/login directly - login
    # and signup were completely broken. Mount with no extra prefix.
    auth.router,
)
app.include_router(

    # candidate.py already declares prefix="/api/candidate" internally.
    # Mounting with an additional prefix="/api" here produced
    # /api/api/candidate/intelligence, a 404 for the frontend's
    # actual call to /api/candidate/intelligence. Mount with no
    # extra prefix.
    candidate_router,

    tags=[
        "Candidate Intelligence"
    ],

)
app.include_router(
    settings_router
)

app.include_router(

    resume_router,

    prefix="/api",

    tags=[
        "Resume"
    ],

)
app.include_router(
    notes_router,
)

app.include_router(

    interview_router,

    prefix="/api/interview",

    tags=[
        "Interview"
    ],

)
app.include_router(
    progress_router,
)
app.include_router(
    # profile.py already declares prefix="/api/profile" internally.
    # The extra prefix="/api" here produced /api/api/profile/*.
    profile_router,
)
app.include_router(

    # speech.py declares prefix="/speech" internally. The frontend
    # calls POST /api/speech/analyze, so this needs an /api prefix
    # to line up (it was previously mounted at /speech/analyze,
    # a 404 for every resume/interview speech-analysis upload).
    speech_router,

    prefix="/api",

    tags=[
        "Speech Intelligence"
    ],

)
app.include_router(

    # vision.py existed as a complete, working implementation but was
    # never imported or mounted anywhere in main.py, so every request
    # from the Vision Analysis page 404'd. vision.py declares its own
    # prefix="/vision" internally, matching the frontend's
    # POST /vision/analyze call exactly.
    vision_router,

    tags=[
        "Vision Intelligence"
    ],

)
app.include_router(
    scheduler_router,
)
app.include_router(
    notifications_router,
)

app.include_router(

    # hiring.py declares its route as GET /hiring-probability, computed
    # from a user's stored interview sessions. The frontend's
    # getHiringProbability() helper instead POSTs
    # {confidence, communication, technical} to /api/hiring-probability
    # and expects a probability back for those ad-hoc scores. Both are
    # legitimate, different features, so both are kept: the existing
    # session-based GET is preserved (now under /api to stay
    # consistent), and a new POST handler matching the frontend's
    # contract is added further below at the same final path.
    hiring_router,

    prefix="/api",

    tags=[
        "Hiring Intelligence"
    ],

)


app.include_router(

    history_router,

    tags=[
        "Interview History"
    ],

)


app.include_router(

    analytics_router,

    tags=[
        "Analytics"
    ],

)


# ============================================================
# RECRUITER INTELLIGENCE
#
# IMPORTANT:
# recruiter.py does NOT contain /api in route decorators.
# main.py adds /api exactly once.
# ============================================================

app.include_router(

    recruiter_router,

    prefix="/api",

    tags=[
        "Recruiter Intelligence"
    ],

)


app.include_router(

    admin_router,

    tags=[
        "Admin"
    ],

)


app.include_router(

    leaderboard_router,

    tags=[
        "Leaderboard"
    ],

)


app.include_router(

    certificate_router,

    tags=[
        "Certificates"
    ],

)

app.mount(
    "/uploads",
    StaticFiles(
        directory="uploads",
    ),
    name="uploads",
)
app.include_router(

    dashboard_router,

    tags=[
        "Dashboard"
    ],

)


app.include_router(

    candidate_score_router,

    prefix="/api",

    tags=[
        "Candidate Score"
    ],

)


app.include_router(

    coding_router,

    tags=[
        "Coding Interview"
    ],

)


app.include_router(

    report_router,

    tags=[
        "Reports"
    ],

)


# ============================================================
# REQUEST MODELS
# ============================================================




class InterviewRequest(
    BaseModel
):

    role: str

    level: str


# ============================================================
# ROOT
# ============================================================

@app.get(
    "/"
)
def home():

    return {

        "message":
            "HireSense AI Backend Running",

        "version":
            "1.0.0",

        "status":
            "online",

    }


# ============================================================
# HEALTH
# ============================================================

@app.get(
    "/health"
)
def health():

    return {

        "status":
            "ok",

        "service":
            "HireSense AI Backend",

    }


# ============================================================
# AUTH - SIGNUP
# ============================================================

 


# ============================================================
# QUESTION GENERATION
# ============================================================

@app.post(
    "/generate-questions"
)
def generate_questions(

    data: InterviewRequest,

):

    fallback_questions = [

        (
            f"Tell me about yourself "
            f"as a {data.role}."
        ),

        (
            f"Why do you want this "
            f"{data.role} role?"
        ),

        (
            "Explain a challenging "
            "project you worked on."
        ),

        (
            "How do you solve difficult "
            "technical problems?"
        ),

        (
            "Where do you see yourself "
            "in 5 years?"
        ),

    ]

    questions = fallback_questions

    try:
        ai_result = ask_groq_json(
            prompt=(
                f"Generate exactly 5 interview questions for a "
                f"{data.level} level {data.role} candidate. Mix "
                f"behavioral and technical questions relevant to "
                f"the role. Respond as a JSON object: "
                f'{{"questions": ["question 1", "question 2", ...]}}'
            ),
            system_prompt=(
                "You are an expert technical interviewer creating "
                "an interview question set."
            ),
            temperature=0.6,
        )

        ai_questions = (
            ai_result.get("questions")
            if isinstance(ai_result, dict)
            else ai_result
        )

        if (
            isinstance(ai_questions, list)
            and len(ai_questions) >= 3
            and all(isinstance(q, str) and q.strip() for q in ai_questions)
        ):
            questions = ai_questions

    except Exception as error:
        # GROQ_API_KEY missing, rate limited, or malformed response -
        # fall back to the static question set so the interview flow
        # never breaks for the user.
        print("generate_questions AI fallback:", str(error))

    return {

        "role":
            data.role,

        "level":
            data.level,

        "questions":
            questions,

    }


# ============================================================
# COMPATIBILITY ENDPOINTS
#
# These fill genuine gaps found while auditing the frontend's
# actual API calls against the backend: paths the frontend calls
# that had no matching route anywhere in the codebase. Rather than
# duplicate business logic, each one delegates to the existing,
# already-implemented handler for the equivalent data.
# ============================================================

@app.get("/admin/stats")
def admin_stats(db: Session = Depends(get_db)):
    """
    AdminPanel.tsx calls GET /admin/stats and reads a flat shape:
    total_interviews, average_score, recommended_candidates,
    top_score, total_users, active_users. No route anywhere in the
    codebase served this path (admin.py's routes all live under
    /api/admin/*, e.g. /api/admin/dashboard, which returns a
    differently-shaped nested payload). This computes the flat
    shape the page actually expects, directly from the same models
    the rest of the admin dashboard uses.
    """

    total_users = db.query(User).count()

    active_users = (
        db.query(User)
        .filter(User.is_active.is_(True))
        .count()
    )

    sessions = db.query(InterviewSession).all()

    total_interviews = len(sessions)

    scored_sessions = [
        s for s in sessions if (s.overall_score or 0) > 0
    ]

    average_score = (
        round(
            sum(s.overall_score or 0 for s in scored_sessions)
            / len(scored_sessions),
            1,
        )
        if scored_sessions
        else 0
    )

    top_score = (
        round(max(s.overall_score or 0 for s in sessions), 1)
        if sessions
        else 0
    )

    recommended_candidates = sum(
        1
        for s in sessions
        if (s.hiring_probability or 0) >= 70
        or (s.candidate_score or 0) >= 70
        or (
            (s.recruiter_recommendation or "").lower().startswith(
                ("strong", "positive", "recommend")
            )
        )
    )

    return {
        "total_users": total_users,
        "total_candidates": total_users,
        "active_users": active_users,
        "total_interviews": total_interviews,
        "completed_interviews": total_interviews,
        "average_score": average_score,
        "top_score": top_score,
        "recommended_candidates": recommended_candidates,
    }


@app.get("/final-report")
def final_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Reports.tsx / getFinalReport() calls GET /final-report, which had
    no matching route. This is the same data as
    GET /api/interview/latest-report - delegate straight to that
    handler instead of re-implementing the query.
    """
    return _get_latest_report_fn(
        db=db,
        current_user=current_user,
    )


class HiringProbabilityRequest(BaseModel):
    confidence: float
    communication: float
    technical: float


@app.post("/api/hiring-probability")
def compute_hiring_probability(data: HiringProbabilityRequest):
    """
    getHiringProbability(confidence, communication, technical) POSTs
    three ad-hoc scores and expects a computed probability back. The
    existing GET /api/hiring-probability (see hiring.py) instead
    aggregates a user's persisted interview sessions - a different,
    still-useful feature that is kept as-is. This adds the POST
    variant the frontend actually calls, at the same path.
    """

    def clamp(value: float) -> int:
        try:
            return max(0, min(100, int(round(float(value)))))
        except (TypeError, ValueError):
            return 0

    confidence = clamp(data.confidence)
    communication = clamp(data.communication)
    technical = clamp(data.technical)

    probability = clamp(
        technical * 0.45
        + communication * 0.30
        + confidence * 0.25
    )

    if probability >= 85:
        level = "Excellent"
    elif probability >= 75:
        level = "Strong"
    elif probability >= 60:
        level = "Moderate"
    elif probability >= 45:
        level = "Low"
    else:
        level = "Very Low"

    fallback_recommendation = {
        "Excellent": (
            "Strong recommendation. The candidate demonstrates high "
            "overall interview readiness across technical, "
            "communication and confidence dimensions."
        ),
        "Strong": (
            "Positive recommendation. The candidate is approaching "
            "strong interview readiness with a few areas that can "
            "still be improved through targeted practice."
        ),
        "Moderate": (
            "Potential candidate. More focused practice is "
            "recommended before high-stakes interviews."
        ),
        "Low": (
            "Additional preparation is recommended before the "
            "candidate is considered interview-ready."
        ),
        "Very Low": (
            "Significant preparation is recommended across "
            "technical, communication and confidence dimensions."
        ),
    }[level]

    recommendation = fallback_recommendation

    try:
        recommendation = ask_groq(
            prompt=f"""
Confidence: {confidence}/100
Communication: {communication}/100
Technical: {technical}/100
Computed hiring probability: {probability}/100 ({level})

Write a 2-3 sentence hiring recommendation for a recruiter, grounded
specifically in these three scores. Write it directly, with no
preamble.
""",
            system_prompt=(
                "You are an AI hiring analyst writing a recommendation "
                "for a recruiter based on structured candidate scores."
            ),
            temperature=0.4,
            max_tokens=250,
        ).strip() or fallback_recommendation

    except Exception as error:
        print(
            "compute_hiring_probability AI fallback "
            "(templated recommendation will be used):",
            error,
        )

    return {
        "probability": probability,
        "hiring_probability": probability,
        "level": level,
        "recommendation": recommendation,
        "breakdown": {
            "confidence": confidence,
            "communication": communication,
            "technical": technical,
        },
    }