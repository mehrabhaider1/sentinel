"""
JWT utilities for Sentinel AI.

This module is responsible for creating and validating JSON Web Tokens.

All authentication throughout the application should go through this module.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

from jose import jwt

from app.core.settings import settings

__all__ = (
    "create_access_token",
    "decode_access_token",
)


def create_access_token(
    subject: str,
    expires_delta: timedelta | None = None,
) -> str:
    """
    Create a signed JWT access token.

    Args:
        subject:
            Usually the user's ID.

        expires_delta:
            Optional custom expiration.

    Returns:
        Encoded JWT string.
    """

    expire = datetime.now(UTC) + (
        expires_delta
        if expires_delta
        else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    payload: dict[str, Any] = {
        "sub": subject,
        "exp": expire,
    }

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def decode_access_token(
    token: str,
) -> dict[str, Any]:
    """
    Decode and validate a JWT.

    Raises:
        JWTError if the token is invalid or expired.
    """

    return jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM],
    )
