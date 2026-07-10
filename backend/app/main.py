"""
Application entrypoint.

Run with:
    uvicorn app.main:app --reload

`app` at module level is required by uvicorn's default import string, but
everything it does is delegate to create_app() — the factory is the real
source of truth, and is what tests import directly.
"""

from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.router import api_router
from app.core.exceptions import register_exception_handlers
from app.core.logging_config import configure_logging
from app.core.settings import Settings
from app.middleware.cors import configure_cors

logger = logging.getLogger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """
    Startup/shutdown hook.

    Currently minimal — this is intentionally the ONE place you'll wire up:
      - database engine creation + disposal (when SQLAlchemy lands)
      - warming up any agent/model clients
      - background task schedulers
    Keep it a thin orchestrator; put actual connection logic in
    app/database/ or app/services/, and call it from here.
    """
    logger.info(
        "Sentinel AI starting up (env=%s, debug=%s)",
        app.state.settings.environment
        if hasattr(app.state.settings, "environment")
        else "unknown",
        app.state.settings.debug,
    )

    yield  # <- application runs while suspended here

    logger.info("Sentinel AI shutting down")


def create_app() -> FastAPI:
    """
    Application factory.

    Order matters here and is deliberate:
      1. Load settings first — everything downstream depends on config.
      2. Configure logging before anything else logs.
      3. Construct FastAPI with metadata.
      4. Attach middleware (CORS).
      5. Register exception handlers.
      6. Include routers last, once the app is fully configured.
    """
    settings = Settings()
    configure_logging(settings)

    app = FastAPI(
        title=settings.app_name,
        description=settings.app_description,
        version=settings.app_version,
        docs_url=settings.docs_url,
        redoc_url=settings.redoc_url,
        lifespan=lifespan,
    )

    # Stash settings on app.state so routers/services can access via request.app.state.settings
    # instead of re-instantiating Settings() everywhere (which would re-read .env repeatedly).
    app.state.settings = settings

    configure_cors(app, settings)
    register_exception_handlers(app)

    app.include_router(api_router)

    return app


app = create_app()
