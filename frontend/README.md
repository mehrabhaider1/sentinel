# Sentinel AI — Frontend

React + TypeScript + Vite + Tailwind + Framer Motion + Recharts + Lucide,
wired against the real FastAPI backend (no mock data — every screen calls
a real endpoint).

## Run it

```bash
npm install
cp .env.example .env      # leave VITE_API_BASE_URL empty to use the dev proxy
npm run dev                # http://localhost:5173
```

In another terminal, run the backend as usual (`uvicorn app.main:app --reload`
on port 8000 — the Vite dev server proxies `/api/*` to it, see `vite.config.ts`).

## Required backend patches before this will fully work

I built this against the exact contract of the backend you sent me. Three
things in that backend need a small fix first — none of these are frontend
bugs, they're backend routing gaps the frontend can't work around.

### 1. `dashboard.py` and `analysis.py` are missing `/api/v1` — REQUIRED, or every dashboard/analysis call 404s

Every other router (`auth`, `organizations`, `projects`) is mounted under
`/api/v1/...`. `dashboard.py` and `analysis.py` are not — as written today,
`GET /dashboard/summary` and `POST /projects/{id}/analyze` are mounted at
the **root** path, not under `/api/v1`. This frontend calls the `/api/v1/...`
versions (matching the pattern every other endpoint uses), so fix the two
routers to match:

```python
# app/api/v1/dashboard.py
router = APIRouter(
    prefix="/api/v1/dashboard",   # was: "/dashboard"
    tags=["Dashboard"],
)
```

```python
# app/api/v1/analysis.py
router = APIRouter(
    prefix="/api/v1",             # was: no prefix at all
    tags=["Analysis"],
)
```

**Why this matters beyond "it's broken":** inconsistent path prefixes across
routers is exactly the kind of thing that works fine for whoever wrote it
(they know the real paths) and silently breaks for the next person who
integrates against it — which today is this frontend, and in six months
might be a mobile app or a partner's API client. Pick one convention
(`/api/v1/*` everywhere, since 3 of 5 routers already use it) and enforce
it, ideally with a test that asserts every route in the OpenAPI schema
starts with `/api/v1`.

### 2. `POST /api/v1/auth/register` doesn't exist yet — REQUIRED for the signup page

`schemas/auth.py` already defines `RegisterRequest`, but no route in
`api/v1/auth.py` implements it. `src/pages/SignupPage.tsx` has the exact
route implementation you need in a comment at the top of the file — paste
it into `auth.py` under the existing `/login` route. Login still works
without this; only `/signup` needs it.

### 3. CORS origin, only if you don't use the Vite proxy

`Settings.cors_allow_origins` defaults to `["http://localhost:3000"]`. This
frontend runs on Vite's default port, `5173`. If you keep `VITE_API_BASE_URL`
empty (recommended — see `vite.config.ts`), the dev-server proxy makes this
a non-issue because the browser only ever talks to `localhost:5173`. If you
instead point `VITE_API_BASE_URL` straight at `http://localhost:8000`,
add `"http://localhost:5173"` to `cors_allow_origins` or the browser will
block every request.

## What's real vs. what's honestly approximated

- **Everything on Overview, Projects, History, and Analysis Details is
  live data from your API** — no mocks remain anywhere in this build.
- **History page** aggregates analyses by calling `GET /projects` then
  `GET /projects/{id}/analyses` for each project in parallel, because
  there's no org-wide `GET /api/v1/analyses` endpoint yet. Fine for a
  hackathon demo with a handful of projects; see the comment at the top
  of `src/pages/HistoryPage.tsx` for the real fix.
- **Compliance chart** is a range visualization (lowest/average/highest),
  not a time-series trend line — the backend's `/dashboard/compliance`
  only returns a snapshot, not history. I chose not to fabricate fake
  monthly data just to make the chart look more impressive; see the
  comment in `src/components/dashboard/ComplianceOverviewCard.tsx`.
- **Risk distribution donut** will under-count if you have any
  `risk_level="Critical"` analyses, because `schemas/dashboard.py`'s
  `RiskDistribution` has no `critical` field. Flagged in
  `src/components/dashboard/RiskDonut.tsx`.
- **Org switcher** lists every organization in the database, not just
  the ones you belong to, because `GET /api/v1/organizations` isn't
  tenant-scoped yet (this is the P0 from the earlier security review).
  Flagged in `src/components/layout/OrgSwitcher.tsx`.

## Structure

```
src/
  lib/api.ts              typed fetch client, one function per backend endpoint
  types/index.ts           TS mirror of every Pydantic schema
  context/AuthContext.tsx  session state, login/register/logout
  components/
    ui/primitives.tsx      Card, Button, Badge, RadialScore, Spinner, etc.
    layout/                Sidebar, Topbar, OrgSwitcher, UserMenu, AppShell
    dashboard/             RiskDonut, ComplianceOverviewCard, RecentTable
    UploadModal.tsx
    ProtectedRoute.tsx
  pages/
    LoginPage, SignupPage
    OverviewPage, ProjectsPage, ProjectDetailPage
    HistoryPage, AnalysisDetailsPage
```
