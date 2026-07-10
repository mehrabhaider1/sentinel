from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProjectBase(BaseModel):
    """
    Shared project fields.
    """

    name: str = Field(
        ...,
        min_length=2,
        max_length=255,
    )

    description: str | None = Field(
        default=None,
        max_length=5000,
    )


class ProjectCreate(ProjectBase):
    """
    Schema used when creating a project.
    """

    pass


class ProjectUpdate(BaseModel):
    """
    Schema used when updating a project.
    """

    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=255,
    )

    description: str | None = Field(
        default=None,
        max_length=5000,
    )


class ProjectResponse(ProjectBase):
    """
    API response model.
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    created_at: datetime
    updated_at: datetime