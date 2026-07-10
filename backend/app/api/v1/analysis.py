"""
API endpoints for AI-powered document analysis.
"""

from __future__ import annotations

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.security.dependencies import get_current_user
from app.models.user import User
from app.schemas.analysis import (
    AnalysisDetail,
    AnalysisListItem,
    AnalysisResponse,
)
from app.services.analysis_record_service import AnalysisRecordService
from app.services.analysis_service import AnalysisService
from app.services.project_service import ProjectService

router = APIRouter(
    prefix="/api/v1",
    tags=["Analysis"],
)


@router.post(
    "/projects/{project_id}/analyze",
    response_model=AnalysisResponse,
)
async def analyze_document(
    project_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnalysisResponse:
    """Analyze an uploaded document using Sentinel AI."""
    service = AnalysisService(db)
    analysis = await service.analyze_file(
        project_id=project_id,
        current_user=current_user,
        file=file,
    )
    return AnalysisResponse(
        project_id=project_id,
        filename=file.filename or "unknown",
        analysis=analysis,
    )


@router.get(
    "/analyses",
    response_model=list[AnalysisListItem],
)
def list_all_analyses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[AnalysisListItem]:
    """Return every analysis for the current user's organization."""
    service = AnalysisRecordService(db)
    return service.list_for_organization(current_user.organization_id)


@router.get(
    "/projects/{project_id}/analyses",
    response_model=list[AnalysisListItem],
)
def list_project_analyses(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[AnalysisListItem]:
    """Return every analysis belonging to a project."""
    project_service = ProjectService(db)
    project = project_service.get_for_organization(
        project_id,
        current_user.organization_id,
    )
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )
    service = AnalysisRecordService(db)
    return service.list_for_project(project.id)


@router.get(
    "/analyses/{analysis_id}",
    response_model=AnalysisDetail,
)
def get_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnalysisDetail:
    """Return one stored analysis."""
    service = AnalysisRecordService(db)
    analysis = service.get_for_organization(
        analysis_id,
        current_user.organization_id,
    )
    if analysis is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found.",
        )
    return analysis


@router.delete(
    "/analyses/{analysis_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Delete a stored analysis."""
    service = AnalysisRecordService(db)
    analysis = service.get_for_organization(
        analysis_id,
        current_user.organization_id,
    )
    if analysis is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found.",
        )
    service.delete(analysis)
