from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from pydantic import BaseModel

from sqlalchemy.orm import Session

from app.database import get_db

from app.models import (
    User,
    UserNote,
)

from app.security import (
    get_current_user,
)


router = APIRouter(
    prefix="/api/notes",
    tags=["Notes"],
)


class NoteCreateRequest(BaseModel):

    title: str

    content: str = ""

    category: str = "General"

    color: str = "default"

    is_pinned: bool = False


class NoteUpdateRequest(BaseModel):

    title: str | None = None

    content: str | None = None

    category: str | None = None

    color: str | None = None

    is_pinned: bool | None = None


def serialize_note(
    note: UserNote,
):

    return {

        "id":
            note.id,

        "title":
            note.title,

        "content":
            note.content,

        "category":
            note.category,

        "color":
            note.color,

        "is_pinned":
            note.is_pinned,

        "created_at":
            note.created_at.isoformat(),

        "updated_at":
            note.updated_at.isoformat(),
    }


@router.get("/")
def get_notes(
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        get_current_user
    ),
):

    notes = (
        db.query(
            UserNote
        )
        .filter(
            UserNote.user_id
            == current_user.id
        )
        .order_by(
            UserNote.is_pinned.desc(),
            UserNote.updated_at.desc(),
        )
        .all()
    )

    return {

        "success":
            True,

        "notes": [

            serialize_note(
                note
            )

            for note in notes
        ],
    }


@router.post("/")
def create_note(
    data: NoteCreateRequest,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        get_current_user
    ),
):

    note = UserNote(

        user_id=current_user.id,

        title=data.title.strip(),

        content=data.content,

        category=data.category,

        color=data.color,

        is_pinned=data.is_pinned,
    )

    db.add(
        note
    )

    db.commit()

    db.refresh(
        note
    )

    return {

        "success":
            True,

        "message":
            "Note created successfully.",

        "note":
            serialize_note(
                note
            ),
    }


@router.put("/{note_id}")
def update_note(
    note_id: int,
    data: NoteUpdateRequest,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        get_current_user
    ),
):

    note = (
        db.query(
            UserNote
        )
        .filter(
            UserNote.id
            == note_id,

            UserNote.user_id
            == current_user.id,
        )
        .first()
    )

    if not note:

        raise HTTPException(
            status_code=404,
            detail="Note not found.",
        )

    update_data = (
        data.model_dump(
            exclude_unset=True
        )
    )

    for field, value in (
        update_data.items()
    ):

        setattr(
            note,
            field,
            value,
        )

    note.updated_at = (
        datetime.utcnow()
    )

    db.commit()

    db.refresh(
        note
    )

    return {

        "success":
            True,

        "message":
            "Note updated successfully.",

        "note":
            serialize_note(
                note
            ),
    }


@router.delete("/{note_id}")
def delete_note(
    note_id: int,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        get_current_user
    ),
):

    note = (
        db.query(
            UserNote
        )
        .filter(
            UserNote.id
            == note_id,

            UserNote.user_id
            == current_user.id,
        )
        .first()
    )

    if not note:

        raise HTTPException(
            status_code=404,
            detail="Note not found.",
        )

    db.delete(
        note
    )

    db.commit()

    return {

        "success":
            True,

        "message":
            "Note deleted successfully.",
    }