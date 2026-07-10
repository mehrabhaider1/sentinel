"""
Global exception handling.

Rationale:
- Every error response should have a consistent JSON shape, regardless of
  where in the call stack it originated. Frontend/API consumers should never
  need a special code path for "some error I didn't anticipate."
- We NEVER leak internal exception messages or tracebacks to the client for
  unhandled (non-HTTPException) errors — that's an information-disclosure
  risk. We log the full traceback server-side instead.
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

logger = logging.getLogger("app.exceptions")


def _error_body(
    message: str, *, detail: Any = None, code: str | None = None
) -> dict[str, Any]:
    """Consistent error envelope shape used across all error responses."""
    body: dict[str, Any] = {"error": {"message": message}}
    if detail is not None:
        body["error"]["detail"] = detail
    if code is not None:
        body["error"]["code"] = code
    return body


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Handles FastAPI/Starlette HTTPException (raise HTTPException(status_code=...)).
    These are *expected* errors your own code raised deliberately — e.g. 404,
    403, 409 — so it's safe to pass exc.detail straight through to the client.
    """
    logger.warning(
        "HTTPException: status=%s path=%s detail=%s",
        exc.status_code,
        request.url.path,
        exc.detail,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=_error_body(message=str(exc.detail), code="HTTP_EXCEPTION"),
        headers=exc.headers,
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """
    Handles Pydantic validation failures on request bodies/query params.
    FastAPI's default 422 body is fine structurally, but we normalize it into
    our own envelope so clients only ever parse one error shape.
    """
    logger.info("Validation error: path=%s errors=%s", request.url.path, exc.errors())
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=_error_body(
            message="Request validation failed",
            detail=exc.errors(),
            code="VALIDATION_ERROR",
        ),
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Catch-all for anything not explicitly handled above — bugs, third-party
    library errors, unexpected None derefs, etc.

    CRITICAL: log the full exception with traceback server-side via
    exc_info=True, but return a generic message to the client. Never str(exc)
    here in production — it can leak internal paths, SQL, API keys in error
    messages from misconfigured clients, etc.
    """
    logger.error(
        "Unhandled exception: path=%s method=%s",
        request.url.path,
        request.method,
        exc_info=exc,
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=_error_body(
            message="An unexpected error occurred. Please try again later.",
            code="INTERNAL_SERVER_ERROR",
        ),
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Wire all exception handlers onto the app instance. Call once in create_app()."""
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
