import type {
  AIRecommendation,
  AnalysisDetail,
  AnalysisListItem,
  AnalysisResponse,
  ComplianceFrameworkScore,
  ComplianceOverview,
  DashboardSummary,
  Organization,
  Project,
  RecentAnalysis,
  RiskDistribution,
  RiskTrendPoint,
  TokenResponse,
  User,
} from "../types";

/**
 * Base URL resolution:
 *  - In dev, leave VITE_API_BASE_URL empty and let vite.config.ts's proxy
 *    forward /api/* to the FastAPI server on :8000 (no CORS headaches).
 *  - In prod, set VITE_API_BASE_URL to the deployed backend's origin, e.g.
 *    https://api.sentinel-ai.yourteam.dev
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const TOKEN_KEY = "sentinel_access_token";

// ---------------------------------------------------------------------------
// Token storage
// ---------------------------------------------------------------------------
// NOTE (flagged deliberately, not an oversight): storing the JWT in
// localStorage is convenient but is readable by any JS that runs on the
// page, so it's vulnerable to XSS-based token theft. The production-correct
// pattern is an httpOnly, Secure, SameSite=strict cookie set by the backend,
// which JS can never read. For a 4-day hackathon this tradeoff is
// acceptable; do not ship this pattern to real users without revisiting it.
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = tokenStore.get();

  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!(options.body instanceof FormData) && !headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    // Token missing/expired/invalid — force back to login rather than
    // letting every screen render an ambiguous broken state.
    tokenStore.clear();
    window.location.assign("/login");
    throw new ApiError(401, "Session expired. Please sign in again.");
  }

  if (!res.ok) {
    // FastAPI's HTTPException serializes as { "detail": "..." }.
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      /* response wasn't JSON — fall back to statusText */
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const authApi = {
  /**
   * The backend's /auth/login uses FastAPI's OAuth2PasswordRequestForm,
   * which requires application/x-www-form-urlencoded with a `username`
   * field (not `email`, and not JSON) — this is OAuth2 spec convention,
   * not a Sentinel-specific choice. Mismatching this is the #1 way this
   * call silently 422s.
   */
  login: (email: string, password: string) => {
    const form = new URLSearchParams();
    form.set("username", email);
    form.set("password", password);
    return request<TokenResponse>("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
  },

  /**
   * NOTE: backend/app/schemas/auth.py already defines RegisterRequest, but
   * no /api/v1/auth/register ROUTE exists yet in api/v1/auth.py — this call
   * will 404 until that endpoint is added. See the note I gave you: it's a
   * ~15 line addition (create Organization + User with role=OWNER, then
   * return a TokenResponse the same way /login does).
   */
  register: (data: {
    email: string;
    password: string;
    full_name: string;
    organization_name: string;
  }) =>
    request<TokenResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => request<User>("/api/v1/auth/me"),
};

// ---------------------------------------------------------------------------
// Organizations
// ---------------------------------------------------------------------------
export const organizationsApi = {
  list: () => request<Organization[]>("/api/v1/organizations"),
  get: (id: number) => request<Organization>(`/api/v1/organizations/${id}`),
};

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
export const projectsApi = {
  list: () => request<Project[]>("/api/v1/projects"),
  get: (id: number) => request<Project>(`/api/v1/projects/${id}`),
  exportReport: async (projectId: number, format: "csv" | "pdf" = "csv") => {
    const token = tokenStore.get();
    const res = await fetch(
      `${BASE_URL}/api/v1/projects/${projectId}/export?format=${format}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
    );
    if (!res.ok) throw new ApiError(res.status, "Failed to export project report");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = format === "pdf" ? `project_${projectId}_report.pdf` : `project_${projectId}_report.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
  create: (data: { name: string; description?: string }) =>
    request<Project>("/api/v1/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: { name?: string; description?: string }) =>
    request<Project>(`/api/v1/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  remove: (id: number) =>
    request<void>(`/api/v1/projects/${id}`, { method: "DELETE" }),
};

// ---------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------
export const analysisApi = {
  analyze: (projectId: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<AnalysisResponse>(`/api/v1/projects/${projectId}/analyze`, {
      method: "POST",
      body: form,
    });
  },
  listAll: () =>
    request<AnalysisListItem[]>("/api/v1/analyses"),
  listForProject: (projectId: number) =>
    request<AnalysisListItem[]>(`/api/v1/projects/${projectId}/analyses`),
  get: (analysisId: number) =>
    request<AnalysisDetail>(`/api/v1/analyses/${analysisId}`),
  remove: (analysisId: number) =>
    request<void>(`/api/v1/analyses/${analysisId}`, { method: "DELETE" }),
};

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
export const dashboardApi = {
  summary: () => request<DashboardSummary>("/api/v1/dashboard/summary"),
  recent: () => request<RecentAnalysis[]>("/api/v1/dashboard/recent"),
  riskDistribution: () =>
    request<RiskDistribution>("/api/v1/dashboard/risk-distribution"),
  compliance: () =>
    request<ComplianceOverview>("/api/v1/dashboard/compliance"),
    riskTrend: (days: number = 7) => request<RiskTrendPoint[]>(`/api/v1/dashboard/risk-trend?days=${days}`),
    complianceByFramework: () => request<ComplianceFrameworkScore[]>("/api/v1/dashboard/compliance-by-framework"),
    recommendations: (limit: number = 6) => request<AIRecommendation[]>(`/api/v1/dashboard/recommendations?limit=${limit}`),
  exportReport: async (format: "csv" | "pdf" = "csv") => {
    const token = tokenStore.get();
    const res = await fetch(`${BASE_URL}/api/v1/dashboard/export?format=${format}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) throw new ApiError(res.status, "Failed to export report");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = format === "pdf" ? "sentinel_report.pdf" : "sentinel_report.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};