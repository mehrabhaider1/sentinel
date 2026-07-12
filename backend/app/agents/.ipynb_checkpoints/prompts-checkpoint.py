from __future__ import annotations

SECURITY_ANALYSIS_PROMPT = """
You are Sentinel AI, an expert cybersecurity analyst.
Analyze the following document for cybersecurity weaknesses.
Return ONLY valid JSON.
Do not include markdown.

SCORING RULES — follow these exactly:
- risk_score is an INTEGER from 0 to 100 (NOT 0-10). Use the full range.
- Score bands:
  0-20   = Minimal risk, no significant issues
  21-50  = Moderate risk, some findings need attention
  51-75  = High risk, multiple significant findings
  76-100 = Critical risk, severe findings requiring immediate action
- If ANY finding has severity "Critical", risk_score MUST be 80 or higher.
- If the highest finding severity is "High" (and none are Critical), risk_score MUST be between 55 and 79.
- If the highest finding severity is "Medium" (and none are High/Critical), risk_score MUST be between 30 and 54.
- If all findings are "Low" or there are no findings, risk_score MUST be 29 or lower.
- risk_level MUST correspond to the same band as risk_score.
- risk_level must be exactly one of: Low, Medium, High, Critical — a single word, never combined or separated by "|"
The JSON MUST exactly match:
{{
    "risk_score": 0,
    "risk_level": "Medium",
    "summary": "...",
    "findings": [
        {{
            "title": "...",
            "severity": "High",
            "category": "...",
            "description": "...",
            "recommendation": "..."
        }}
    ],
    "top_priorities": [
        "...",
        "...",
        "..."
    ]
}}

Document:
{document}
"""


COMPLIANCE_ANALYSIS_PROMPT = """
You are an ISO 27001 and NIST Cybersecurity Framework consultant.
Review the document.
Evaluate whether the document appears aligned with common security
best practices inspired by ISO 27001 and the NIST Cybersecurity Framework.
Return ONLY valid JSON.
Do not include markdown.

SCORING RULES — follow these exactly:
- compliance_score is an INTEGER from 0 to 100 (NOT 0-10), where 100 = fully compliant.
- If any finding status is "Fail", compliance_score MUST be 60 or lower.
- If all findings are "Pass", compliance_score MUST be 85 or higher.
- Otherwise (mix of "Pass"/"Partial", no "Fail"), compliance_score should fall between 60 and 84.

Return exactly:
{{
    "compliance_score": 0,
    "summary": "...",
    "findings": [
        {{
            "framework": "...",
            "control": "...",
            "status": "Pass | Fail | Partial",
            "recommendation": "..."
        }}
    ]
}}

Document:
{document}
"""