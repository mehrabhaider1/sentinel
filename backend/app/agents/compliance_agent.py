from __future__ import annotations

from app.agents.ai_client import AIClient
from app.agents.models import ComplianceAnalysis
from app.agents.prompts import COMPLIANCE_ANALYSIS_PROMPT


class ComplianceAgent:
    """
    AI agent responsible for evaluating a document against
    common cybersecurity compliance frameworks.
    """

    def __init__(self) -> None:
        self.client = AIClient()

    def analyze(
        self,
        document: str,
    ) -> ComplianceAnalysis:
        """
        Perform compliance analysis.
        """

        prompt = COMPLIANCE_ANALYSIS_PROMPT.format(
            document=document,
        )

        return self.client.generate_structured(
            prompt=prompt,
            response_model=ComplianceAnalysis,
            )