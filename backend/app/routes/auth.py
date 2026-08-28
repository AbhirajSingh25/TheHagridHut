from __future__ import annotations

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
)

from sqlalchemy.exc import IntegrityError

from sqlalchemy.orm import Session

from app.database import get_db

from app.models import User

from app.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# ============================================================
# REQUEST MODELS
# ============================================================

class SignupRequest(
    BaseModel
):

    username: str = Field(
        min_length=2,
        max_length=255,
    )

    email: EmailStr

    password: str = Field(
        min_length=6,
        max_length=128,
    )


class LoginRequest(
    BaseModel
):

    email: EmailStr

    password: str = Field(
        min_length=1,
        max_length=128,
    )


# ============================================================
# RESPONSE HELPER
# ============================================================

def serialize_user(
    user: User,
) -> dict:

    return {

        "id":
            user.id,

        "username":
            user.username,

        "email":
            user.email,

        "is_active":
            user.is_active,

        "onboarding_completed":
            user.onboarding_completed,

        "profile_image":
            user.profile_image,

    }


# ============================================================
# SIGNUP
# ============================================================

@router.post(
    "/signup",
    status_code=status.HTTP_201_CREATED,
)
def signup(

    data: SignupRequest,

    db: Session = Depends(
        get_db
    ),

):

    username = (
        data.username
        .strip()
    )

    email = (
        str(data.email)
        .strip()
        .lower()
    )


    existing_email = (

        db.query(
            User
        )

        .filter(
            User.email == email
        )

        .first()

    )


    if existing_email:

        raise HTTPException(

            status_code=
                status.HTTP_409_CONFLICT,

            detail=
                "An account with this email already exists.",

        )


    existing_username = (

        db.query(
            User
        )

        .filter(
            User.username == username
        )

        .first()

    )


    if existing_username:

        raise HTTPException(

            status_code=
                status.HTTP_409_CONFLICT,

            detail=
                "This username is already taken.",

        )


    user = User(

        username=
            username,

        email=
            email,

        password=
            hash_password(
                data.password
            ),

        is_active=
            True,

        onboarding_completed=
            False,

    )


    try:

        db.add(
            user
        )

        db.commit()

        db.refresh(
            user
        )


    except IntegrityError:

        db.rollback()

        raise HTTPException(

            status_code=
                status.HTTP_409_CONFLICT,

            detail=
                "Unable to create account because the username or email already exists.",

        )


    token = create_access_token(

        {

            "sub":
                user.email,

            "user_id":
                str(
                    user.id
                ),

        }

    )


    return {

        "message":
            "Account created successfully.",

        "token":
            token,

        "user":
            serialize_user(
                user
            ),

    }


# ============================================================
# LOGIN
# ============================================================

@router.post(
    "/login",
    status_code=status.HTTP_200_OK,
)
def login(

    data: LoginRequest,

    db: Session = Depends(
        get_db
    ),

):

    email = (

        str(data.email)
        .strip()
        .lower()

    )


    user = (

        db.query(
            User
        )

        .filter(
            User.email == email
        )

        .first()

    )


    if not user:

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Invalid email or password.",

        )


    if not verify_password(

        data.password,

        user.password,

    ):

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Invalid email or password.",

        )


    if not user.is_active:

        raise HTTPException(

            status_code=
                status.HTTP_403_FORBIDDEN,

            detail=
                "This account has been disabled.",

        )


    token = create_access_token(

        {

            "sub":
                user.email,

            "user_id":
                str(
                    user.id
                ),

        }

    )


    return {

        "message":
            "Login successful.",

        "token":
            token,

        "user":
            serialize_user(
                user
            ),

    }


# ============================================================
# CURRENT USER
# ============================================================

@router.get(
    "/me",
    status_code=status.HTTP_200_OK,
)
def get_me(

    current_user: User = Depends(
        get_current_user
    ),

):

    return {

        "user":
            serialize_user(
                current_user
            ),

    }