"""
CORS configuration.

Rationale:
- CORS is a browser-enforced security boundary, not a server-side one — it
  does NOT protect your API from non-browser clients (curl, server-to-server
  calls). Don't rely on it as your only access control layer once auth exists.
- allow_origins should NEVER be "*" in combination with allow_credentials=True
  — browsers will reject that combination anyway (it's a documented spec
  violation), but more importantly it's meaningless as a boundary.
- Origins are pulled from Settings so dev/staging/prod each get explicit,
  auditable allow-lists rather than hardcoded strings scattered in code.
"""

from __future__ import annotations

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.core.settings import Settings


def configure_cors(app: FastAPI, settings: Settings) -> None:
    """Attach CORS middleware to the app instance using configured origins."""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
