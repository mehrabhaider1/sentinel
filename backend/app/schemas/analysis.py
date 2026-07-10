"""
Schemas for document analysis responses.
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel

from app.agents.models import FinalAnalysis


class AnalysisResponse(BaseModel):
    """
    Response returned after analyzing an uploaded document.
    """

    project_id: int
    filename: str
    analysis: FinalAnalysis


class AnalysisListItem(BaseModel):
    """
    Summary information about a stored analysis.
    """

    id: int
    filename: str
    document_type: str
    risk_score: int
    risk_level: str
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }


class AnalysisDetail(BaseModel):
    """
    Complete stored analysis.
    """

    id: int
    project_id: int
    filename: str
    document_type: str
    risk_score: int
    risk_level: str
    executive_summary: str
    model_name: str
    analysis_json: dict
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }