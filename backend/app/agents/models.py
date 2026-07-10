from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


# ------------------------------------------------------------------
# Security Models
# ------------------------------------------------------------------


class SecurityFinding(BaseModel):
    """
    Represents a single security issue.
    """

    title: str

    severity: Literal[
        "Critical",
        "High",
        "Medium",
        "Low",
    ]

    category: str

    description: str

    recommendation: str


class SecurityAnalysis(BaseModel):
    """
    Output from the Security Agent.
    """

    risk_score: int = Field(
        ge=0,
        le=100,
    )

    risk_level: Literal[
        "Low",
        "Medium",
        "High",
        "Critical",
    ]

    summary: str

    findings: list[SecurityFinding] = Field(
        default_factory=list,
    )

    top_priorities: list[str] = Field(
        default_factory=list,
    )


# ------------------------------------------------------------------
# Compliance Models
# ------------------------------------------------------------------


class ComplianceFinding(BaseModel):
    """
    Single compliance issue.
    """

    framework: str

    control: str

    status: Literal[
        "Pass",
        "Fail",
        "Partial",
    ]

    recommendation: str


class ComplianceAnalysis(BaseModel):
    """
    Output from the Compliance Agent.
    """

    compliance_score: int = Field(
        ge=0,
        le=100,
    )

    summary: str

    findings: list[ComplianceFinding] = Field(
        default_factory=list,
    )


# ------------------------------------------------------------------
# Executive Summary
# ------------------------------------------------------------------


class ExecutiveSummary(BaseModel):
    """
    Executive overview generated for reports.
    """

    overview: str

    business_impact: str

    recommended_next_steps: list[str] = Field(
        default_factory=list,
    )


# ------------------------------------------------------------------
# Final Analysis
# ------------------------------------------------------------------


class FinalAnalysis(BaseModel):
    """
    Complete analysis produced by the Analysis Orchestrator.
    """

    overall_risk_score: int = Field(
        ge=0,
        le=100,
    )

    overall_risk_level: Literal[
        "Low",
        "Medium",
        "High",
        "Critical",
    ]

    security: SecurityAnalysis

    compliance: ComplianceAnalysis

    executive_summary: ExecutiveSummary