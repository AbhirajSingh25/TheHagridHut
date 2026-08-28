"""
Compatibility shim.

`app/routes/settings.py` imports `get_current_user`, `verify_password`,
and `get_password_hash` from `app.utils.auth`, but that module did not
exist anywhere in the codebase - this made the entire application fail
to start, since `settings_router` is imported unconditionally in
`app/main.py`.

Rather than introduce a second, competing implementation of password
hashing / token verification, this module simply re-exports the real,
already-in-use implementations from `app.security` so there is a single
source of truth for authentication logic across the whole backend.
"""

from app.security import (
    get_current_user,
    verify_password,
    hash_password as get_password_hash,
)

__all__ = [
    "get_current_user",
    "verify_password",
    "get_password_hash",
]
