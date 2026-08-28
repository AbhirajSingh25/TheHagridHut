import os

from dotenv import load_dotenv

from sqlalchemy import create_engine

from sqlalchemy.orm import (
    declarative_base,
    sessionmaker,
)


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "",
).strip()


if not DATABASE_URL:

    raise RuntimeError(

        "DATABASE_URL is not configured. "
        "Add DATABASE_URL to backend/.env"

    )


# ============================================================
# DATABASE ENGINE
# ============================================================

engine = create_engine(

    DATABASE_URL,

    pool_pre_ping=True,

    pool_recycle=1800,

    future=True,

)


# ============================================================
# DATABASE SESSION
# ============================================================

SessionLocal = sessionmaker(

    autocommit=False,

    autoflush=False,

    bind=engine,

)


# ============================================================
# BASE MODEL
# ============================================================

Base = declarative_base()


# ============================================================
# DATABASE DEPENDENCY
# ============================================================

def get_db():

    db = SessionLocal()


    try:

        yield db


    finally:

        db.close()