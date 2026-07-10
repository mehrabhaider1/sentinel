from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.database.session import get_db
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.auth import TokenResponse
from app.security.jwt import create_access_token
from app.services.user_service import UserService
from app.services.organization_service import OrganizationService
from app.schemas.organization import OrganizationCreate
from app.schemas.user import UserCreate
from app.security.roles import Role

from app.models.user import User
from app.security.dependencies import get_current_active_user
from app.schemas.user import UserResponse

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=255)
    organization_name: str = Field(min_length=2, max_length=255)


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """
    Create a new organization and user, then return a JWT access token.
    """

    org_service = OrganizationService(db)
    user_service = UserService(db)

    slug = data.organization_name.lower().replace(" ", "-").replace("_", "-")[:100]

    try:
        org = org_service.create(
            OrganizationCreate(
                name=data.organization_name,
                slug=slug,
            )
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    user = user_service.create_user(
        UserCreate(
            email=data.email,
            password=data.password,
            full_name=data.full_name,
            organization_id=org.id,
        ),
        role=Role.OWNER,
    )

    token = create_access_token(str(user.id))

    return TokenResponse(
        access_token=token,
    )


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> TokenResponse:
    """
    Authenticate a user and return a JWT access token.
    """

    service = UserService(db)

    user = service.authenticate(
        form_data.username,
        form_data.password,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token(str(user.id))

    return TokenResponse(
        access_token=token,
    )


@router.get(
    "/me",
    response_model=UserResponse,
)
def read_current_user(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Return the currently authenticated user.
    """

    return current_user
