from app.database import (
    Base,
    engine,
)

import app.models


def migrate():
    Base.metadata.create_all(
        bind=engine
    )

    print(
        "Database tables created successfully."
    )

    print(
        "Important: Existing PostgreSQL tables "
        "will not receive new columns automatically."
    )


if __name__ == "__main__":
    migrate()