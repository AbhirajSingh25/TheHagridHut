from typing import Optional

from fastapi import (
    Depends,
    Header,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.security import decode_access_token


def get_current_user(
    authorization: Optional[str] = Header(
        default=None,
    ),
    db: Session = Depends(get_db),
):
    """
    Returns the authenticated user
    from the JWT Bearer token.
    """

    if not authorization:

        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail=(
                "Authentication token is required."
            ),
        )


    if not authorization.startswith(
        "Bearer "
    ):

        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail=(
                "Invalid authorization header."
            ),
        )


    token = authorization[
        len("Bearer "):
    ].strip()


    payload = decode_access_token(
        token
    )


    if not payload:

        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail=(
                "Invalid or expired token."
            ),
        )


    email = payload.get(
        "sub"
    )


    if not email:

        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail=(
                "Invalid authentication token."
            ),
        )


    user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )


    if not user:

        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Authenticated user not found."
            ),
        )


    if not user.is_active:

        raise HTTPException(
            status_code=(
                status.HTTP_403_FORBIDDEN
            ),
            detail=(
                "This account is inactive."
            ),
        )


    return user