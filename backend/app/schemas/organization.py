"""
Organization schemas.

Pydantic models used for validating organization requests and serializing
organization responses.
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class OrganizationBase(BaseModel):
    """Shared organization fields."""

    name: str = Field(
        min_length=2,
        max_length=255,
        examples=["Acme Corporation"],
    )

    slug: str = Field(
        min_length=2,
        max_length=100,
        examples=["acme-corporation"],
    )


class OrganizationCreate(OrganizationBase):
    """Schema used when creating an organization."""


class OrganizationUpdate(BaseModel):
    """Schema used for partial organization updates."""

    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=255,
    )

    slug: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )


class OrganizationResponse(OrganizationBase):
    """Organization returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class OrganizationListResponse(BaseModel):
    """List of organizations."""

    organizations: list[OrganizationResponse]