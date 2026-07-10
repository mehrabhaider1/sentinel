"""
Analysis model.

Stores the result of an AI-powered document analysis for a project.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.project import Project


class Analysis(Base, TimestampMixin):
    """
    AI-generated analysis for a project document.
    """

    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(primary_key=True)

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    document_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    risk_score: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    risk_level: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    executive_summary: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    model_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="gemini-2.5-flash",
    )

    analysis_json: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
    )

    project: Mapped["Project"] = relationship(
        back_populates="analyses",
    )

    def __repr__(self) -> str:
        return (
            f"Analysis(id={self.id!r}, "
            f"project_id={self.project_id!r}, "
            f"risk_score={self.risk_score!r})"
        )