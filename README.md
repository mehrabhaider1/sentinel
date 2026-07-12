# Sentinel AI

**Enterprise AI Governance, Security, Compliance & Risk Intelligence Platform**

Built for the AMD Developer Hackathon Track 3 (Unicorn Track)

---

## What is Sentinel AI?

Sentinel AI analyzes enterprise documents, AI usage policies, security policies, vendor contracts, internal documentation, and compliance reports and produces automated, multi-agent AI risk analysis: security risk findings, compliance analysis against frameworks like ISO 27001 and NIST CSF, risk scoring, and prioritized recommendations.

It's built for the people who currently do this manually: CISOs, compliance officers, and procurement teams evaluating AI vendor contracts, internal AI policies, and security documentation, a process that today is slow, expensive, and inconsistent.

## Why it matters (and why AMD)

Compliance and security document review is sensitive by nature the documents involved (vendor contracts, internal security posture, policy drafts) are exactly the kind of material an enterprise does *not* want routed through a third-party AI API.

Sentinel AI's inference pipeline runs **entirely on AMD GPU infrastructure**  the FastAPI backend and the Gemma-2 model itself (served via vLLM) both run on AMD-provisioned compute, with zero calls to any external AI API. This isn't just a hackathon technical choice — it's the correct architecture for this product category: enterprise compliance tooling with full data locality and no third-party inference dependency.


## Features

- **Multi-agent analysis pipeline**: dedicated agents for security risk analysis and compliance analysis, orchestrated into a single structured report
- **Risk scoring** (0–100 scale) with severity-calibrated scoring rules
- **Findings & recommendations** with severity, category, and remediation guidance
- **Compliance framework mapping** (SOC 2, HIPAA, GDPR, ISO 27001)
- **JWT-authenticated multi-project workspace** with dashboards, risk trends, and history
- **Document parsing** for PDF and DOCX enterprise documents
- **Structured, validated AI output** — every model response is validated against a Pydantic schema before it reaches the database or the UI

## Tech Stack

**Backend**
- FastAPI, SQLAlchemy, SQLite
- JWT authentication, Pydantic
- Layered architecture: service layer, repository pattern, parser factory, agent orchestrator
- `uv` for dependency management

**AI Layer**
- Google Gemma-2-2B-IT, served locally via **vLLM** on **AMD GPU (ROCm)**
- OpenAI-compatible chat completions API, provider-agnostic client design

**Frontend**
- React, TypeScript, Tailwind CSS, shadcn/ui
- Recharts for data visualization, Framer Motion for animation

**Infrastructure**
- AMD Developer Cloud (backend + inference hosting)
- Docker (see `backend/Dockerfile`)

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- `uv` (Python package manager) — `pip install uv`
- An AMD GPU with ROCm + vLLM for local inference (or point `AI_BASE_URL` at any OpenAI-compatible endpoint)

### Backend Setup

```bash
cd backend
uv sync

cp .env.example .env   # configure environment variables, see below
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs`.

### Backend Setup (Docker)

```bash
cd backend
docker build -t sentinel-ai-backend .
docker run -p 8000:8000 --env-file .env sentinel-ai-backend
```

### Frontend Setup

```bash
cd frontend
npm install

# Configure the backend URL
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.production

npm run build
npm run preview
```

The frontend will be available at `http://localhost:4173`.

### Environment Variables

Key variables in `backend/.env`:

```bash
DATABASE_URL=sqlite:///./sentinel.db
SECRET_KEY=your-secret-key-here

# AI inference — provider-agnostic, OpenAI-compatible
AI_BASE_URL=http://localhost:8001/v1
AI_MODEL=google/gemma-2-2b-it
AI_API_KEY=not-needed
```

### Running the Inference Server (vLLM)

Sentinel AI expects an OpenAI-compatible chat completions endpoint at `AI_BASE_URL`. In our deployment, this is served locally via vLLM on an AMD GPU:

```bash
vllm serve google/gemma-2-2b-it \
  --port 8001 \
  --host 0.0.0.0 \
  --dtype bfloat16 \
  --gpu-memory-utilization 0.85 \
  --max-model-len 8192
```

Any OpenAI-compatible inference server can be substituted by changing `AI_BASE_URL` and `AI_MODEL` — no code changes required.

## Deployment Notes

In our hackathon deployment, the FastAPI backend and vLLM inference server both run directly on AMD Developer Cloud GPU infrastructure (outside a container, due to the complexity of containerizing ROCm + GPU passthrough within the hackathon timeframe). The backend application itself is containerized per the submission requirements (see `backend/Dockerfile`); the GPU inference layer runs natively on the AMD-provisioned hardware to ensure direct GPU access.

## License

Built for the AMD Developer Hackathon: ACT II (2026).
