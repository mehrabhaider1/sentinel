from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectService:
    """
    Service responsible for project-related business logic.
    """

    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        project_data: ProjectCreate,
        organization_id: int,
    ) -> Project:
        """
        Create a new project belonging to an organization.
        """

        project = Project(
            **project_data.model_dump(),
            organization_id=organization_id,
        )

        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)

        return project

    def get_by_id(
        self,
        project_id: int,
        organization_id: int,
    ) -> Project | None:
        """
        Retrieve a project belonging to an organization.
        """

        return (
            self.db.query(Project)
            .filter(
                Project.id == project_id,
                Project.organization_id == organization_id,
            )
            .first()
        )

    def list(
        self,
        organization_id: int,
    ) -> list[Project]:
        """
        Return all projects for an organization.
        """

        return (
            self.db.query(Project)
            .filter(Project.organization_id == organization_id)
            .order_by(Project.id)
            .all()
        )

    def update(
        self,
        project: Project,
        project_data: ProjectUpdate,
    ) -> Project:
        """
        Update an existing project.
        """

        updates = project_data.model_dump(exclude_unset=True)

        for field, value in updates.items():
            setattr(project, field, value)

        self.db.commit()
        self.db.refresh(project)

        return project

    def delete(
        self,
        project: Project,
    ) -> None:
        """
        Delete a project.
        """

        self.db.delete(project)
        self.db.commit()
    def get_for_organization(
        self,
        project_id: int,
        organization_id: int,
    ) -> Project | None:
        """
        Return a project only if it belongs to the specified organization.
        """

        return (
            self.db.query(Project)
            .filter(
                Project.id == project_id,
                Project.organization_id == organization_id,
            )
            .first()
        )