"""
Organization service.

Contains the business logic for organization management.
Routers should delegate all organization-related operations to this service.
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.organization import Organization
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationUpdate,
)


class OrganizationService:
    """
    Service responsible for organization-related business logic.
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, organization: OrganizationCreate) -> Organization:
        """
        Create a new organization.

        Raises:
            ValueError: If the slug already exists.
        """

        existing = self.get_by_slug(organization.slug)

        if existing is not None:
            raise ValueError("Organization slug already exists.")

        db_organization = Organization(
            name=organization.name,
            slug=organization.slug,
        )

        self.db.add(db_organization)
        self.db.commit()
        self.db.refresh(db_organization)

        return db_organization

    def get_by_id(self, organization_id: int) -> Organization | None:
        """
        Return an organization by its ID.
        """

        return self.db.get(Organization, organization_id)

    def get_by_slug(self, slug: str) -> Organization | None:
        """
        Return an organization by its slug.
        """

        return (
            self.db.query(Organization)
            .filter(Organization.slug == slug)
            .first()
        )

    def list(self) -> list[Organization]:
        """
        Return all organizations ordered by ID.
        """

        return (
            self.db.query(Organization)
            .order_by(Organization.id)
            .all()
        )

    def update(
        self,
        organization_id: int,
        data: OrganizationUpdate,
    ) -> Organization | None:
        """
        Update an existing organization.

        Raises:
            ValueError: If the new slug already exists.
        """

        organization = self.get_by_id(organization_id)

        if organization is None:
            return None

        if (
            data.slug is not None
            and data.slug != organization.slug
        ):
            existing = self.get_by_slug(data.slug)

            if existing is not None:
                raise ValueError("Organization slug already exists.")

            organization.slug = data.slug

        if data.name is not None:
            organization.name = data.name

        self.db.commit()
        self.db.refresh(organization)

        return organization

    def delete(self, organization_id: int) -> bool:
        """
        Delete an organization.

        Returns:
            True if deleted, False if not found.
        """

        organization = self.get_by_id(organization_id)

        if organization is None:
            return False

        self.db.delete(organization)
        self.db.commit()

        return True