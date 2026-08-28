# ============================================================
# ENVIRONMENT - MUST BE LOADED FIRST
# ============================================================

import os

from dotenv import load_dotenv


# IMPORTANT:
# Load .env before importing route files.
# override=True ensures the values in backend/.env are used.

load_dotenv(
    override=True
)


print(
    "ACTIVE GROQ MODEL:",
    os.getenv(
        "GROQ_MODEL",
        "NOT SET"
    )
)


# ============================================================
# FASTAPI
# ============================================================

from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
)

from fastapi.middleware.cors import (
    CORSMiddleware,
)

from fastapi.staticfiles import (
    StaticFiles,
)

from pydantic import (
    BaseModel,
)

from sqlalchemy.orm import (
    Session,
)


# ============================================================
# DATABASE
# ============================================================

from app.database import (
    Base,
    engine,
    get_db,
)

from app.models import (
    User,
)


# ============================================================
# SECURITY
# ============================================================

from app.security import (
    hash_password,
    verify_password,
    create_access_token,
)


# ============================================================
# ROUTERS
# ============================================================

from app.routes.profile import (
    router as profile_router,
)

from app.routes.progress import (
    router as progress_router,
)

from app.routes.scheduler import (
    router as scheduler_router,
)

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

from app.routes.settings import (
    router as settings_router,
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
    settings_router
)


app.include_router(
    candidate_router,

    prefix="/api",

    tags=[
        "Candidate Intelligence"
    ],
)


app.include_router(
    resume_router,

    prefix="/api",

    tags=[
        "Resume"
    ],
)


app.include_router(
    notes_router
)


app.include_router(
    interview_router,

    prefix="/api/interview",

    tags=[
        "Interview"
    ],
)


app.include_router(
    progress_router
)


app.include_router(
    profile_router,

    prefix="/api"
)


app.include_router(
    speech_router,

    tags=[
        "Speech Intelligence"
    ],
)


app.include_router(
    scheduler_router
)


app.include_router(
    notifications_router
)


app.include_router(
    hiring_router,

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


# ============================================================
# STATIC FILES
# ============================================================

os.makedirs(
    "uploads",
    exist_ok=True
)


app.mount(
    "/uploads",

    StaticFiles(
        directory="uploads"
    ),

    name="uploads",
)


# ============================================================
# DASHBOARD
# ============================================================

app.include_router(
    dashboard_router,

    tags=[
        "Dashboard"
    ],
)


# ============================================================
# CANDIDATE SCORE
# ============================================================

app.include_router(
    candidate_score_router,

    prefix="/api",

    tags=[
        "Candidate Score"
    ],
)


# ============================================================
# CODING INTERVIEW
# ============================================================

app.include_router(
    coding_router,

    tags=[
        "Coding Interview"
    ],
)


# ============================================================
# REPORTS
# ============================================================

app.include_router(
    report_router,

    tags=[
        "Reports"
    ],
)


# ============================================================
# REQUEST MODELS
# ============================================================

class SignupRequest(
    BaseModel
):

    username: str

    email: str

    password: str


class LoginRequest(
    BaseModel
):

    email: str

    password: str


class InterviewRequest(
    BaseModel
):

    role: str

    level: str


# ============================================================
# ROOT
# ============================================================

@app.get("/")
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

@app.get("/health")
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

@app.post("/auth/signup")
def signup(

    data: SignupRequest,

    db: Session = Depends(
        get_db
    ),

):

    existing_email = (

        db.query(
            User
        )

        .filter(

            User.email
            == data.email

        )

        .first()

    )


    if existing_email:

        raise HTTPException(

            status_code=409,

            detail=
                "Email already registered.",

        )


    existing_username = (

        db.query(
            User
        )

        .filter(

            User.username
            == data.username

        )

        .first()

    )


    if existing_username:

        raise HTTPException(

            status_code=409,

            detail=
                "Username already registered.",

        )


    hashed_password = hash_password(
        data.password
    )


    user = User(

        username=data.username,

        email=data.email,

        password=hashed_password,

    )


    db.add(
        user
    )


    db.commit()


    db.refresh(
        user
    )


    token = create_access_token({

        "sub":
            user.email,

    })


    return {

        "message":
            "Signup successful",

        "token":
            token,

        "user": {

            "id":
                user.id,

            "username":
                user.username,

            "email":
                user.email,

        },

    }


# ============================================================
# AUTH - LOGIN
# ============================================================

@app.post("/auth/login")
def login(

    data: LoginRequest,

    db: Session = Depends(
        get_db
    ),

):

    user = (

        db.query(
            User
        )

        .filter(

            User.email
            == data.email

        )

        .first()

    )


    if not user:

        raise HTTPException(

            status_code=401,

            detail=
                "Invalid email or password.",

        )


    valid_password = verify_password(

        data.password,

        user.password,

    )


    if not valid_password:

        raise HTTPException(

            status_code=401,

            detail=
                "Invalid email or password.",

        )


    token = create_access_token({

        "sub":
            user.email,

    })


    return {

        "message":
            "Login successful",

        "token":
            token,

        "user": {

            "id":
                user.id,

            "username":
                user.username,

            "email":
                user.email,

        },

    }


# ============================================================
# QUESTION GENERATION
# ============================================================

@app.post("/generate-questions")
def generate_questions(

    data: InterviewRequest,

):

    questions = [

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


    return {

        "role":
            data.role,

        "level":
            data.level,

        "questions":
            questions,

    }