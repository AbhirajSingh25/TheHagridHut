import jwt

from datetime import datetime
from datetime import timedelta

SECRET_KEY = "hiresense_super_secret_key_2026"

ALGORITHM = "HS256"


def create_token(user_id: int):

    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(days=7)
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


def decode_token(token: str):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except:

        return None