from datetime import datetime
import os
import uuid

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)

from pydantic import (
    BaseModel,
    EmailStr,
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.models import User

from app.security import (
    get_current_user,
    hash_password,
    verify_password,
)


router = APIRouter(
    prefix="/api/profile",
    tags=["Profile"],
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

UPLOAD_DIR = os.path.join(
    BASE_DIR,
    "uploads",
    "profile_images",
)

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True,
)


# ============================================================
# REQUEST MODELS
# ============================================================

class ProfileUpdateRequest(BaseModel):

    username: str | None = None

    email: EmailStr | None = None

    headline: str | None = None

    bio: str | None = None

    location: str | None = None

    website: str | None = None

    linkedin_url: str | None = None

    github_url: str | None = None

    preferred_role: str | None = None

    experience_level: str | None = None

    target_industry: str | None = None


class PasswordChangeRequest(BaseModel):

    current_password: str

    new_password: str


# ============================================================
# SERIALIZER
# ============================================================

def serialize_user(
    user: User,
):

    return {

        "id":
            user.id,

        "username":
            user.username,

        "email":
            user.email,

        "profile_image":
            getattr(
                user,
                "profile_image",
                None,
            ),

        "headline":
            getattr(
                user,
                "headline",
                None,
            ),

        "bio":
            getattr(
                user,
                "bio",
                None,
            ),

        "location":
            getattr(
                user,
                "location",
                None,
            ),

        "website":
            getattr(
                user,
                "website",
                None,
            ),

        "linkedin_url":
            getattr(
                user,
                "linkedin_url",
                None,
            ),

        "github_url":
            getattr(
                user,
                "github_url",
                None,
            ),

        "preferred_role":
            getattr(
                user,
                "preferred_role",
                None,
            ),

        "experience_level":
            getattr(
                user,
                "experience_level",
                None,
            ),

        "target_industry":
            getattr(
                user,
                "target_industry",
                None,
            ),

        "onboarding_completed":
            getattr(
                user,
                "onboarding_completed",
                False,
            ),

        "is_active":
            getattr(
                user,
                "is_active",
                True,
            ),

        "created_at":
            (
                user.created_at.isoformat()
                if getattr(
                    user,
                    "created_at",
                    None,
                )
                else None
            ),

        "updated_at":
            (
                user.updated_at.isoformat()
                if getattr(
                    user,
                    "updated_at",
                    None,
                )
                else None
            ),
    }


# ============================================================
# GET CURRENT PROFILE
# ============================================================

@router.get("/")
def get_profile(
    current_user: User = Depends(
        get_current_user
    ),
):

    return {

        "success":
            True,

        "user":
            serialize_user(
                current_user
            ),
    }


# ============================================================
# UPDATE PROFILE
# ============================================================

@router.put("/")
def update_profile(
    data: ProfileUpdateRequest,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        get_current_user
    ),
):

    update_data = (
        data.model_dump(
            exclude_unset=True
        )
    )

    # --------------------------------------------------------
    # USERNAME CHECK
    # --------------------------------------------------------

    if (
        "username"
        in update_data
    ):

        username = (
            update_data["username"]
            .strip()
        )

        if username:

            existing_user = (
                db.query(User)
                .filter(
                    User.username
                    == username,

                    User.id
                    != current_user.id,
                )
                .first()
            )

            if existing_user:

                raise HTTPException(
                    status_code=409,
                    detail=(
                        "Username is already in use."
                    ),
                )

            current_user.username = (
                username
            )

    # --------------------------------------------------------
    # EMAIL CHECK
    # --------------------------------------------------------

    if (
        "email"
        in update_data
    ):

        email = (
            update_data["email"]
            .strip()
            .lower()
        )

        existing_user = (
            db.query(User)
            .filter(
                User.email
                == email,

                User.id
                != current_user.id,
            )
            .first()
        )

        if existing_user:

            raise HTTPException(
                status_code=409,
                detail=(
                    "Email is already in use."
                ),
            )

        current_user.email = (
            email
        )

    # --------------------------------------------------------
    # PROFILE FIELDS
    # --------------------------------------------------------

    allowed_fields = {

        "headline",

        "bio",

        "location",

        "website",

        "linkedin_url",

        "github_url",

        "preferred_role",

        "experience_level",

        "target_industry",
    }

    for field in allowed_fields:

        if (
            field
            in update_data
        ):

            setattr(
                current_user,
                field,
                update_data[field],
            )

    # --------------------------------------------------------
    # UPDATE TIMESTAMP
    # --------------------------------------------------------

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
            "Profile updated successfully.",

        "user":
            serialize_user(
                current_user
            ),
    }


# ============================================================
# UPLOAD PROFILE IMAGE
# ============================================================

@router.post(
    "/image"
)
async def upload_profile_image(
    file: UploadFile = File(
        ...
    ),
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        get_current_user
    ),
):

    allowed_types = {

        "image/jpeg",

        "image/png",

        "image/webp",
    }

    if (
        file.content_type
        not in allowed_types
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Only JPG, PNG and WEBP "
                "images are allowed."
            ),
        )

    file_extension = (
        os.path.splitext(
            file.filename
        )[1]
        .lower()
    )

    if not file_extension:

        file_extension = ".jpg"

    filename = (
        f"{current_user.id}_"
        f"{uuid.uuid4().hex}"
        f"{file_extension}"
    )

    file_path = os.path.join(
        UPLOAD_DIR,
        filename,
    )

    content = await file.read()

    max_size = (
        5
        * 1024
        * 1024
    )

    if len(content) > max_size:

        raise HTTPException(
            status_code=400,
            detail=(
                "Profile image must be "
                "smaller than 5 MB."
            ),
        )

    # --------------------------------------------------------
    # REMOVE OLD IMAGE
    # --------------------------------------------------------

    old_image = getattr(
        current_user,
        "profile_image",
        None,
    )

    if old_image:

        old_filename = os.path.basename(
            old_image
        )

        old_path = os.path.join(
            UPLOAD_DIR,
            old_filename,
        )

        if os.path.exists(
            old_path
        ):

            try:

                os.remove(
                    old_path
                )

            except OSError:

                pass

    # --------------------------------------------------------
    # SAVE IMAGE
    # --------------------------------------------------------

    with open(
        file_path,
        "wb",
    ) as image_file:

        image_file.write(
            content
        )

    image_url = (
        f"/uploads/profile_images/"
        f"{filename}"
    )

    current_user.profile_image = (
        image_url
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
            "Profile image uploaded successfully.",

        "profile_image":
            image_url,

        "user":
            serialize_user(
                current_user
            ),
    }


# ============================================================
# CHANGE PASSWORD
# ============================================================

@router.put(
    "/password"
)
def change_password(
    data: PasswordChangeRequest,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        get_current_user
    ),
):

    password_valid = (
        verify_password(
            data.current_password,
            current_user.password,
        )
    )

    if not password_valid:

        raise HTTPException(
            status_code=400,
            detail=(
                "Current password is incorrect."
            ),
        )

    if len(
        data.new_password
    ) < 8:

        raise HTTPException(
            status_code=400,
            detail=(
                "New password must contain "
                "at least 8 characters."
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
            "Password updated successfully.",
    }


# ============================================================
# DELETE PROFILE IMAGE
# ============================================================

@router.delete(
    "/image"
)
def delete_profile_image(
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        get_current_user
    ),
):

    old_image = getattr(
        current_user,
        "profile_image",
        None,
    )

    if old_image:

        filename = (
            os.path.basename(
                old_image
            )
        )

        file_path = os.path.join(
            UPLOAD_DIR,
            filename,
        )

        if os.path.exists(
            file_path
        ):

            try:

                os.remove(
                    file_path
                )

            except OSError:

                pass

    current_user.profile_image = None

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
            "Profile image removed successfully.",

        "user":
            serialize_user(
                current_user
            ),
    }


# ============================================================
# DEACTIVATE ACCOUNT
# ============================================================

@router.delete(
    "/account"
)
def deactivate_account(
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        get_current_user
    ),
):

    if hasattr(
        current_user,
        "is_active",
    ):

        current_user.is_active = False

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
            "Account deactivated successfully.",
    }