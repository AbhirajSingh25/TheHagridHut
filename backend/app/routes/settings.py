from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.models import (
    User,
    UserSettings,
)

from app.schemas import (
    AccountSettingsUpdate,
    AppearanceSettingsUpdate,
    NotificationSettingsUpdate,
    AIPreferencesUpdate,
    PrivacySettingsUpdate,
    SecuritySettingsUpdate,
    ChangePasswordRequest,
    SettingsResponse,
)

from app.utils.auth import (
    get_current_user,
    verify_password,
    get_password_hash,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/settings",
    tags=["Settings"],
)


# ============================================================
# VALID VALUES
# ============================================================

VALID_THEMES = [
    "dark",
    "light",
    "system",
]

VALID_ACCENT_COLORS = [
    "cyan",
    "blue",
    "purple",
    "green",
    "orange",
    "pink",
    "red",
]

VALID_FEEDBACK_LEVELS = [
    "brief",
    "balanced",
    "detailed",
]

VALID_AI_RESPONSE_STYLES = [
    "professional",
    "friendly",
    "direct",
    "encouraging",
]

VALID_INTERVIEW_DIFFICULTIES = [
    "easy",
    "medium",
    "hard",
    "adaptive",
]

VALID_PROFILE_VISIBILITY = [
    "public",
    "private",
]


# ============================================================
# GET OR CREATE USER SETTINGS
# ============================================================

def get_or_create_settings(
    user_id: int,
    db: Session,
):

    settings = (
        db.query(UserSettings)
        .filter(
            UserSettings.user_id == user_id
        )
        .first()
    )

    if settings is None:

        settings = UserSettings(
            user_id=user_id,
        )

        db.add(settings)

        db.commit()

        db.refresh(settings)

    return settings


# ============================================================
# SERIALIZE COMPLETE SETTINGS
# ============================================================

def build_settings_response(
    user: User,
    settings: UserSettings,
):

    return {

        "account": {

            "id": user.id,

            "username": user.username,

            "email": user.email,

            "full_name": (
                getattr(
                    user,
                    "full_name",
                    None,
                )
            ),

            "headline": user.headline,

            "bio": user.bio,

            "location": user.location,

            "website": user.website,

            "linkedin_url": user.linkedin_url,

            "github_url": user.github_url,

            "profile_image": user.profile_image,

        },

        "appearance": {

            "theme": settings.theme,

            "accent_color": settings.accent_color,

            "compact_mode": settings.compact_mode,

            "animations_enabled": (
                settings.animations_enabled
            ),

        },

        "notifications": {

            "email_notifications": (
                settings.email_notifications
            ),

            "interview_reminders": (
                settings.interview_reminders
            ),

            "performance_notifications": (
                settings.performance_notifications
            ),

            "product_updates": (
                settings.product_updates
            ),

        },

        "ai_preferences": {

            "ai_feedback_level": (
                settings.ai_feedback_level
            ),

            "ai_response_style": (
                settings.ai_response_style
            ),

            "ai_suggestions_enabled": (
                settings.ai_suggestions_enabled
            ),

            "interview_difficulty": (
                settings.interview_difficulty
            ),

        },

        "privacy": {

            "profile_visibility": (
                settings.profile_visibility
            ),

            "analytics_tracking": (
                settings.analytics_tracking
            ),

            "data_collection": (
                settings.data_collection
            ),

            "ai_training_consent": (
                settings.ai_training_consent
            ),

        },

        "security": {

            "two_factor_enabled": (
                settings.two_factor_enabled
            ),

            "login_alerts": (
                settings.login_alerts
            ),

        },

        "data": {

            "data_collection": (
                settings.data_collection
            ),

            "analytics_tracking": (
                settings.analytics_tracking
            ),

            "ai_training_consent": (
                settings.ai_training_consent
            ),

        },

    }


# ============================================================
# GET ALL SETTINGS
# ============================================================

@router.get(
    "",
    response_model=SettingsResponse,
)
def get_settings(

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),

):

    settings = get_or_create_settings(
        user_id=current_user.id,
        db=db,
    )

    return build_settings_response(
        user=current_user,
        settings=settings,
    )


# ============================================================
# GET ACCOUNT SETTINGS
# ============================================================

@router.get(
    "/account",
)
def get_account_settings(

    current_user: User = Depends(
        get_current_user
    ),

):

    return {

        "id": current_user.id,

        "username": current_user.username,

        "email": current_user.email,

        "full_name": getattr(
            current_user,
            "full_name",
            None,
        ),

        "headline": current_user.headline,

        "bio": current_user.bio,

        "location": current_user.location,

        "website": current_user.website,

        "linkedin_url": current_user.linkedin_url,

        "github_url": current_user.github_url,

        "profile_image": current_user.profile_image,

    }


# ============================================================
# UPDATE ACCOUNT SETTINGS
# ============================================================

@router.put(
    "/account",
)
def update_account_settings(

    data: AccountSettingsUpdate,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),

):

    update_data = data.model_dump(
        exclude_unset=True
    )

    if (
        "username" in update_data
        and update_data["username"]
    ):

        existing_user = (
            db.query(User)
            .filter(
                User.username
                == update_data["username"],

                User.id
                != current_user.id,
            )
            .first()
        )

        if existing_user:

            raise HTTPException(
                status_code=400,

                detail=(
                    "Username is already taken"
                ),
            )

        current_user.username = (
            update_data["username"]
        )

    if (
        "full_name" in update_data
        and hasattr(
            current_user,
            "full_name",
        )
    ):

        current_user.full_name = (
            update_data["full_name"]
        )

    if "headline" in update_data:

        current_user.headline = (
            update_data["headline"]
        )

    if "bio" in update_data:

        current_user.bio = (
            update_data["bio"]
        )

    if "location" in update_data:

        current_user.location = (
            update_data["location"]
        )

    if "website" in update_data:

        current_user.website = (
            update_data["website"]
        )

    if "linkedin_url" in update_data:

        current_user.linkedin_url = (
            update_data["linkedin_url"]
        )

    if "github_url" in update_data:

        current_user.github_url = (
            update_data["github_url"]
        )

    current_user.updated_at = (
        datetime.utcnow()
    )

    db.commit()

    db.refresh(
        current_user
    )

    return {

        "message": (
            "Account settings updated successfully"
        ),

        "account": {

            "id": current_user.id,

            "username": (
                current_user.username
            ),

            "email": (
                current_user.email
            ),

            "headline": (
                current_user.headline
            ),

            "bio": (
                current_user.bio
            ),

            "location": (
                current_user.location
            ),

            "website": (
                current_user.website
            ),

            "linkedin_url": (
                current_user.linkedin_url
            ),

            "github_url": (
                current_user.github_url
            ),

            "profile_image": (
                current_user.profile_image
            ),

        },

    }


# ============================================================
# CHANGE PASSWORD
# ============================================================

@router.put(
    "/password",
)
def change_password(

    data: ChangePasswordRequest,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),

):

    password_valid = verify_password(
        data.current_password,
        current_user.password,
    )

    if not password_valid:

        raise HTTPException(

            status_code=400,

            detail=(
                "Current password is incorrect"
            ),

        )

    current_user.password = (
        get_password_hash(
            data.new_password
        )
    )

    current_user.updated_at = (
        datetime.utcnow()
    )

    db.commit()

    return {

        "message": (
            "Password changed successfully"
        ),

    }


# ============================================================
# GET APPEARANCE SETTINGS
# ============================================================

@router.get(
    "/appearance",
)
def get_appearance_settings(

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),

):

    settings = get_or_create_settings(
        user_id=current_user.id,
        db=db,
    )

    return {

        "theme": settings.theme,

        "accent_color": (
            settings.accent_color
        ),

        "compact_mode": (
            settings.compact_mode
        ),

        "animations_enabled": (
            settings.animations_enabled
        ),

    }


# ============================================================
# UPDATE APPEARANCE SETTINGS
# ============================================================

@router.put(
    "/appearance",
)
def update_appearance_settings(

    data: AppearanceSettingsUpdate,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),

):

    settings = get_or_create_settings(
        user_id=current_user.id,
        db=db,
    )

    update_data = data.model_dump(
        exclude_unset=True
    )

    if "theme" in update_data:

        if (
            update_data["theme"]
            not in VALID_THEMES
        ):

            raise HTTPException(

                status_code=400,

                detail=(
                    "Invalid theme"
                ),

            )

        settings.theme = (
            update_data["theme"]
        )

    if "accent_color" in update_data:

        if (
            update_data["accent_color"]
            not in VALID_ACCENT_COLORS
        ):

            raise HTTPException(

                status_code=400,

                detail=(
                    "Invalid accent color"
                ),

            )

        settings.accent_color = (
            update_data["accent_color"]
        )

    if "compact_mode" in update_data:

        settings.compact_mode = (
            update_data["compact_mode"]
        )

    if "animations_enabled" in update_data:

        settings.animations_enabled = (
            update_data["animations_enabled"]
        )

    settings.updated_at = (
        datetime.utcnow()
    )

    db.commit()

    db.refresh(
        settings
    )

    return {

        "message": (
            "Appearance settings updated successfully"
        ),

        "appearance": {

            "theme": settings.theme,

            "accent_color": (
                settings.accent_color
            ),

            "compact_mode": (
                settings.compact_mode
            ),

            "animations_enabled": (
                settings.animations_enabled
            ),

        },

    }


# ============================================================
# GET NOTIFICATION SETTINGS
# ============================================================

@router.get(
    "/notifications",
)
def get_notification_settings(

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),

):

    settings = get_or_create_settings(
        user_id=current_user.id,
        db=db,
    )

    return {

        "email_notifications": (
            settings.email_notifications
        ),

        "interview_reminders": (
            settings.interview_reminders
        ),

        "performance_notifications": (
            settings.performance_notifications
        ),

        "product_updates": (
            settings.product_updates
        ),

    }


# ============================================================
# UPDATE NOTIFICATION SETTINGS
# ============================================================

@router.put(
    "/notifications",
)
def update_notification_settings(

    data: NotificationSettingsUpdate,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),

):

    settings = get_or_create_settings(
        user_id=current_user.id,
        db=db,
    )

    update_data = data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():

        setattr(
            settings,
            field,
            value,
        )

    settings.updated_at = (
        datetime.utcnow()
    )

    db.commit()

    db.refresh(
        settings
    )

    return {

        "message": (
            "Notification settings updated successfully"
        ),

        "notifications": {

            "email_notifications": (
                settings.email_notifications
            ),

            "interview_reminders": (
                settings.interview_reminders
            ),

            "performance_notifications": (
                settings.performance_notifications
            ),

            "product_updates": (
                settings.product_updates
            ),

        },

    }


# ============================================================
# GET AI PREFERENCES
# ============================================================

@router.get(
    "/ai-preferences",
)
def get_ai_preferences(

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),

):

    settings = get_or_create_settings(
        user_id=current_user.id,
        db=db,
    )

    return {

        "ai_feedback_level": (
            settings.ai_feedback_level
        ),

        "ai_response_style": (
            settings.ai_response_style
        ),

        "ai_suggestions_enabled": (
            settings.ai_suggestions_enabled
        ),

        "interview_difficulty": (
            settings.interview_difficulty
        ),

    }


# ============================================================
# UPDATE AI PREFERENCES
# ============================================================

@router.put(
    "/ai-preferences",
)
def update_ai_preferences(

    data: AIPreferencesUpdate,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),

):

    settings = get_or_create_settings(
        user_id=current_user.id,
        db=db,
    )

    update_data = data.model_dump(
        exclude_unset=True
    )

    if "ai_feedback_level" in update_data:

        if (
            update_data["ai_feedback_level"]
            not in VALID_FEEDBACK_LEVELS
        ):

            raise HTTPException(

                status_code=400,

                detail=(
                    "Invalid AI feedback level"
                ),

            )

        settings.ai_feedback_level = (
            update_data[
                "ai_feedback_level"
            ]
        )

    if "ai_response_style" in update_data:

        if (
            update_data["ai_response_style"]
            not in VALID_AI_RESPONSE_STYLES
        ):

            raise HTTPException(

                status_code=400,

                detail=(
                    "Invalid AI response style"
                ),

            )

        settings.ai_response_style = (
            update_data[
                "ai_response_style"
            ]
        )

    if "ai_suggestions_enabled" in update_data:

        settings.ai_suggestions_enabled = (
            update_data[
                "ai_suggestions_enabled"
            ]
        )

    if "interview_difficulty" in update_data:

        if (
            update_data["interview_difficulty"]
            not in VALID_INTERVIEW_DIFFICULTIES
        ):

            raise HTTPException(

                status_code=400,

                detail=(
                    "Invalid interview difficulty"
                ),

            )

        settings.interview_difficulty = (
            update_data[
                "interview_difficulty"
            ]
        )

    settings.updated_at = (
        datetime.utcnow()
    )

    db.commit()

    db.refresh(
        settings
    )

    return {

        "message": (
            "AI preferences updated successfully"
        ),

        "ai_preferences": {

            "ai_feedback_level": (
                settings.ai_feedback_level
            ),

            "ai_response_style": (
                settings.ai_response_style
            ),

            "ai_suggestions_enabled": (
                settings.ai_suggestions_enabled
            ),

            "interview_difficulty": (
                settings.interview_difficulty
            ),

        },

    }


# ============================================================
# GET PRIVACY SETTINGS
# ============================================================

@router.get(
    "/privacy",
)
def get_privacy_settings(

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),

):

    settings = get_or_create_settings(
        user_id=current_user.id,
        db=db,
    )

    return {

        "profile_visibility": (
            settings.profile_visibility
        ),

        "analytics_tracking": (
            settings.analytics_tracking
        ),

        "data_collection": (
            settings.data_collection
        ),

        "ai_training_consent": (
            settings.ai_training_consent
        ),

    }


# ============================================================
# UPDATE PRIVACY SETTINGS
# ============================================================

@router.put(
    "/privacy",
)
def update_privacy_settings(

    data: PrivacySettingsUpdate,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),

):

    settings = get_or_create_settings(
        user_id=current_user.id,
        db=db,
    )

    update_data = data.model_dump(
        exclude_unset=True
    )

    if "profile_visibility" in update_data:

        if (
            update_data["profile_visibility"]
            not in VALID_PROFILE_VISIBILITY
        ):

            raise HTTPException(

                status_code=400,

                detail=(
                    "Invalid profile visibility"
                ),

            )

        settings.profile_visibility = (
            update_data[
                "profile_visibility"
            ]
        )

    if "analytics_tracking" in update_data:

        settings.analytics_tracking = (
            update_data[
                "analytics_tracking"
            ]
        )

    if "data_collection" in update_data:

        settings.data_collection = (
            update_data[
                "data_collection"
            ]
        )

    if "ai_training_consent" in update_data:

        settings.ai_training_consent = (
            update_data[
                "ai_training_consent"
            ]
        )

    settings.updated_at = (
        datetime.utcnow()
    )

    db.commit()

    db.refresh(
        settings
    )

    return {

        "message": (
            "Privacy settings updated successfully"
        ),

        "privacy": {

            "profile_visibility": (
                settings.profile_visibility
            ),

            "analytics_tracking": (
                settings.analytics_tracking
            ),

            "data_collection": (
                settings.data_collection
            ),

            "ai_training_consent": (
                settings.ai_training_consent
            ),

        },

    }


# ============================================================
# GET SECURITY SETTINGS
# ============================================================

@router.get(
    "/security",
)
def get_security_settings(

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),

):

    settings = get_or_create_settings(
        user_id=current_user.id,
        db=db,
    )

    return {

        "two_factor_enabled": (
            settings.two_factor_enabled
        ),

        "login_alerts": (
            settings.login_alerts
        ),

    }


# ============================================================
# UPDATE SECURITY SETTINGS
# ============================================================

@router.put(
    "/security",
)
def update_security_settings(

    data: SecuritySettingsUpdate,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),

):

    settings = get_or_create_settings(
        user_id=current_user.id,
        db=db,
    )

    update_data = data.model_dump(
        exclude_unset=True
    )

    if "two_factor_enabled" in update_data:

        settings.two_factor_enabled = (
            update_data[
                "two_factor_enabled"
            ]
        )

    if "login_alerts" in update_data:

        settings.login_alerts = (
            update_data[
                "login_alerts"
            ]
        )

    settings.updated_at = (
        datetime.utcnow()
    )

    db.commit()

    db.refresh(
        settings
    )

    return {

        "message": (
            "Security settings updated successfully"
        ),

        "security": {

            "two_factor_enabled": (
                settings.two_factor_enabled
            ),

            "login_alerts": (
                settings.login_alerts
            ),

        },

    }

