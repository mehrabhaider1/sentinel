/**
 * These types are a 1:1 mirror of the backend's Pydantic schemas
 * (backend/app/schemas/*.py and backend/app/agents/models.py).
 *
 * WHY duplicate the shape by hand instead of importing it: FastAPI can
 * generate an OpenAPI schema (GET /openapi.json) which tools like
 * `openapi-typescript` turn into this file automatically. For a 4-day
 * hackathon, hand-typing is faster to get right *once*; for anything
 * longer-lived, wire up openapi-typescript so backend and frontend types
 * can never silently drift apart (a very common real-world bug: someone
 * renames a field in the Pydantic model and three frontend screens break
 * at runtime with no compile-time warning because the type was hand-typed
 * and never updated).
 */

export type Severity = "Critical" | "High" | "Medium" | "Low";
export type ComplianceStatus = "Pass" | "Fail" | "Partial";

// ---- Auth -----------------------------------------------------------------

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  organization_id: number;
  is_active: boolean;
}

// ---- Organization -----------------------------------------------------------

export interface Organization {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

// ---- Project ----------------------------------------------------------------

export interface Project {
  id: number;
  organization_id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Analysis (AI pipeline output) -------------------------------------------

export interface SecurityFinding {
  title: string;
  severity: Severity;
  category: string;
  description: string;
  recommendation: string;
}

export interface SecurityAnalysis {
  risk_score: number;
  risk_level: Severity;
  summary: string;
  findings: SecurityFinding[];
  top_priorities: string[];
}

export interface ComplianceFinding {
  framework: string;
  control: string;
  status: ComplianceStatus;
  recommendation: string;
}

export interface ComplianceAnalysis {
  compliance_score: number;
  summary: string;
  findings: ComplianceFinding[];
}

export interface ExecutiveSummary {
  overview: string;
  business_impact: string;
  recommended_next_steps: string[];
}

export interface FinalAnalysis {
  overall_risk_score: number;
  overall_risk_level: Severity;
  security: SecurityAnalysis;
  compliance: ComplianceAnalysis;
  executive_summary: ExecutiveSummary;
}

export interface AnalysisResponse {
  project_id: number;
  filename: string;
  analysis: FinalAnalysis;
}

export interface AnalysisListItem {
  id: number;
  filename: string;
  document_type: string;
  risk_score: number;
  risk_level: Severity;
  created_at: string;
}

export interface AnalysisDetail {
  id: number;
  project_id: number;
  filename: string;
  document_type: string;
  risk_score: number;
  risk_level: Severity;
  executive_summary: string;
  model_name: string;
  analysis_json: FinalAnalysis;
  created_at: string;
}

// ---- Dashboard ----------------------------------------------------------------

export interface DashboardSummary {
  total_projects: number;
  total_analyses: number;
  average_risk_score: number;
  critical_risk: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
}

export interface RecentAnalysis {
  id: number;
  project_id: number;
  filename: string;
  risk_score: number;
  risk_level: Severity;
  created_at: string;
}

export interface RiskDistribution {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface ComplianceOverview {
  average_score: number;
  highest_score: number;
  lowest_score: number;
}

export interface RiskTrendPoint {
  date: string;
  average_risk_score: number;
  analysis_count: number;
}

export interface ComplianceFrameworkScore {
  framework: string;
  score: number;
  total_findings: number;
}

export interface AIRecommendation {
  text: string;
  source: "security" | "compliance" | "executive_summary";
  occurrences: number;
}