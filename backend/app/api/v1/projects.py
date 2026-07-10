from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.schemas.project import (
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
)
from app.security.dependencies import get_current_active_user
from app.services.project_service import ProjectService
from app.services.dashboard_service import DashboardService
router = APIRouter(
    prefix="/api/v1/projects",
    tags=["Projects"],
)


@router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> ProjectResponse:
    """
    Create a new project for the authenticated user's organization.
    """

    service = ProjectService(db)

    return service.create(
        project_data,
        current_user.organization_id,
    )


@router.get(
    "",
    response_model=list[ProjectResponse],
)
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> list[ProjectResponse]:
    """
    Return all projects belonging to the authenticated user's organization.
    """

    service = ProjectService(db)

    return service.list(
        current_user.organization_id,
    )

@router.get("/{project_id}/export")
def export_project_report(
    project_id: int,
    format: str = "csv",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> StreamingResponse:
    """
    Export all analyses for a single project as CSV or PDF.
    """
    service = DashboardService(db)
    try:
        if format == "pdf":
            buf = service.export_project_report_pdf(current_user, project_id)
            return StreamingResponse(
                iter([buf.getvalue()]),
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename=project_{project_id}_report.pdf"},
            )
        buf = service.export_project_report_csv(current_user, project_id)
        return StreamingResponse(
            iter([buf.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=project_{project_id}_report.csv"},
        )
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> ProjectResponse:
    """
    Return a project belonging to the authenticated user's organization.
    """

    service = ProjectService(db)

    project = service.get_by_id(
        project_id,
        current_user.organization_id,
    )

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )

    return project


@router.put(
    "/{project_id}",
    response_model=ProjectResponse,
)
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> ProjectResponse:
    """
    Update a project belonging to the authenticated user's organization.
    """

    service = ProjectService(db)

    project = service.get_by_id(
        project_id,
        current_user.organization_id,
    )

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )

    return service.update(
        project,
        project_data,
    )


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Response:
    """
    Delete a project belonging to the authenticated user's organization.
    """

    service = ProjectService(db)

    project = service.get_by_id(
        project_id,
        current_user.organization_id,
    )

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )

    service.delete(project)

    return Response(status_code=status.HTTP_204_NO_CONTENT)