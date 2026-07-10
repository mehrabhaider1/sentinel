"""
Centralized logging configuration.

Rationale:
- Python's root logger is unconfigured by default (WARNING level, no formatter).
- Uvicorn's own loggers (uvicorn.access, uvicorn.error) are separate from
  the application logger namespace, so we configure both explicitly.
- We use dictConfig instead of basicConfig because dictConfig is declarative,
  testable, and scales cleanly when you later add JSON logging for
  log aggregation (e.g. shipping to Datadog/Loki in production).
"""

from __future__ import annotations

import logging
import logging.config
from typing import Any

from app.core.settings import Settings


def build_logging_config(settings: Settings) -> dict[str, Any]:
    """
    Build a dictConfig-compatible logging configuration.

    Kept as a pure function (not a side-effecting call) so it's independently
    unit-testable: assert on the dict without touching global logging state.
    """
    log_level = "DEBUG" if settings.debug else "INFO"

    return {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "default",
                "level": log_level,
            },
        },
        "loggers": {
            # Your application's own logger namespace
            "app": {
                "handlers": ["console"],
                "level": log_level,
                "propagate": False,
            },
            # Uvicorn's request access logs
            "uvicorn.access": {
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False,
            },
            "uvicorn.error": {
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False,
            },
        },
        "root": {
            "handlers": ["console"],
            "level": log_level,
        },
    }


def configure_logging(settings: Settings) -> None:
    """Apply logging configuration. Call once, at app startup."""
    logging.config.dictConfig(build_logging_config(settings))
