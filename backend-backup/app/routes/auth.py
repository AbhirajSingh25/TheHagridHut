from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_active_user
from app.models import User, UserSettings
from app.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.config import settings


router = APIRouter()


# ============================================================
# SCHEMAS
# ============================================================

class SignupRequest(BaseModel):
    username: str = Field(
        min_length=2,
        max_length=255,
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128,
    )


class LoginRequest(BaseModel):
    email: EmailStr

    password: str = Field(
        min_length=1,
        max_length=128,
    )


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool
    is_admin: bool
    onboarding_completed: bool

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    user: UserResponse


# ============================================================
# HELPERS
# ============================================================

def normalize_email(email: str) -> str:
    return email.strip().lower()


def normalize_username(username: str) -> str:
    return username.strip()


def create_user_settings(
    db: Session,
    user_id: int,
) -> None:
    """
    Create default settings for a new user.

    Existing user_settings rows are preserved.
    """

    existing_settings = (
        db.query(UserSettings)
        .filter(UserSettings.user_id == user_id)
        .first()
    )

    if existing_settings:
        return

    settings_record = UserSettings(
        user_id=user_id,
    )

    db.add(settings_record)


def build_auth_response(user: User) -> AuthResponse:
    access_token = create_access_token(
        subject=user.id,
        expires_delta=timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        ),
        additional_claims={
            "email": user.email,
            "role": user.role,
        },
    )

    refresh_token = create_refresh_token(
        subject=user.id,
    )

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=(
            settings.ACCESS_TOKEN_EXPIRE_MINUTES
            * 60
        ),
        user=UserResponse.model_validate(user),
    )


# ============================================================
# SIGNUP
# ============================================================

@router.post(
    "/signup",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def signup(
    payload: SignupRequest,
    db: Session = Depends(get_db),
):
    username = normalize_username(
        payload.username
    )

    email = normalize_email(
        payload.email
    )

    if not username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is required",
        )

    existing_user = (
        db.query(User)
        .filter(
            or_(
                User.email == email,
                User.username == username,
            )
        )
        .first()
    )

    if existing_user:
        if existing_user.email == email:
            message = (
                "An account with this email already exists"
            )
        else:
            message = (
                "This username is already taken"
            )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=message,
        )

    try:
        new_user = User(
            username=username,
            email=email,
            password=hash_password(
                payload.password
            ),
            role="candidate",
            is_active=True,
            is_admin=False,
            onboarding_completed=False,
        )

        db.add(new_user)
        db.flush()

        create_user_settings(
            db=db,
            user_id=new_user.id,
        )

        db.commit()
        db.refresh(new_user)

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Unable to create account. "
                "Please try again."
            ),
        )

    return build_auth_response(new_user)


# ============================================================
# LOGIN
# ============================================================

@router.post(
    "/login",
    response_model=AuthResponse,
)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    email = normalize_email(
        payload.email
    )

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    try:
        password_valid = verify_password(
            payload.password,
            user.password,
        )
    except Exception:
        password_valid = False

    if not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is inactive",
        )

    return build_auth_response(user)


# ============================================================
# CURRENT USER
# ============================================================

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(
        get_current_active_user
    ),
):
    return current_user


# ============================================================
# REFRESH TOKEN
# ============================================================

class RefreshRequest(BaseModel):
    refresh_token: str = Field(
        min_length=1,
    )


@router.post(
    "/refresh",
    response_model=AuthResponse,
)
def refresh_access_token(
    payload: RefreshRequest,
    db: Session = Depends(get_db),
):
    from jose import JWTError

    from app.security import (
        get_refresh_token_subject,
    )

    try:
        user_id = get_refresh_token_subject(
            payload.refresh_token
        )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user = (
        db.query(User)
        .filter(User.id == int(user_id))
        .first()
    )

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user",
        )

    return build_auth_response(user)
