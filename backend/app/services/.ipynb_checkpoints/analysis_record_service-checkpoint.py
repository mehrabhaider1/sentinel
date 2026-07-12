from __future__ import annotations

from sqlalchemy.orm import Session

from app.agents.models import FinalAnalysis
from app.models.analysis import Analysis
from app.models.project import Project
from app.core.settings import settings

class AnalysisRecordService:
    """
    Service responsible for persisting AI analysis results.
    """

    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        *,
        project_id: int,
        filename: str,
        document_type: str,
        analysis: FinalAnalysis,
    ) -> Analysis:
        """
        Persist an AI analysis result.
        """

        record = Analysis(
            project_id=project_id,
            filename=filename,
            document_type=document_type,
            risk_score=analysis.overall_risk_score,
            risk_level=analysis.overall_risk_level,
            executive_summary=analysis.executive_summary.overview,
            model_name=settings.AI_MODEL,
            analysis_json=analysis.model_dump(),
        )

        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)

        return record

    def get_by_id(
        self,
        analysis_id: int,
    ) -> Analysis | None:
        """
        Retrieve an analysis by ID.
        """

        return (
            self.db.query(Analysis)
            .filter(Analysis.id == analysis_id)
            .first()
        )

    def get_for_organization(
        self,
        analysis_id: int,
        organization_id: int,
    ) -> Analysis | None:
        """
        Return an analysis only if it belongs to one of the
        organization's projects.
        """

        return (
            self.db.query(Analysis)
            .join(Project)
            .filter(
                Analysis.id == analysis_id,
                Project.organization_id == organization_id,
            )
            .first()
        )

    def list_for_project(
        self,
        project_id: int,
    ) -> list[Analysis]:
        """
        Return all analyses for a project.
        """

        return (
            self.db.query(Analysis)
            .filter(Analysis.project_id == project_id)
            .order_by(Analysis.created_at.desc())
            .all()
        )

    def list_for_organization(
        self,
        organization_id: int,
    ) -> list[Analysis]:
        """
        Return all analyses belonging to an organization's projects.
        """

        return (
            self.db.query(Analysis)
            .join(Project)
            .filter(
                Project.organization_id == organization_id,
            )
            .order_by(Analysis.created_at.desc())
            .all()
        )

    def delete(
        self,
        analysis: Analysis,
    ) -> None:
        """
        Delete an analysis.
        """

        self.db.delete(analysis)
        self.db.commit()