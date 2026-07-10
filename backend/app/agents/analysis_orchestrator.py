from __future__ import annotations

from app.agents.compliance_agent import ComplianceAgent
from app.agents.models import (
    ExecutiveSummary,
    FinalAnalysis,
)
from app.agents.security_agent import SecurityAgent


class AnalysisOrchestrator:
    """
    Coordinates all AI agents and combines their results into a
    single analysis object.
    """

    def __init__(self) -> None:
        self.security_agent = SecurityAgent()
        self.compliance_agent = ComplianceAgent()

    def analyze(
        self,
        document: str,
    ) -> FinalAnalysis:
        """
        Perform a complete document analysis.
        """

        security = self.security_agent.analyze(document)

        compliance = self.compliance_agent.analyze(document)

        summary = ExecutiveSummary(
            overview=security.summary,
            business_impact=(
                f"The organization has an overall security "
                f"risk score of {security.risk_score}/100."
            ),
            recommended_next_steps=security.top_priorities,
        )

        return FinalAnalysis(
            overall_risk_score=security.risk_score,
            overall_risk_level=security.risk_level,
            security=security,
            compliance=compliance,
            executive_summary=summary,
        )