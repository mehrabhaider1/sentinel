from __future__ import annotations

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.analysis import Analysis
from app.models.project import Project
from app.models.user import User
from app.schemas.dashboard import (
    AIRecommendation,
    ComplianceFrameworkScore,
    ComplianceOverview,
    DashboardSummary,
    RecentAnalysis,
    RiskDistribution,
    RiskTrendPoint,
)

import csv
import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from collections import defaultdict
from datetime import datetime, timedelta, timezone
class DashboardService:
    """
    Service responsible for dashboard statistics.
    """

    def __init__(self, db: Session):
        self.db = db

    def get_summary(
        self,
        current_user: User,
    ) -> DashboardSummary:
        """
        Return dashboard summary statistics.
        """

        project_ids = (
            self.db.query(Project.id)
            .filter(
                Project.organization_id == current_user.organization_id
            )
            .subquery()
        )

        total_projects = (
            self.db.query(Project)
            .filter(
                Project.organization_id == current_user.organization_id
            )
            .count()
        )

        total_analyses = (
            self.db.query(Analysis)
            .filter(
                Analysis.project_id.in_(project_ids)
            )
            .count()
        )

        average_risk = (
            self.db.query(
                func.avg(Analysis.risk_score)
            )
            .filter(
                Analysis.project_id.in_(project_ids)
            )
            .scalar()
            or 0
        )

        critical = (
            self.db.query(Analysis)
            .filter(
                Analysis.project_id.in_(project_ids),
                Analysis.risk_level == "Critical",
            )
            .count()
        )

        high = (
            self.db.query(Analysis)
            .filter(
                Analysis.project_id.in_(project_ids),
                Analysis.risk_level == "High",
            )
            .count()
        )

        medium = (
            self.db.query(Analysis)
            .filter(
                Analysis.project_id.in_(project_ids),
                Analysis.risk_level == "Medium",
            )
            .count()
        )

        low = (
            self.db.query(Analysis)
            .filter(
                Analysis.project_id.in_(project_ids),
                Analysis.risk_level == "Low",
            )
            .count()
        )

        return DashboardSummary(
            total_projects=total_projects,
            total_analyses=total_analyses,
            average_risk_score=round(float(average_risk), 2),
            critical_risk=critical,
            high_risk=high,
            medium_risk=medium,
            low_risk=low,
        )

    def get_recent_analyses(
        self,
        current_user: User,
        limit: int = 5,
    ) -> list[RecentAnalysis]:
        """
        Return the most recent analyses.
        """

        project_ids = (
            self.db.query(Project.id)
            .filter(
                Project.organization_id == current_user.organization_id
            )
            .subquery()
        )

        return (
            self.db.query(Analysis)
            .filter(
                Analysis.project_id.in_(project_ids)
            )
            .order_by(Analysis.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_risk_distribution(
        self,
        current_user: User,
    ) -> RiskDistribution:
        """
        Return High/Medium/Low counts.
        """

        summary = self.get_summary(current_user)

        return RiskDistribution(
            critical=summary.critical_risk,
            high=summary.high_risk,
            medium=summary.medium_risk,
            low=summary.low_risk,
        )

    def get_compliance_overview(
        self,
        current_user: User,
    ) -> ComplianceOverview:
        """
        Return compliance statistics.
        """

        project_ids = (
            self.db.query(Project.id)
            .filter(
                Project.organization_id == current_user.organization_id
            )
            .subquery()
        )

        analyses = (
            self.db.query(Analysis)
            .filter(
                Analysis.project_id.in_(project_ids)
            )
            .all()
        )

        if not analyses:
            return ComplianceOverview(
                average_score=0,
                highest_score=0,
                lowest_score=0,
            )

        scores = [
            analysis.analysis_json["compliance"]["compliance_score"]
            for analysis in analyses
        ]

        return ComplianceOverview(
            average_score=round(sum(scores) / len(scores), 2),
            highest_score=max(scores),
            lowest_score=min(scores),
        )
    def get_risk_trend(self, current_user: User, days: int = 7) -> list[RiskTrendPoint]:
        project_ids = (
            self.db.query(Project.id)
            .filter(Project.organization_id == current_user.organization_id)
            .subquery()
        )
        cutoff = datetime.now(timezone.utc) - timedelta(days=days - 1)
        analyses = (
            self.db.query(Analysis)
            .filter(Analysis.project_id.in_(project_ids), Analysis.created_at >= cutoff)
            .all()
        )
        by_day: dict[str, list[int]] = defaultdict(list)
        for a in analyses:
            by_day[a.created_at.date().isoformat()].append(a.risk_score)
        points: list[RiskTrendPoint] = []
        for i in range(days):
            day = (cutoff + timedelta(days=i)).date().isoformat()
            scores = by_day.get(day, [])
            avg = round(sum(scores) / len(scores), 2) if scores else 0.0
            points.append(RiskTrendPoint(date=day, average_risk_score=avg, analysis_count=len(scores)))
        return points

    def get_compliance_by_framework(self, current_user: User) -> list[ComplianceFrameworkScore]:
        project_ids = (
            self.db.query(Project.id)
            .filter(Project.organization_id == current_user.organization_id)
            .subquery()
        )
        analyses = self.db.query(Analysis).filter(Analysis.project_id.in_(project_ids)).all()
        by_framework: dict[str, list[float]] = defaultdict(list)
        for a in analyses:
            findings = ((a.analysis_json or {}).get("compliance") or {}).get("findings") or []
            for f in findings:
                framework, status = f.get("framework"), f.get("status")
                if not framework or not status:
                    continue
                credit = {"Pass": 1.0, "Partial": 0.5, "Fail": 0.0}.get(status)
                if credit is None:
                    continue
                by_framework[framework].append(credit)
        results = [
            ComplianceFrameworkScore(
                framework=fw, score=round((sum(c) / len(c)) * 100, 1), total_findings=len(c)
            )
            for fw, c in by_framework.items()
        ]
        results.sort(key=lambda r: r.total_findings, reverse=True)
        return results

    def get_ai_recommendations(self, current_user: User, limit: int = 6) -> list[AIRecommendation]:
        project_ids = (
            self.db.query(Project.id)
            .filter(Project.organization_id == current_user.organization_id)
            .subquery()
        )
        analyses = self.db.query(Analysis).filter(Analysis.project_id.in_(project_ids)).all()
        counts: dict[tuple[str, str], int] = defaultdict(int)
        for a in analyses:
            data = a.analysis_json or {}
            for f in (data.get("security") or {}).get("findings") or []:
                if f.get("recommendation"):
                    counts[(f["recommendation"].strip(), "security")] += 1
            for f in (data.get("compliance") or {}).get("findings") or []:
                if f.get("status") in ("Fail", "Partial") and f.get("recommendation"):
                    counts[(f["recommendation"].strip(), "compliance")] += 1
            for step in (data.get("executive_summary") or {}).get("recommended_next_steps") or []:
                if step:
                    counts[(step.strip(), "executive_summary")] += 1
        ranked = sorted(counts.items(), key=lambda kv: kv[1], reverse=True)
        return [
            AIRecommendation(text=t, source=s, occurrences=c)
            for (t, s), c in ranked[:limit]
        ]
    
    def export_report_csv(self, current_user: User) -> io.StringIO:
        project_ids = (
            self.db.query(Project.id)
            .filter(Project.organization_id == current_user.organization_id)
            .subquery()
        )
        analyses = (
            self.db.query(Analysis)
            .filter(Analysis.project_id.in_(project_ids))
            .order_by(Analysis.created_at.desc())
            .all()
        )
        projects = {
            project.id: project.name
            for project in self.db.query(Project).filter(
                Project.organization_id == current_user.organization_id
            )
        }
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(
            ["Analysis ID", "Project", "Filename", "Document Type",
             "Risk Score", "Risk Level", "Model", "Executive Summary", "Created At"]
        )
        for analysis in analyses:
            writer.writerow(
                [
                    analysis.id,
                    projects.get(analysis.project_id, ""),
                    analysis.filename,
                    analysis.document_type,
                    analysis.risk_score,
                    analysis.risk_level,
                    analysis.model_name,
                    analysis.executive_summary,
                    analysis.created_at.isoformat() if analysis.created_at else "",
                ]
            )
        buffer.seek(0)
        return buffer
    def export_report_pdf(self, current_user: User) -> io.BytesIO:
        summary = self.get_summary(current_user)
        project_ids = (
            self.db.query(Project.id)
            .filter(Project.organization_id == current_user.organization_id)
            .subquery()
        )
        analyses = (
            self.db.query(Analysis)
            .filter(Analysis.project_id.in_(project_ids))
            .order_by(Analysis.created_at.desc())
            .all()
        )
        projects = {
            p.id: p.name
            for p in self.db.query(Project).filter(
                Project.organization_id == current_user.organization_id
            )
        }
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.6*inch, bottomMargin=0.6*inch)
        styles = getSampleStyleSheet()
        elements = [Paragraph("Sentinel AI — Security Report", styles["Title"]), Spacer(1, 0.25*inch)]
        elements.append(Paragraph("Summary", styles["Heading2"]))
        summary_data = [
            ["Total Projects", str(summary.total_projects)],
            ["Total Analyses", str(summary.total_analyses)],
            ["Average Risk Score", str(summary.average_risk_score)],
            ["High Risk", str(summary.high_risk)],
            ["Medium Risk", str(summary.medium_risk)],
            ["Low Risk", str(summary.low_risk)],
        ]
        t1 = Table(summary_data, colWidths=[2.5*inch, 2.5*inch])
        t1.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (0,-1), colors.HexColor("#f1f5f9")),
            ("GRID", (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ("FONTSIZE", (0,0), (-1,-1), 9),
        ]))
        elements += [t1, Spacer(1, 0.3*inch), Paragraph("Analyses", styles["Heading2"])]
        table_data = [["Project","Filename","Type","Risk Score","Risk Level","Date"]]
        for a in analyses:
            table_data.append([
                projects.get(a.project_id, ""), a.filename, a.document_type,
                str(a.risk_score), a.risk_level,
                a.created_at.strftime("%Y-%m-%d") if a.created_at else "",
            ])
        t2 = Table(table_data, colWidths=[1.3*inch,1.5*inch,0.9*inch,0.8*inch,0.9*inch,0.9*inch], repeatRows=1)
        t2.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1e293b")),
            ("TEXTCOLOR", (0,0), (-1,0), colors.white),
            ("FONTSIZE", (0,0), (-1,-1), 8),
            ("GRID", (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ]))
        elements.append(t2)
        doc.build(elements)
        buffer.seek(0)
        return buffer
    
    def export_project_report_csv(self, current_user: User, project_id: int) -> io.StringIO:
        project = (
            self.db.query(Project)
            .filter(
                Project.id == project_id,
                Project.organization_id == current_user.organization_id,
            )
            .first()
        )
        if project is None:
            raise ValueError("Project not found.")

        analyses = (
            self.db.query(Analysis)
            .filter(Analysis.project_id == project_id)
            .order_by(Analysis.created_at.desc())
            .all()
        )
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(
            ["Analysis ID", "Filename", "Document Type",
             "Risk Score", "Risk Level", "Model", "Executive Summary", "Created At"]
        )
        for analysis in analyses:
            writer.writerow(
                [
                    analysis.id,
                    analysis.filename,
                    analysis.document_type,
                    analysis.risk_score,
                    analysis.risk_level,
                    analysis.model_name,
                    analysis.executive_summary,
                    analysis.created_at.isoformat() if analysis.created_at else "",
                ]
            )
        buffer.seek(0)
        return buffer

    def export_project_report_pdf(self, current_user: User, project_id: int) -> io.BytesIO:
        project = (
            self.db.query(Project)
            .filter(
                Project.id == project_id,
                Project.organization_id == current_user.organization_id,
            )
            .first()
        )
        if project is None:
            raise ValueError("Project not found.")

        analyses = (
            self.db.query(Analysis)
            .filter(Analysis.project_id == project_id)
            .order_by(Analysis.created_at.desc())
            .all()
        )
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.6*inch, bottomMargin=0.6*inch)
        styles = getSampleStyleSheet()
        elements = [
            Paragraph(f"Sentinel AI — {project.name} Report", styles["Title"]),
            Spacer(1, 0.25*inch),
            Paragraph("Analyses", styles["Heading2"]),
        ]
        table_data = [["Filename", "Type", "Risk Score", "Risk Level", "Date"]]
        for a in analyses:
            table_data.append([
                a.filename, a.document_type,
                str(a.risk_score), a.risk_level,
                a.created_at.strftime("%Y-%m-%d") if a.created_at else "",
            ])
        t = Table(table_data, colWidths=[1.8*inch, 1.0*inch, 0.9*inch, 0.9*inch, 0.9*inch], repeatRows=1)
        t.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1e293b")),
            ("TEXTCOLOR", (0,0), (-1,0), colors.white),
            ("FONTSIZE", (0,0), (-1,-1), 8),
            ("GRID", (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ]))
        elements.append(t)
        doc.build(elements)
        buffer.seek(0)
        return buffer