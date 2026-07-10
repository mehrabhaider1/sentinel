"""
Password hashing utilities.

This module centralizes all password hashing and verification logic for
Sentinel AI.

Passwords are NEVER stored in plain text. Instead, they are hashed using
bcrypt via Passlib.

Keeping all hashing logic in one place ensures:

- Consistent password security
- Easy algorithm upgrades
- Clean separation of concerns
"""

from __future__ import annotations

from passlib.context import CryptContext

# ---------------------------------------------------------------------
# Password hashing configuration
# ---------------------------------------------------------------------

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def hash_password(password: str) -> str:
    """
    Hash a plain-text password.

    Args:
        password: User's plain-text password.

    Returns:
        Secure bcrypt hash.
    """
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a password against its stored hash.

    Args:
        plain_password: Password supplied by the user.
        hashed_password: Stored bcrypt hash.

    Returns:
        True if the password matches.
    """
    return pwd_context.verify(
        plain_password,
        hashed_password,
    )
