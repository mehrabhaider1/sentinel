"""
Organization model.

Represents a tenant/customer workspace in Sentinel AI's multi-tenant model.
Every user and project belongs to exactly one organization.

Relationships use string-based forward references (`Mapped["User"]`) since
`User` and `Project` are defined in sibling modules — importing them
directly here would create a circular import (they, in turn, import
`Organization` for their own relationship back-references). The
`TYPE_CHECKING` import block gives static type checkers full type
resolution without triggering that circular import at runtime.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.user import User


class Organization(Base, TimestampMixin):
    """
    A tenant workspace. Owns users and projects; all access-scoping in the
    application (e.g. "can this user see this project?") is ultimately
    rooted in organization membership.
    """

    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Human-readable organization name, e.g. 'Acme Corp'.",
    )

    slug: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
        doc="URL-safe unique identifier, e.g. 'acme-corp'. Used in routing "
        "and as a stable external reference instead of exposing "
        "auto-increment ids.",
    )

    users: Mapped[list["User"]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    projects: Mapped[list["Project"]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return f"Organization(id={self.id!r}, slug={self.slug!r})"
