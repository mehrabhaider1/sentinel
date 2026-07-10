from __future__ import annotations
from app.security.roles import Role

from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.security.hashing import hash_password, verify_password

from app.security.roles import Role
class UserService:
    """
    Service responsible for user-related business logic.
    """

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> User | None:
        """
        Retrieve a user by primary key.
        """
        return self.db.get(User, user_id)

    def get_by_email(self, email: str) -> User | None:
        """
        Retrieve a user by email.
        """
        return self.db.query(User).filter(User.email == email).first()

    def create_user(
    self,
    user_data: UserCreate, *, role: Role = Role.VIEWER, is_superuser: bool = False,
    ) -> User:
        """
        Create a new user.
        """

        user = User(
    email=user_data.email,
    hashed_password=hash_password(user_data.password),
    full_name=user_data.full_name,
    organization_id=user_data.organization_id,
    is_active=True,
    is_superuser=is_superuser,
    role=role,
    )

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        return user

    def authenticate(
        self,
        email: str,
        password: str,
    ) -> User | None:
        """
        Authenticate a user.
        """

        user = self.get_by_email(email)

        if user is None:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        return user
