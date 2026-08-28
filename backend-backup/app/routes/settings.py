# ============================================================
# FILE: backend/app/routes/settings.py
# ============================================================

from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
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
    DataSettingsUpdate,
    ChangePasswordRequest,
    SettingsResponse,
)

from app.dependencies import (
    get_current_user,
)

from app.security import (
    verify_password,
    hash_password,
)


router = APIRouter(
    prefix="/api/settings",
    tags=["Settings"],
)


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


def get_user_value(
    user: User,
    field: str,
    default=None,
):

    return getattr(
        user,
        field,
        default,
    )


def get_or_create_settings(
    user_id: int,
    db: Session,
) -> UserSettings:

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

        db.add(
            settings
        )

        db.commit()

        db.refresh(
            settings
        )

    return settings


def build_account_response(
    user: User,
):

    return {

        "id":
            user.id,

        "username":
            get_user_value(
                user,
                "username",
            ),

        "email":
            get_user_value(
                user,
                "email",
            ),

        "full_name":
            get_user_value(
                user,
                "full_name",
            ),

        "headline":
            get_user_value(
                user,
                "headline",
            ),

        "bio":
            get_user_value(
                user,
                "bio",
            ),

        "location":
            get_user_value(
                user,
                "location",
            ),

        "website":
            get_user_value(
                user,
                "website",
            ),

        "linkedin_url":
            get_user_value(
                user,
                "linkedin_url",
            ),

        "github_url":
            get_user_value(
                user,
                "github_url",
            ),

        "profile_image":
            get_user_value(
                user,
                "profile_image",
            ),
    }


def build_appearance_response(
    settings: UserSettings,
):

    return {

        "theme":
            settings.theme,

        "accent_color":
            settings.accent_color,

        "compact_mode":
            bool(
                settings.compact_mode
            ),

        "animations_enabled":
            bool(
                settings.animations_enabled
            ),
    }


def build_notifications_response(
    settings: UserSettings,
):

    return {

        "email_notifications":
            bool(
                settings.email_notifications
            ),

        "interview_reminders":
            bool(
                settings.interview_reminders
            ),

        "performance_notifications":
            bool(
                settings.performance_notifications
            ),

        "product_updates":
            bool(
                settings.product_updates
            ),
    }


def build_ai_preferences_response(
    settings: UserSettings,
):

    return {

        "ai_feedback_level":
            settings.ai_feedback_level,

        "ai_response_style":
            settings.ai_response_style,

        "ai_suggestions_enabled":
            bool(
                settings.ai_suggestions_enabled
            ),

        "interview_difficulty":
            settings.interview_difficulty,
    }


def build_privacy_response(
    settings: UserSettings,
):

    return {

        "profile_visibility":
            settings.profile_visibility,

        "analytics_tracking":
            bool(
                settings.analytics_tracking
            ),

        "data_collection":
            bool(
                settings.data_collection
            ),

        "ai_training_consent":
            bool(
                settings.ai_training_consent
            ),
    }


def build_security_response(
    settings: UserSettings,
):

    return {

        "two_factor_enabled":
            bool(
                settings.two_factor_enabled
            ),

        "login_alerts":
            bool(
                settings.login_alerts
            ),
    }


def build_data_response(
    settings: UserSettings,
):

    return {

        "data_collection":
            bool(
                settings.data_collection
            ),

        "analytics_tracking":
            bool(
                settings.analytics_tracking
            ),

        "ai_training_consent":
            bool(
                settings.ai_training_consent
            ),
    }


def build_settings_response(
    user: User,
    settings: UserSettings,
):

    return {

        "account":
            build_account_response(
                user
            ),

        "appearance":
            build_appearance_response(
                settings
            ),

        "notifications":
            build_notifications_response(
                settings
            ),

        "ai_preferences":
            build_ai_preferences_response(
                settings
            ),

        "privacy":
            build_privacy_response(
                settings
            ),

        "security":
            build_security_response(
                settings
            ),

        "data":
            build_data_response(
                settings
            ),
    }


def save_settings(
    settings: UserSettings,
    db: Session,
):

    if hasattr(
        settings,
        "updated_at",
    ):

        settings.updated_at = (
            datetime.utcnow()
        )

    db.commit()

    db.refresh(
        settings
    )

    return settings


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


@router.get(
    "/account",
)
def get_account_settings(

    current_user: User = Depends(
        get_current_user
    ),
):

    return build_account_response(
        current_user
    )


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

        username = (
            update_data["username"]
            .strip()
        )

        existing_user = (
            db.query(User)
            .filter(
                User.username == username,
                User.id != current_user.id,
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
            username
        )

    account_fields = [
        "full_name",
        "headline",
        "bio",
        "location",
        "website",
        "linkedin_url",
        "github_url",
    ]

    for field in account_fields:

        if (
            field in update_data
            and hasattr(
                current_user,
                field,
            )
        ):

            setattr(
                current_user,
                field,
                update_data[field],
            )

    if hasattr(
        current_user,
        "updated_at",
    ):

        current_user.updated_at = (
            datetime.utcnow()
        )

    db.commit()

    db.refresh(
        current_user
    )

    return {

        "success":
            True,

        "message":
            "Account settings updated successfully",

        "account":
            build_account_response(
                current_user
            ),
    }


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

    stored_password = get_user_value(
        current_user,
        "password",
    )

    if not stored_password:

        raise HTTPException(
            status_code=400,
            detail=(
                "Password cannot be changed for this account."
            ),
        )

    password_valid = verify_password(
        data.current_password,
        stored_password,
    )

    if not password_valid:

        raise HTTPException(
            status_code=400,
            detail=(
                "Current password is incorrect"
            ),
        )

    current_user.password = (
        hash_password(
            data.new_password
        )
    )

    if hasattr(
        current_user,
        "updated_at",
    ):

        current_user.updated_at = (
            datetime.utcnow()
        )

    db.commit()

    return {

        "success":
            True,

        "message":
            "Password changed successfully",
    }


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

    return build_appearance_response(
        settings
    )


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
                detail="Invalid theme",
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
            update_data[
                "animations_enabled"
            ]
        )

    save_settings(
        settings,
        db,
    )

    return {

        "success":
            True,

        "message":
            "Appearance settings updated successfully",

        "appearance":
            build_appearance_response(
                settings
            ),
    }


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

    return build_notifications_response(
        settings
    )


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

    allowed_fields = [
        "email_notifications",
        "interview_reminders",
        "performance_notifications",
        "product_updates",
    ]

    for field in allowed_fields:

        if field in update_data:

            setattr(
                settings,
                field,
                bool(
                    update_data[field]
                ),
            )

    save_settings(
        settings,
        db,
    )

    return {

        "success":
            True,

        "message":
            "Notification settings updated successfully",

        "notifications":
            build_notifications_response(
                settings
            ),
    }


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

    return build_ai_preferences_response(
        settings
    )


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
            update_data[
                "ai_feedback_level"
            ]
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
            update_data[
                "ai_response_style"
            ]
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
            bool(
                update_data[
                    "ai_suggestions_enabled"
                ]
            )
        )

    if "interview_difficulty" in update_data:

        if (
            update_data[
                "interview_difficulty"
            ]
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

    save_settings(
        settings,
        db,
    )

    return {

        "success":
            True,

        "message":
            "AI preferences updated successfully",

        "ai_preferences":
            build_ai_preferences_response(
                settings
            ),
    }


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

    return build_privacy_response(
        settings
    )


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
            update_data[
                "profile_visibility"
            ]
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
            bool(
                update_data[
                    "analytics_tracking"
                ]
            )
        )

    if "data_collection" in update_data:

        settings.data_collection = (
            bool(
                update_data[
                    "data_collection"
                ]
            )
        )

    if "ai_training_consent" in update_data:

        settings.ai_training_consent = (
            bool(
                update_data[
                    "ai_training_consent"
                ]
            )
        )

    save_settings(
        settings,
        db,
    )

    return {

        "success":
            True,

        "message":
            "Privacy settings updated successfully",

        "privacy":
            build_privacy_response(
                settings
            ),
    }


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

    return build_security_response(
        settings
    )


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
            bool(
                update_data[
                    "two_factor_enabled"
                ]
            )
        )

    if "login_alerts" in update_data:

        settings.login_alerts = (
            bool(
                update_data[
                    "login_alerts"
                ]
            )
        )

    save_settings(
        settings,
        db,
    )

    return {

        "success":
            True,

        "message":
            "Security settings updated successfully",

        "security":
            build_security_response(
                settings
            ),
    }


@router.get(
    "/data",
)
def get_data_settings(

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

    return build_data_response(
        settings
    )


@router.put(
    "/data",
)
def update_data_settings(

    data: DataSettingsUpdate,

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

    if "data_collection" in update_data:

        settings.data_collection = (
            bool(
                update_data[
                    "data_collection"
                ]
            )
        )

    if "analytics_tracking" in update_data:

        settings.analytics_tracking = (
            bool(
                update_data[
                    "analytics_tracking"
                ]
            )
        )

    if "ai_training_consent" in update_data:

        settings.ai_training_consent = (
            bool(
                update_data[
                    "ai_training_consent"
                ]
            )
        )

    save_settings(
        settings,
        db,
    )

    return {

        "success":
            True,

        "message":
            "Data settings updated successfully",

        "data":
            build_data_response(
                settings
            ),
    }
