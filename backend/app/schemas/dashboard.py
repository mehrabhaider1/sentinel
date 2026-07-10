"""
Schemas for dashboard endpoints.
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class DashboardSummary(BaseModel):
    """
    Overall dashboard statistics.
    """

    total_projects: int
    total_analyses: int

    average_risk_score: float
    critical_risk: int
    high_risk: int
    medium_risk: int
    low_risk: int


class RecentAnalysis(BaseModel):
    """
    Recent analysis displayed on the dashboard.
    """

    id: int
    project_id: int

    filename: str

    risk_score: int
    risk_level: str

    created_at: datetime

    model_config = {
        "from_attributes": True,
    }


class RiskDistribution(BaseModel):
    """
    Risk distribution for all analyses.
    """
    critical: int
    high: int
    medium: int
    low: int


class ComplianceOverview(BaseModel):
    """
    Compliance statistics.
    """

    average_score: float
    highest_score: int
    lowest_score: int

class RiskTrendPoint(BaseModel):
    date: str  # ISO date, e.g. "2026-07-01"
    average_risk_score: float
    analysis_count: int


class ComplianceFrameworkScore(BaseModel):
    framework: str
    score: float  # 0-100, percentage of findings with status "Pass"
    total_findings: int


class AIRecommendation(BaseModel):
    text: str
    source: str  # "security" | "compliance" | "executive_summary"
    occurrences: int