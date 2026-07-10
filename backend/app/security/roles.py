"""
Role definitions for organization-level access control.
"""

from enum import StrEnum


class Role(StrEnum):
    """Organization-level roles."""

    OWNER = "owner"
    ADMIN = "admin"
    MANAGER = "manager"
    ANALYST = "analyst"
    VIEWER = "viewer"