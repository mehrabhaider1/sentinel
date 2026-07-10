from __future__ import annotations

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    """
    Schema used when creating a new user.
    """

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128,
    )

    full_name: str = Field(
        min_length=2,
        max_length=255,
    )

    organization_id: int


class UserResponse(BaseModel):
    """
    Public representation of a user.
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    organization_id: int
    is_active: bool
