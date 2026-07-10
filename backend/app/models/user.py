"""
User model.

Represents an application user, scoped to a single organization. No
authentication logic (password hashing, token issuance, etc.) lives here —
this module owns persistence/schema only.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base
from app.database.mixins import TimestampMixin
from app.security.roles import Role

if TYPE_CHECKING:
    from app.models.organization import Organization


class User(Base, TimestampMixin):
    """An application user belonging to exactly one organization."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)

    organization_id: Mapped[int] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="Owning organization. ondelete='CASCADE' matches "
        "Organization.users' passive_deletes=True cascade config.",
    )

    email: Mapped[str] = mapped_column(
        String(320),
        unique=True,
        nullable=False,
        index=True,
        doc="Unique login identifier. 320 = max valid RFC 5321 email length.",
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Password hash only — never store or accept plaintext here. "
        "Hashing/verification logic belongs in app/services or "
        "app/core/security, not this model.",
    )

    full_name: Mapped[str] = mapped_column(String(255), nullable=False)

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        doc="Soft-disable flag. False = user may not authenticate, "
        "without deleting the row.",
    )

    is_superuser: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        doc="Platform-level admin flag, distinct from any per-organization "
        "role system.",
    )
    role: Mapped[Role] = mapped_column(
    Enum(
        Role,
        name="user_role",
        values_callable=lambda enum: [member.value for member in enum],
    ),
    default=Role.VIEWER,
    nullable=False,
    doc="Organization-level RBAC role.",
    )

    organization: Mapped["Organization"] = relationship(back_populates="users")

    def __repr__(self) -> str:
        return f"User(id={self.id!r}, email={self.email!r})"
