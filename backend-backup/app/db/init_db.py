from app.db.database import engine
from app.db.database import Base

from app.models.user_model import User
from app.models.interview_model import Interview


def create_tables():

    Base.metadata.create_all(bind=engine)