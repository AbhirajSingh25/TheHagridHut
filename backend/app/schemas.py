from datetime import datetime
from typing import List, Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


# ============================================================
# AUTH
# ============================================================

class SignupRequest(BaseModel):

    username: str = Field(
        min_length=2,
        max_length=100,
    )

    email: str = Field(
        min_length=3,
        max_length=255,
    )

    password: str = Field(
        min_length=6,
        max_length=128,
    )


class LoginRequest(BaseModel):

    email: str = Field(
        min_length=3,
        max_length=255,
    )

    password: str = Field(
        min_length=1,
        max_length=128,
    )


# ============================================================
# INTERVIEW
# ============================================================

class QuestionRequest(BaseModel):

    role: str


class AnswerRequest(BaseModel):

    question: str

    answer: str

    history: List[dict] = Field(
        default_factory=list,
    )


class InterviewSessionRequest(BaseModel):

    user_id: int

    role: str

    transcript: str

    confidence_score: float

    communication_score: float

    words_per_minute: float

    eye_contact_score: float

    technical_score: float = 80

    attention_status: str

    ai_feedback: str = ""


# ============================================================
# SPEECH
# ============================================================

class SpeechRequest(BaseModel):

    transcript: str


# ============================================================
# RESUME
# ============================================================

class ResumeReportResponse(BaseModel):

    id: int

    overall_score: float

    ats_score: float

    report: dict

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


# ============================================================
# CODING
# ============================================================

class CodingSessionCreate(BaseModel):

    interview_id: Optional[int] = None

    role: str

    level: str

    language: str

    question: str

    solution: str = ""

    score: int = 0

    time_complexity: str = ""

    space_complexity: str = ""

    execution_result: str = ""

    ai_feedback: str = ""


class CodingSessionResponse(BaseModel):

    id: int

    interview_id: Optional[int] = None

    role: str

    level: str

    language: str

    question: str

    solution: str

    score: int

    time_complexity: str

    space_complexity: str

    execution_result: str

    ai_feedback: str

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


# ============================================================
# RECRUITER
# ============================================================

class RecruiterAnalysisRequest(BaseModel):

    session_id: int

    resume_report: dict

    jd_report: dict

    interview_report: dict

    coding_report: dict = Field(
        default_factory=dict,
    )


# ============================================================
# GENERIC RESPONSE
# ============================================================

class MessageResponse(BaseModel):

    message: str


# ============================================================
# SETTINGS - ACCOUNT
# ============================================================

class AccountSettingsUpdate(BaseModel):

    full_name: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    username: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    headline: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    bio: Optional[str] = Field(
        default=None,
        max_length=5000,
    )

    location: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    website: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    linkedin_url: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    github_url: Optional[str] = Field(
        default=None,
        max_length=500,
    )


class AccountSettingsResponse(BaseModel):

    id: int

    username: Optional[str] = None

    email: Optional[str] = None

    full_name: Optional[str] = None

    headline: Optional[str] = None

    bio: Optional[str] = None

    location: Optional[str] = None

    website: Optional[str] = None

    linkedin_url: Optional[str] = None

    github_url: Optional[str] = None

    profile_image: Optional[str] = None

    model_config = ConfigDict(
        from_attributes=True,
    )


# ============================================================
# SETTINGS - PASSWORD
# ============================================================

class ChangePasswordRequest(BaseModel):

    current_password: str = Field(
        min_length=1,
        max_length=128,
    )

    new_password: str = Field(
        min_length=6,
        max_length=128,
    )


PasswordChangeRequest = ChangePasswordRequest


# ============================================================
# SETTINGS - APPEARANCE
# ============================================================

class AppearanceSettingsUpdate(BaseModel):

    theme: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    accent_color: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    compact_mode: Optional[bool] = None

    animations_enabled: Optional[bool] = None


class AppearanceSettingsResponse(BaseModel):

    theme: str

    accent_color: str

    compact_mode: bool

    animations_enabled: bool


# ============================================================
# SETTINGS - NOTIFICATIONS
# ============================================================

class NotificationSettingsUpdate(BaseModel):

    email_notifications: Optional[bool] = None

    interview_reminders: Optional[bool] = None

    performance_notifications: Optional[bool] = None

    product_updates: Optional[bool] = None


class NotificationSettingsResponse(BaseModel):

    email_notifications: bool

    interview_reminders: bool

    performance_notifications: bool

    product_updates: bool


NotificationPreferencesUpdate = NotificationSettingsUpdate


# ============================================================
# SETTINGS - AI PREFERENCES
# ============================================================

class AIPreferencesUpdate(BaseModel):

    ai_feedback_level: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    ai_response_style: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    ai_suggestions_enabled: Optional[bool] = None

    interview_difficulty: Optional[str] = Field(
        default=None,
        max_length=30,
    )


class AIPreferencesResponse(BaseModel):

    ai_feedback_level: str

    ai_response_style: str

    ai_suggestions_enabled: bool

    interview_difficulty: str


# ============================================================
# SETTINGS - PRIVACY
# ============================================================

class PrivacySettingsUpdate(BaseModel):

    profile_visibility: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    analytics_tracking: Optional[bool] = None

    data_collection: Optional[bool] = None

    ai_training_consent: Optional[bool] = None


class PrivacySettingsResponse(BaseModel):

    profile_visibility: str

    analytics_tracking: bool

    data_collection: bool

    ai_training_consent: bool


PrivacyPreferencesUpdate = PrivacySettingsUpdate


# ============================================================
# SETTINGS - SECURITY
# ============================================================

class SecuritySettingsUpdate(BaseModel):

    two_factor_enabled: Optional[bool] = None

    login_alerts: Optional[bool] = None


class SecuritySettingsResponse(BaseModel):

    two_factor_enabled: bool

    login_alerts: bool


# ============================================================
# SETTINGS - DATA
# ============================================================

class DataSettingsUpdate(BaseModel):

    data_collection: Optional[bool] = None

    analytics_tracking: Optional[bool] = None

    ai_training_consent: Optional[bool] = None


class DataSettingsResponse(BaseModel):

    data_collection: bool

    analytics_tracking: bool

    ai_training_consent: bool


# ============================================================
# SETTINGS - COMPLETE RESPONSE
# ============================================================

class SettingsResponse(BaseModel):

    account: AccountSettingsResponse

    appearance: AppearanceSettingsResponse

    notifications: NotificationSettingsResponse

    ai_preferences: AIPreferencesResponse

    privacy: PrivacySettingsResponse

    security: SecuritySettingsResponse

    data: DataSettingsResponse


# ============================================================
# SETTINGS - DATABASE RESPONSE
# ============================================================

class UserSettingsResponse(BaseModel):

    id: int

    user_id: int

    theme: str

    accent_color: str

    compact_mode: bool

    animations_enabled: bool

    email_notifications: bool

    interview_reminders: bool

    performance_notifications: bool

    product_updates: bool

    ai_feedback_level: str

    ai_response_style: str

    ai_suggestions_enabled: bool

    interview_difficulty: str

    profile_visibility: str

    analytics_tracking: bool

    data_collection: bool

    ai_training_consent: bool

    two_factor_enabled: bool

    login_alerts: bool

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )