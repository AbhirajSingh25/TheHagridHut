import os

from dotenv import load_dotenv

from sqlalchemy import (
    create_engine,
    text,
)


# ============================================================
# LOAD ENVIRONMENT
# ============================================================

load_dotenv()


DATABASE_URL = os.getenv(
    "DATABASE_URL"
)


if not DATABASE_URL:

    raise RuntimeError(
        "DATABASE_URL was not found in your .env file."
    )


# ============================================================
# DATABASE ENGINE
# ============================================================

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)


# ============================================================
# INTERVIEW SESSIONS MIGRATION
# ============================================================

migration_queries = [

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS user_id INTEGER;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS interview_type VARCHAR(100);
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS status VARCHAR(100)
    DEFAULT 'completed';
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS is_paused BOOLEAN
    DEFAULT FALSE;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS current_question_index INTEGER
    DEFAULT 0;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS overall_score INTEGER
    DEFAULT 0;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS technical_score INTEGER
    DEFAULT 0;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS communication_score INTEGER
    DEFAULT 0;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS confidence_score INTEGER
    DEFAULT 0;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS relevance_score INTEGER
    DEFAULT 0;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS candidate_score INTEGER
    DEFAULT 0;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS hiring_probability INTEGER
    DEFAULT 0;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS resume_score INTEGER
    DEFAULT 0;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS jd_match_score INTEGER
    DEFAULT 0;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS resume_analysis TEXT;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS jd_analysis TEXT;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS speech_score INTEGER
    DEFAULT 0;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS filler_words INTEGER
    DEFAULT 0;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS speaking_speed DOUBLE PRECISION
    DEFAULT 0;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS pause_score INTEGER
    DEFAULT 0;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS pronunciation_score INTEGER
    DEFAULT 0;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS clarity_score INTEGER
    DEFAULT 0;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS vision_score INTEGER
    DEFAULT 0;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS eye_contact_score INTEGER
    DEFAULT 0;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS attention_score INTEGER
    DEFAULT 0;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS engagement_score INTEGER
    DEFAULT 0;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS posture_score INTEGER
    DEFAULT 0;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS vision_analysis TEXT;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS recruiter_recommendation TEXT;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS recruiter_notes TEXT;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS expected_salary VARCHAR(255);
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS strengths TEXT;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS improvement_areas TEXT;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS certificate_id VARCHAR(255);
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS certificate_generated BOOLEAN
    DEFAULT FALSE;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP;
    """,

    """
    ALTER TABLE interview_sessions
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
    """,
]


# ============================================================
# RUN MIGRATION
# ============================================================

def run_migration():

    print(
        "\nStarting InterviewSession database migration...\n"
    )


    try:

        with engine.begin() as connection:

            for index, query in enumerate(
                migration_queries,
                start=1,
            ):

                connection.execute(
                    text(
                        query
                    )
                )


                print(
                    f"Migration {index} completed."
                )


        print(
            "\n"
            + "=" * 60
        )

        print(
            "DATABASE MIGRATION COMPLETED SUCCESSFULLY"
        )

        print(
            "=" * 60
        )

        print(
            "\nThe interview_sessions table is now "
            "compatible with the current backend model."
        )


    except Exception as error:

        print(
            "\nDATABASE MIGRATION FAILED:\n"
        )

        print(
            str(
                error
            )
        )

        raise


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    run_migration()