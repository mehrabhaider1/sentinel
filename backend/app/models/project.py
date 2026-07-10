"""
Project model.

Represents a workspace-scoped project within an organization. Simulations
(and, in turn, findings, agent runs, etc.) will be scoped to a Project once
those models are added — Project is the unit under which Sentinel AI's
actual risk-simulation work is organized.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.analysis import Analysis
    from app.models.organization import Organization


class Project(Base, TimestampMixin):
    """A project belonging to exactly one organization."""

    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True)

    organization_id: Mapped[int] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="Owning organization. ondelete='CASCADE' matches "
        "Organization.projects' passive_deletes=True cascade config.",
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Project display name, e.g. 'Q3 Vendor Risk Reviews'.",
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        doc="Optional free-text description. Nullable because a project "
        "is well-defined by name + organization alone; description is "
        "supplementary metadata, not an identity-bearing field.",
    )

    organization: Mapped["Organization"] = relationship(back_populates="projects")
    analyses: Mapped[list["Analysis"]] = relationship(
    back_populates="project",
    cascade="all, delete-orphan",
    )
    def __repr__(self) -> str:
        return f"Project(id={self.id!r}, name={self.name!r})"
