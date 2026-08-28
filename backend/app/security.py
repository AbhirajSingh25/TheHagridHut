from __future__ import annotations

import os

from datetime import (
    datetime,
    timedelta,
    timezone,
)

from dotenv import load_dotenv

from fastapi import (
    Depends,
    HTTPException,
    status,
)

from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)

from jose import (
    JWTError,
    jwt,
)

from passlib.context import CryptContext

from sqlalchemy.orm import Session

from app.database import get_db

from app.models import User


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()


SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "",
).strip()


if not SECRET_KEY:

    raise RuntimeError(
        "SECRET_KEY is not configured. "
        "Add SECRET_KEY to backend/.env"
    )


ALGORITHM = os.getenv(
    "JWT_ALGORITHM",
    "HS256",
).strip()


ACCESS_TOKEN_EXPIRE_MINUTES = int(

    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "10080",
    )

)


# ============================================================
# PASSWORD HASHING
# ============================================================

pwd_context = CryptContext(

    schemes=[
        "bcrypt",
    ],

    deprecated="auto",

)


def hash_password(
    password: str,
) -> str:

    return pwd_context.hash(
        password
    )


def verify_password(

    plain_password: str,

    hashed_password: str,

) -> bool:

    try:

        return pwd_context.verify(

            plain_password,

            hashed_password,

        )


    except Exception:

        return False


# ============================================================
# JWT BEARER SECURITY
# ============================================================

security = HTTPBearer(
    auto_error=False,
)


# ============================================================
# CREATE ACCESS TOKEN
# ============================================================

def create_access_token(

    data: dict,

    expires_delta:
        timedelta | None
        =
        None,

) -> str:

    payload = data.copy()


    now = datetime.now(
        timezone.utc
    )


    expire = (

        now
        +
        expires_delta

        if expires_delta

        else

        now
        +
        timedelta(

            minutes=
                ACCESS_TOKEN_EXPIRE_MINUTES

        )

    )


    payload.update(

        {

            "iat":
                now,

            "exp":
                expire,

        }

    )


    return jwt.encode(

        payload,

        SECRET_KEY,

        algorithm=
            ALGORITHM,

    )


# ============================================================
# DECODE ACCESS TOKEN
# ============================================================

def decode_access_token(
    token: str,
) -> dict:

    try:

        return jwt.decode(

            token,

            SECRET_KEY,

            algorithms=[
                ALGORITHM
            ],

        )


    except JWTError:

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Invalid or expired authentication token.",

            headers={

                "WWW-Authenticate":
                    "Bearer"

            },

        )


# ============================================================
# CURRENT USER
# ============================================================

def get_current_user(

    credentials:
        HTTPAuthorizationCredentials | None
        =
        Depends(
            security
        ),

    db: Session
        =
        Depends(
            get_db
        ),

) -> User:

    if not credentials:

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Authentication required.",

            headers={

                "WWW-Authenticate":
                    "Bearer"

            },

        )


    token = (
        credentials.credentials
    )


    payload = decode_access_token(
        token
    )


    user_id = payload.get(
        "user_id"
    )


    email = payload.get(
        "sub"
    )


    user = None


    if user_id:

        try:

            user = (

                db.query(
                    User
                )

                .filter(
                    User.id
                    ==
                    int(
                        user_id
                    )
                )

                .first()

            )


        except (

            TypeError,

            ValueError,

        ):

            user = None


    if not user and email:

        user = (

            db.query(
                User
            )

            .filter(
                User.email
                ==
                email
            )

            .first()

        )


    if not user:

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "User no longer exists.",

        )


    if not user.is_active:

        raise HTTPException(

            status_code=
                status.HTTP_403_FORBIDDEN,

            detail=
                "User account is inactive.",

        )


    return user


# ============================================================
# OPTIONAL CURRENT USER
# ============================================================

def get_optional_current_user(

    credentials:
        HTTPAuthorizationCredentials | None
        =
        Depends(
            security
        ),

    db: Session
        =
        Depends(
            get_db
        ),

) -> User | None:

    if not credentials:

        return None


    try:

        token = (
            credentials.credentials
        )


        payload = decode_access_token(
            token
        )


        user_id = payload.get(
            "user_id"
        )


        email = payload.get(
            "sub"
        )


        user = None


        if user_id:

            try:

                user = (

                    db.query(
                        User
                    )

                    .filter(
                        User.id
                        ==
                        int(
                            user_id
                        )
                    )

                    .first()

                )


            except (

                TypeError,

                ValueError,

            ):

                user = None


        if not user and email:

            user = (

                db.query(
                    User
                )

                .filter(
                    User.email
                    ==
                    email
                )

                .first()

            )


        if not user:

            return None


        if not user.is_active:

            return None


        return user


    except Exception:

        return None