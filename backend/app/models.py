from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)

from sqlalchemy.orm import relationship

from app.database import Base


# ============================================================
# USER
# ============================================================

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    username = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    password = Column(
        String(255),
        nullable=False,
    )

    profile_image = Column(
        String(500),
        nullable=True,
    )

    headline = Column(
        String(255),
        nullable=True,
    )

    bio = Column(
        Text,
        nullable=True,
    )

    location = Column(
        String(255),
        nullable=True,
    )

    website = Column(
        String(500),
        nullable=True,
    )

    linkedin_url = Column(
        String(500),
        nullable=True,
    )

    github_url = Column(
        String(500),
        nullable=True,
    )

    preferred_role = Column(
        String(255),
        nullable=True,
    )

    experience_level = Column(
        String(100),
        nullable=True,
    )

    target_industry = Column(
        String(255),
        nullable=True,
    )

    onboarding_completed = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    interview_sessions = relationship(
        "InterviewSession",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    coding_sessions = relationship(
        "CodingSession",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    settings = relationship(
        "UserSettings",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )


# ============================================================
# USER SETTINGS
# ============================================================

class UserSettings(Base):

    __tablename__ = "user_settings"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        unique=True,
        nullable=False,
        index=True,
    )

    # ========================================================
    # APPEARANCE
    # ========================================================

    theme = Column(
        String(30),
        default="dark",
        nullable=False,
    )

    accent_color = Column(
        String(30),
        default="purple",
        nullable=False,
    )

    compact_mode = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    animations_enabled = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    # ========================================================
    # NOTIFICATIONS
    # ========================================================

    email_notifications = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    interview_reminders = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    performance_notifications = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    product_updates = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    # ========================================================
    # AI PREFERENCES
    # ========================================================

    ai_feedback_level = Column(
        String(30),
        default="detailed",
        nullable=False,
    )

    ai_response_style = Column(
        String(30),
        default="professional",
        nullable=False,
    )

    ai_suggestions_enabled = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    interview_difficulty = Column(
        String(30),
        default="adaptive",
        nullable=False,
    )

    # ========================================================
    # PRIVACY
    # ========================================================

    profile_visibility = Column(
        String(30),
        default="private",
        nullable=False,
    )

    analytics_tracking = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    data_collection = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    ai_training_consent = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    # ========================================================
    # SECURITY
    # ========================================================

    two_factor_enabled = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    login_alerts = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    # ========================================================
    # TIMESTAMPS
    # ========================================================

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="settings",
    )


# ============================================================
# INTERVIEW SESSION
# ============================================================

class InterviewSession(Base):

    __tablename__ = "interview_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=True,
        index=True,
    )

    role = Column(
        String(255),
        nullable=False,
        default="General Interview",
    )

    level = Column(
        String(100),
        nullable=False,
        default="Intermediate",
    )

    interview_type = Column(
        String(100),
        nullable=True,
    )

    questions = Column(
        Text,
        default="[]",
        nullable=False,
    )

    answers = Column(
        Text,
        default="[]",
        nullable=False,
    )

    evaluations = Column(
        Text,
        default="[]",
        nullable=False,
    )

    final_report = Column(
        Text,
        nullable=True,
    )

    status = Column(
        String(50),
        default="completed",
        nullable=False,
    )

    is_paused = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    current_question_index = Column(
        Integer,
        default=0,
        nullable=False,
    )

    overall_score = Column(
        Float,
        default=0.0,
    )

    technical_score = Column(
        Float,
        default=0.0,
    )

    communication_score = Column(
        Float,
        default=0.0,
    )

    confidence_score = Column(
        Float,
        default=0.0,
    )

    relevance_score = Column(
        Float,
        default=0.0,
    )

    candidate_score = Column(
        Float,
        default=0.0,
    )

    hiring_probability = Column(
        Float,
        default=0.0,
    )

    resume_score = Column(
        Float,
        default=0.0,
    )

    jd_match_score = Column(
        Float,
        default=0.0,
    )

    resume_analysis = Column(
        Text,
        nullable=True,
    )

    jd_analysis = Column(
        Text,
        nullable=True,
    )

    speech_score = Column(
        Float,
        default=0.0,
    )

    filler_words = Column(
        Integer,
        default=0,
    )

    speaking_speed = Column(
        Float,
        default=0.0,
    )

    pause_score = Column(
        Float,
        default=0.0,
    )

    pronunciation_score = Column(
        Float,
        default=0.0,
    )

    clarity_score = Column(
        Float,
        default=0.0,
    )

    vision_score = Column(
        Float,
        default=0.0,
    )

    eye_contact_score = Column(
        Float,
        default=0.0,
    )

    attention_score = Column(
        Float,
        default=0.0,
    )

    engagement_score = Column(
        Float,
        default=0.0,
    )

    posture_score = Column(
        Float,
        default=0.0,
    )

    vision_analysis = Column(
        Text,
        nullable=True,
    )

    recruiter_recommendation = Column(
        String(100),
        nullable=True,
    )

    recruiter_notes = Column(
        Text,
        nullable=True,
    )

    expected_salary = Column(
        String(255),
        nullable=True,
    )

    strengths = Column(
        Text,
        default="[]",
    )

    improvement_areas = Column(
        Text,
        default="[]",
    )

    certificate_id = Column(
        String(255),
        nullable=True,
        index=True,
    )

    certificate_generated = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    completed_at = Column(
        DateTime,
        nullable=True,
    )

    user = relationship(
        "User",
        back_populates="interview_sessions",
    )


# ============================================================
# CODING SESSION
# ============================================================

class CodingSession(Base):

    __tablename__ = "coding_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=True,
        index=True,
    )

    language = Column(
        String(100),
        nullable=True,
    )

    problem_title = Column(
        String(500),
        nullable=True,
    )

    problem_description = Column(
        Text,
        nullable=True,
    )

    starter_code = Column(
        Text,
        nullable=True,
    )

    submitted_code = Column(
        Text,
        nullable=True,
    )

    output = Column(
        Text,
        nullable=True,
    )

    status = Column(
        String(100),
        default="completed",
    )

    score = Column(
        Float,
        default=0.0,
    )

    feedback = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="coding_sessions",
    )


# ============================================================
# USER NOTES
# ============================================================

class UserNote(Base):

    __tablename__ = "user_notes"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    title = Column(
        String,
        nullable=False,
        default="Untitled Note",
    )

    content = Column(
        Text,
        default="",
    )

    category = Column(
        String,
        default="General",
    )

    color = Column(
        String,
        default="default",
    )

    is_pinned = Column(
        Boolean,
        default=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


# ============================================================
# USER NOTIFICATIONS
# ============================================================

class UserNotification(Base):

    __tablename__ = "user_notifications"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    title = Column(
        String,
        nullable=False,
    )

    message = Column(
        Text,
        nullable=False,
    )

    notification_type = Column(
        String,
        default="system",
    )

    icon = Column(
        String,
        nullable=True,
    )

    action_url = Column(
        String,
        nullable=True,
    )

    is_read = Column(
        Boolean,
        default=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )


# ============================================================
# INTERVIEW SCHEDULER
# ============================================================

class InterviewSchedule(Base):

    __tablename__ = "interview_schedules"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    title = Column(
        String,
        nullable=False,
    )

    role = Column(
        String,
        nullable=False,
    )

    level = Column(
        String,
        default="Intermediate",
    )

    company = Column(
        String,
        nullable=True,
    )

    interview_type = Column(
        String,
        default="Mock Interview",
    )

    scheduled_at = Column(
        DateTime,
        nullable=False,
    )

    duration_minutes = Column(
        Integer,
        default=30,
    )

    reminder_minutes = Column(
        Integer,
        default=30,
    )

    notes = Column(
        Text,
        nullable=True,
    )

    status = Column(
        String,
        default="scheduled",
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )