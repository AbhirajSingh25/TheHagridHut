from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from pydantic import BaseModel

from sqlalchemy.orm import Session

from app.database import get_db

from app.models import (
    User,
    UserNotification,
)

from app.dependencies import get_current_user


router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"],
)


# ============================================================
# REQUEST MODELS
# ============================================================

class NotificationCreateRequest(BaseModel):

    title: str

    message: str

    notification_type: str = "system"

    icon: str | None = None

    action_url: str | None = None


class NotificationUpdateRequest(BaseModel):

    title: str | None = None

    message: str | None = None

    notification_type: str | None = None

    icon: str | None = None

    action_url: str | None = None

    is_read: bool | None = None


# ============================================================
# SERIALIZER
# ============================================================

def serialize_notification(
    notification: UserNotification,
):

    return {

        "id":
            notification.id,

        "title":
            notification.title,

        "message":
            notification.message,

        "notification_type":
            notification.notification_type,

        "icon":
            notification.icon,

        "action_url":
            notification.action_url,

        "is_read":
            notification.is_read,

        "created_at":
            (
                notification.created_at.isoformat()
                if notification.created_at
                else None
            ),
    }


# ============================================================
# GET NOTIFICATIONS
# ============================================================

@router.get("/")
def get_notifications(
    unread_only: bool = Query(
        default=False,
    ),

    limit: int = Query(
        default=50,
        ge=1,
        le=100,
    ),

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):

    query = (
        db.query(
            UserNotification
        )
        .filter(
            UserNotification.user_id
            == current_user.id
        )
    )

    if unread_only:

        query = query.filter(
            UserNotification.is_read
            == False
        )

    notifications = (
        query
        .order_by(
            UserNotification.created_at.desc()
        )
        .limit(
            limit
        )
        .all()
    )

    unread_count = (
        db.query(
            UserNotification
        )
        .filter(
            UserNotification.user_id
            == current_user.id,

            UserNotification.is_read
            == False,
        )
        .count()
    )

    return {

        "success":
            True,

        "notifications": [

            serialize_notification(
                notification
            )

            for notification
            in notifications
        ],

        "total":
            len(
                notifications
            ),

        "unread_count":
            unread_count,
    }


# ============================================================
# GET UNREAD COUNT
# ============================================================

@router.get(
    "/unread-count"
)
def get_unread_count(
    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):

    unread_count = (
        db.query(
            UserNotification
        )
        .filter(
            UserNotification.user_id
            == current_user.id,

            UserNotification.is_read
            == False,
        )
        .count()
    )

    return {

        "success":
            True,

        "unread_count":
            unread_count,
    }


# ============================================================
# GET SINGLE NOTIFICATION
# ============================================================

@router.get(
    "/{notification_id}"
)
def get_notification(
    notification_id: int,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):

    notification = (
        db.query(
            UserNotification
        )
        .filter(
            UserNotification.id
            == notification_id,

            UserNotification.user_id
            == current_user.id,
        )
        .first()
    )

    if not notification:

        raise HTTPException(
            status_code=404,
            detail="Notification not found.",
        )

    return {

        "success":
            True,

        "notification":
            serialize_notification(
                notification
            ),
    }


# ============================================================
# CREATE NOTIFICATION
# ============================================================

@router.post("/")
def create_notification(
    data: NotificationCreateRequest,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):

    notification = UserNotification(

        user_id=current_user.id,

        title=data.title.strip(),

        message=data.message.strip(),

        notification_type=(
            data.notification_type
        ),

        icon=data.icon,

        action_url=data.action_url,

        is_read=False,
    )

    db.add(
        notification
    )

    db.commit()

    db.refresh(
        notification
    )

    return {

        "success":
            True,

        "message":
            "Notification created successfully.",

        "notification":
            serialize_notification(
                notification
            ),
    }


# ============================================================
# UPDATE NOTIFICATION
# ============================================================

@router.put(
    "/{notification_id}"
)
def update_notification(
    notification_id: int,

    data: NotificationUpdateRequest,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):

    notification = (
        db.query(
            UserNotification
        )
        .filter(
            UserNotification.id
            == notification_id,

            UserNotification.user_id
            == current_user.id,
        )
        .first()
    )

    if not notification:

        raise HTTPException(
            status_code=404,
            detail="Notification not found.",
        )

    update_data = (
        data.model_dump(
            exclude_unset=True
        )
    )

    allowed_fields = {

        "title",

        "message",

        "notification_type",

        "icon",

        "action_url",

        "is_read",
    }

    for field, value in (
        update_data.items()
    ):

        if field in allowed_fields:

            setattr(
                notification,
                field,
                value,
            )

    db.commit()

    db.refresh(
        notification
    )

    return {

        "success":
            True,

        "message":
            "Notification updated successfully.",

        "notification":
            serialize_notification(
                notification
            ),
    }


# ============================================================
# MARK SINGLE AS READ
# ============================================================

@router.put(
    "/{notification_id}/read"
)
def mark_notification_read(
    notification_id: int,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):

    notification = (
        db.query(
            UserNotification
        )
        .filter(
            UserNotification.id
            == notification_id,

            UserNotification.user_id
            == current_user.id,
        )
        .first()
    )

    if not notification:

        raise HTTPException(
            status_code=404,
            detail="Notification not found.",
        )

    notification.is_read = True

    db.commit()

    db.refresh(
        notification
    )

    return {

        "success":
            True,

        "message":
            "Notification marked as read.",

        "notification":
            serialize_notification(
                notification
            ),
    }


# ============================================================
# MARK ALL AS READ
# ============================================================

@router.put(
    "/read-all"
)
def mark_all_notifications_read(
    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):

    (
        db.query(
            UserNotification
        )
        .filter(
            UserNotification.user_id
            == current_user.id,

            UserNotification.is_read
            == False,
        )
        .update(
            {
                UserNotification.is_read:
                    True
            },
            synchronize_session=False,
        )
    )

    db.commit()

    return {

        "success":
            True,

        "message":
            "All notifications marked as read.",
    }


# ============================================================
# DELETE SINGLE NOTIFICATION
# ============================================================

@router.delete(
    "/{notification_id}"
)
def delete_notification(
    notification_id: int,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):

    notification = (
        db.query(
            UserNotification
        )
        .filter(
            UserNotification.id
            == notification_id,

            UserNotification.user_id
            == current_user.id,
        )
        .first()
    )

    if not notification:

        raise HTTPException(
            status_code=404,
            detail="Notification not found.",
        )

    db.delete(
        notification
    )

    db.commit()

    return {

        "success":
            True,

        "message":
            "Notification deleted successfully.",
    }


# ============================================================
# DELETE ALL NOTIFICATIONS
# ============================================================

@router.delete(
    "/"
)
def delete_all_notifications(
    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):

    deleted_count = (
        db.query(
            UserNotification
        )
        .filter(
            UserNotification.user_id
            == current_user.id
        )
        .delete(
            synchronize_session=False
        )
    )

    db.commit()

    return {

        "success":
            True,

        "message":
            "All notifications deleted successfully.",

        "deleted_count":
            deleted_count,
    }


# ============================================================
# DELETE READ NOTIFICATIONS
# ============================================================

@router.delete(
    "/read/all"
)
def delete_read_notifications(
    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):

    deleted_count = (
        db.query(
            UserNotification
        )
        .filter(
            UserNotification.user_id
            == current_user.id,

            UserNotification.is_read
            == True,
        )
        .delete(
            synchronize_session=False
        )
    )

    db.commit()

    return {

        "success":
            True,

        "message":
            "Read notifications deleted successfully.",

        "deleted_count":
            deleted_count,
    }
