from __future__ import annotations

from app.agents.ai_client import AIClient
from app.agents.models import SecurityAnalysis
from app.agents.prompts import SECURITY_ANALYSIS_PROMPT


class SecurityAgent:
    """
    AI agent responsible for performing cybersecurity analysis
    on uploaded document text.
    """

    def __init__(self) -> None:
        self.client = AIClient()

    def analyze(
        self,
        document: str,
    ) -> SecurityAnalysis:
        """
        Analyze a document and return structured findings.
        """

        prompt = SECURITY_ANALYSIS_PROMPT.format(
            document=document,
        )

        return self.client.generate_structured(
            prompt=prompt,
            response_model=SecurityAnalysis,
            )