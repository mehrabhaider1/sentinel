"""
Business logic for document analysis.
"""

from __future__ import annotations

from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.agents.analysis_orchestrator import AnalysisOrchestrator
from app.agents.models import FinalAnalysis
from app.models.user import User
from app.parsers.parser_factory import ParserFactory
from app.services.analysis_record_service import AnalysisRecordService
from app.services.project_service import ProjectService


class AnalysisService:
    """
    Service responsible for analyzing uploaded documents.
    """

    def __init__(self, db: Session) -> None:
        self.db = db
        self.project_service = ProjectService(db)
        self.analysis_record_service = AnalysisRecordService(db)
        self.orchestrator = AnalysisOrchestrator()

    async def analyze_file(
        self,
        project_id: int,
        current_user: User,
        file: UploadFile,
    ) -> FinalAnalysis:
        """
        Analyze an uploaded document belonging to one of the
        current user's projects.
        """

        if file.filename is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file must have a filename.",
            )

        project = self.project_service.get_for_organization(
            project_id=project_id,
            organization_id=current_user.organization_id,
        )

        if project is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found.",
            )

        parser = ParserFactory.get_parser(file.filename)

        text = parser.extract_text(file.file)

        analysis = self.orchestrator.analyze(text)

        self.analysis_record_service.create(
            project_id=project.id,
            filename=file.filename,
            document_type=Path(file.filename).suffix.lower().lstrip("."),
            analysis=analysis,
        )

        return analysis