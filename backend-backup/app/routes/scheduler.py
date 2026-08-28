from datetime import (
    datetime,
    timezone,
)

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from pydantic import (
    BaseModel,
    Field,
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.models import (
    InterviewSchedule,
    User,
    UserNotification,
)

from app.dependencies import get_current_user


router = APIRouter(
    prefix="/api/scheduler",
    tags=["Interview Scheduler"],
)


# ============================================================
# REQUEST MODELS
# ============================================================

class ScheduleCreateRequest(BaseModel):

    title: str = Field(
        min_length=1,
        max_length=200,
    )

    role: str = Field(
        min_length=1,
        max_length=150,
    )

    level: str = "Intermediate"

    company: str | None = None

    interview_type: str = (
        "Mock Interview"
    )

    scheduled_at: datetime

    duration_minutes: int = Field(
        default=30,
        ge=5,
        le=240,
    )

    reminder_minutes: int = Field(
        default=30,
        ge=0,
        le=10080,
    )

    notes: str | None = None


class ScheduleUpdateRequest(BaseModel):

    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    role: str | None = Field(
        default=None,
        min_length=1,
        max_length=150,
    )

    level: str | None = None

    company: str | None = None

    interview_type: str | None = None

    scheduled_at: datetime | None = None

    duration_minutes: int | None = Field(
        default=None,
        ge=5,
        le=240,
    )

    reminder_minutes: int | None = Field(
        default=None,
        ge=0,
        le=10080,
    )

    notes: str | None = None

    status: str | None = None


class ScheduleStatusRequest(BaseModel):

    status: str


# ============================================================
# CONSTANTS
# ============================================================

ALLOWED_STATUSES = {

    "scheduled",

    "completed",

    "cancelled",

    "missed",
}


# ============================================================
# TIME HELPERS
# ============================================================

def normalize_datetime(
    value: datetime,
) -> datetime:

    if value.tzinfo is not None:

        return (
            value.astimezone(
                timezone.utc
            )
            .replace(
                tzinfo=None
            )
        )

    return value


def serialize_schedule(
    schedule: InterviewSchedule,
):

    scheduled_at = (
        schedule.scheduled_at
    )

    return {

        "id":
            schedule.id,

        "title":
            schedule.title,

        "role":
            schedule.role,

        "level":
            schedule.level,

        "company":
            schedule.company,

        "interview_type":
            schedule.interview_type,

        "scheduled_at":
            (
                scheduled_at.isoformat()
                if scheduled_at
                else None
            ),

        "duration_minutes":
            schedule.duration_minutes,

        "reminder_minutes":
            schedule.reminder_minutes,

        "notes":
            schedule.notes,

        "status":
            schedule.status,

        "created_at":
            (
                schedule.created_at.isoformat()
                if schedule.created_at
                else None
            ),

        "updated_at":
            (
                schedule.updated_at.isoformat()
                if schedule.updated_at
                else None
            ),
    }


# ============================================================
# CREATE NOTIFICATION
# ============================================================

def create_schedule_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str,
    action_url: str | None = "/scheduler",
):

    notification = UserNotification(

        user_id=user_id,

        title=title,

        message=message,

        notification_type=notification_type,

        action_url=action_url,

        is_read=False,
    )

    db.add(
        notification
    )


# ============================================================
# GET ALL SCHEDULES
# ============================================================

@router.get("/")
def get_schedules(
    status: str | None = Query(
        default=None,
    ),

    upcoming_only: bool = Query(
        default=False,
    ),

    limit: int = Query(
        default=100,
        ge=1,
        le=500,
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
            InterviewSchedule
        )
        .filter(
            InterviewSchedule.user_id
            == current_user.id
        )
    )

    if status:

        query = query.filter(
            InterviewSchedule.status
            == status.lower()
        )

    if upcoming_only:

        query = query.filter(
            InterviewSchedule.scheduled_at
            >= datetime.utcnow(),

            InterviewSchedule.status
            == "scheduled",
        )

    schedules = (
        query
        .order_by(
            InterviewSchedule.scheduled_at.asc()
        )
        .limit(
            limit
        )
        .all()
    )

    return {

        "success":
            True,

        "schedules": [

            serialize_schedule(
                schedule
            )

            for schedule
            in schedules
        ],

        "total":
            len(
                schedules
            ),
    }


# ============================================================
# GET UPCOMING SCHEDULES
# ============================================================

@router.get(
    "/upcoming"
)
def get_upcoming_schedules(
    limit: int = Query(
        default=10,
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

    schedules = (
        db.query(
            InterviewSchedule
        )
        .filter(
            InterviewSchedule.user_id
            == current_user.id,

            InterviewSchedule.status
            == "scheduled",

            InterviewSchedule.scheduled_at
            >= datetime.utcnow(),
        )
        .order_by(
            InterviewSchedule.scheduled_at.asc()
        )
        .limit(
            limit
        )
        .all()
    )

    return {

        "success":
            True,

        "schedules": [

            serialize_schedule(
                schedule
            )

            for schedule
            in schedules
        ],

        "total":
            len(
                schedules
            ),
    }


# ============================================================
# GET SINGLE SCHEDULE
# ============================================================

@router.get(
    "/{schedule_id}"
)
def get_schedule(
    schedule_id: int,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):

    schedule = (
        db.query(
            InterviewSchedule
        )
        .filter(
            InterviewSchedule.id
            == schedule_id,

            InterviewSchedule.user_id
            == current_user.id,
        )
        .first()
    )

    if not schedule:

        raise HTTPException(
            status_code=404,
            detail="Scheduled interview not found.",
        )

    return {

        "success":
            True,

        "schedule":
            serialize_schedule(
                schedule
            ),
    }


# ============================================================
# CREATE SCHEDULE
# ============================================================

@router.post("/")
def create_schedule(
    data: ScheduleCreateRequest,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):

    scheduled_at = (
        normalize_datetime(
            data.scheduled_at
        )
    )

    if (
        scheduled_at
        < datetime.utcnow()
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Scheduled interview time "
                "cannot be in the past."
            ),
        )

    schedule = InterviewSchedule(

        user_id=current_user.id,

        title=data.title.strip(),

        role=data.role.strip(),

        level=data.level,

        company=(
            data.company.strip()
            if data.company
            else None
        ),

        interview_type=(
            data.interview_type
        ),

        scheduled_at=scheduled_at,

        duration_minutes=(
            data.duration_minutes
        ),

        reminder_minutes=(
            data.reminder_minutes
        ),

        notes=data.notes,

        status="scheduled",
    )

    db.add(
        schedule
    )

    db.flush()

    formatted_date = (
        scheduled_at.strftime(
            "%d %b %Y, %I:%M %p"
        )
    )

    create_schedule_notification(

        db=db,

        user_id=current_user.id,

        title="Interview Scheduled",

        message=(
            f"Your {data.role} interview "
            f"is scheduled for "
            f"{formatted_date}."
        ),

        notification_type="schedule",

        action_url=(
            f"/scheduler?id="
            f"{schedule.id}"
        ),
    )

    db.commit()

    db.refresh(
        schedule
    )

    return {

        "success":
            True,

        "message":
            "Interview scheduled successfully.",

        "schedule":
            serialize_schedule(
                schedule
            ),
    }


# ============================================================
# UPDATE SCHEDULE
# ============================================================

@router.put(
    "/{schedule_id}"
)
def update_schedule(
    schedule_id: int,

    data: ScheduleUpdateRequest,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):

    schedule = (
        db.query(
            InterviewSchedule
        )
        .filter(
            InterviewSchedule.id
            == schedule_id,

            InterviewSchedule.user_id
            == current_user.id,
        )
        .first()
    )

    if not schedule:

        raise HTTPException(
            status_code=404,
            detail="Scheduled interview not found.",
        )

    update_data = (
        data.model_dump(
            exclude_unset=True
        )
    )

    if (
        "scheduled_at"
        in update_data
    ):

        scheduled_at = (
            normalize_datetime(
                update_data[
                    "scheduled_at"
                ]
            )
        )

        if (
            scheduled_at
            < datetime.utcnow()
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "Scheduled interview time "
                    "cannot be in the past."
                ),
            )

        update_data[
            "scheduled_at"
        ] = scheduled_at

    if (
        "status"
        in update_data
    ):

        status = (
            update_data["status"]
            .lower()
            .strip()
        )

        if (
            status
            not in ALLOWED_STATUSES
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid schedule status."
                ),
            )

        update_data[
            "status"
        ] = status

    allowed_fields = {

        "title",

        "role",

        "level",

        "company",

        "interview_type",

        "scheduled_at",

        "duration_minutes",

        "reminder_minutes",

        "notes",

        "status",
    }

    for field, value in (
        update_data.items()
    ):

        if field in allowed_fields:

            setattr(
                schedule,
                field,
                value,
            )

    schedule.updated_at = (
        datetime.utcnow()
    )

    db.commit()

    db.refresh(
        schedule
    )

    return {

        "success":
            True,

        "message":
            "Scheduled interview updated successfully.",

        "schedule":
            serialize_schedule(
                schedule
            ),
    }


# ============================================================
# UPDATE SCHEDULE STATUS
# ============================================================

@router.put(
    "/{schedule_id}/status"
)
def update_schedule_status(
    schedule_id: int,

    data: ScheduleStatusRequest,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):

    schedule = (
        db.query(
            InterviewSchedule
        )
        .filter(
            InterviewSchedule.id
            == schedule_id,

            InterviewSchedule.user_id
            == current_user.id,
        )
        .first()
    )

    if not schedule:

        raise HTTPException(
            status_code=404,
            detail="Scheduled interview not found.",
        )

    status = (
        data.status
        .lower()
        .strip()
    )

    if (
        status
        not in ALLOWED_STATUSES
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid schedule status."
            ),
        )

    schedule.status = status

    schedule.updated_at = (
        datetime.utcnow()
    )

    create_schedule_notification(

        db=db,

        user_id=current_user.id,

        title="Interview Schedule Updated",

        message=(
            f"Your scheduled interview "
            f"'{schedule.title}' is now "
            f"marked as {status}."
        ),

        notification_type="schedule",

        action_url=(
            f"/scheduler?id="
            f"{schedule.id}"
        ),
    )

    db.commit()

    db.refresh(
        schedule
    )

    return {

        "success":
            True,

        "message":
            "Schedule status updated successfully.",

        "schedule":
            serialize_schedule(
                schedule
            ),
    }


# ============================================================
# CANCEL SCHEDULE
# ============================================================

@router.post(
    "/{schedule_id}/cancel"
)
def cancel_schedule(
    schedule_id: int,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):

    schedule = (
        db.query(
            InterviewSchedule
        )
        .filter(
            InterviewSchedule.id
            == schedule_id,

            InterviewSchedule.user_id
            == current_user.id,
        )
        .first()
    )

    if not schedule:

        raise HTTPException(
            status_code=404,
            detail="Scheduled interview not found.",
        )

    schedule.status = "cancelled"

    schedule.updated_at = (
        datetime.utcnow()
    )

    create_schedule_notification(

        db=db,

        user_id=current_user.id,

        title="Interview Cancelled",

        message=(
            f"Your scheduled interview "
            f"'{schedule.title}' has been "
            f"cancelled."
        ),

        notification_type="schedule",

        action_url="/scheduler",
    )

    db.commit()

    db.refresh(
        schedule
    )

    return {

        "success":
            True,

        "message":
            "Scheduled interview cancelled.",

        "schedule":
            serialize_schedule(
                schedule
            ),
    }


# ============================================================
# DELETE SCHEDULE
# ============================================================

@router.delete(
    "/{schedule_id}"
)
def delete_schedule(
    schedule_id: int,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):

    schedule = (
        db.query(
            InterviewSchedule
        )
        .filter(
            InterviewSchedule.id
            == schedule_id,

            InterviewSchedule.user_id
            == current_user.id,
        )
        .first()
    )

    if not schedule:

        raise HTTPException(
            status_code=404,
            detail="Scheduled interview not found.",
        )

    db.delete(
        schedule
    )

    db.commit()

    return {

        "success":
            True,

        "message":
            "Scheduled interview deleted successfully.",
    }


# ============================================================
# SCHEDULE SUMMARY
# ============================================================

@router.get(
    "/summary/overview"
)
def get_schedule_summary(
    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):

    base_query = (
        db.query(
            InterviewSchedule
        )
        .filter(
            InterviewSchedule.user_id
            == current_user.id
        )
    )

    total = (
        base_query.count()
    )

    scheduled = (
        base_query
        .filter(
            InterviewSchedule.status
            == "scheduled"
        )
        .count()
    )

    completed = (
        base_query
        .filter(
            InterviewSchedule.status
            == "completed"
        )
        .count()
    )

    cancelled = (
        base_query
        .filter(
            InterviewSchedule.status
            == "cancelled"
        )
        .count()
    )

    missed = (
        base_query
        .filter(
            InterviewSchedule.status
            == "missed"
        )
        .count()
    )

    upcoming = (
        base_query
        .filter(
            InterviewSchedule.status
            == "scheduled",

            InterviewSchedule.scheduled_at
            >= datetime.utcnow(),
        )
        .count()
    )

    next_interview = (
        base_query
        .filter(
            InterviewSchedule.status
            == "scheduled",

            InterviewSchedule.scheduled_at
            >= datetime.utcnow(),
        )
        .order_by(
            InterviewSchedule.scheduled_at.asc()
        )
        .first()
    )

    return {

        "success":
            True,

        "summary": {

            "total":
                total,

            "scheduled":
                scheduled,

            "completed":
                completed,

            "cancelled":
                cancelled,

            "missed":
                missed,

            "upcoming":
                upcoming,

            "next_interview":
                (
                    serialize_schedule(
                        next_interview
                    )

                    if next_interview

                    else None
                ),
        },
    }
