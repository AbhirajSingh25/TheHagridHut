from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker


BASE_DIR = Path(__file__).resolve().parent.parent

DATABASE_PATH = BASE_DIR / "hiresense.db"

DATABASE_URL = f"sqlite:///{DATABASE_PATH}"


print("\n")
print("DATABASE FILE LOCATION:")
print(DATABASE_PATH)
print("\n")


engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()