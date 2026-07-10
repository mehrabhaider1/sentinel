"""
Dashboard API endpoints.
"""

from __future__ import annotations

from app.services.dashboard_service import DashboardService
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.dashboard import (
    AIRecommendation,
    ComplianceFrameworkScore,
    ComplianceOverview,
    DashboardSummary,
    RecentAnalysis,
    RiskDistribution,
    RiskTrendPoint,
)
from app.security.dependencies import get_current_user
from app.models.user import User
from fastapi.responses import StreamingResponse
# app/api/v1/dashboard.py
router = APIRouter(
    prefix="/api/v1/dashboard",   # was "/dashboard"
    tags=["Dashboard"],
)

@router.get(
    "/summary",
    response_model=DashboardSummary,
)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DashboardSummary:
    """
    Return overall dashboard statistics.
    """

    service = DashboardService(db)

    return service.get_summary(current_user)


@router.get(
    "/recent",
    response_model=list[RecentAnalysis],
)
def get_recent_analyses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[RecentAnalysis]:
    """
    Return recent analyses.
    """

    service = DashboardService(db)

    return service.get_recent_analyses(current_user)


@router.get(
    "/risk-distribution",
    response_model=RiskDistribution,
)
def get_risk_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RiskDistribution:
    """
    Return risk distribution.
    """

    service = DashboardService(db)

    return service.get_risk_distribution(current_user)


@router.get(
    "/compliance",
    response_model=ComplianceOverview,
)
def get_compliance_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ComplianceOverview:
    """
    Return compliance overview.
    """

    service = DashboardService(db)

    return service.get_compliance_overview(current_user)
@router.get("/risk-trend", response_model=list[RiskTrendPoint])
def get_risk_trend(days: int = 7, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return DashboardService(db).get_risk_trend(current_user, days=days)

@router.get("/compliance-by-framework", response_model=list[ComplianceFrameworkScore])
def get_compliance_by_framework(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return DashboardService(db).get_compliance_by_framework(current_user)

@router.get("/recommendations", response_model=list[AIRecommendation])
def get_ai_recommendations(limit: int = 6, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return DashboardService(db).get_ai_recommendations(current_user, limit=limit)

@router.get("/export")
def export_dashboard_report(
    format: str = "csv",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StreamingResponse:
    service = DashboardService(db)
    if format == "pdf":
        buf = service.export_report_pdf(current_user)
        return StreamingResponse(iter([buf.getvalue()]), media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=sentinel_report.pdf"})
    buf = service.export_report_csv(current_user)
    return StreamingResponse(iter([buf.getvalue()]), media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sentinel_report.csv"})