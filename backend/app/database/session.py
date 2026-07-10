"""
Database engine and session management.

This module owns the SQLAlchemy engine (the connection pool), the
`SessionLocal` session factory, and the `get_db()` FastAPI dependency used
to inject a request-scoped `Session` into route handlers and services.

Lifetime model:
    engine          -> created once at import time, lives for the process
    SessionLocal    -> a factory (callable), created once, lives for the process
    Session (via    -> created fresh per request, closed at the end of
    get_db())          that request via the generator's `finally` block

Do NOT define ORM model classes in this module. Models belong in
`app/models/` and import `Base` from `app.database.base`.
"""

from __future__ import annotations

from collections.abc import Generator
from typing import Any

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.settings import settings

# --------------------------------------------------------------------------
# Engine
# --------------------------------------------------------------------------
# `connect_args` is driver-specific. SQLite's DBAPI (sqlite3) defaults to
# raising an error if a connection is used from a thread other than the one
# that created it. FastAPI runs sync route handlers/dependencies in a
# thread pool, so a request's connection may legitimately be touched from a
# different OS thread than the one that opened it. Because each request
# gets its own dedicated Session (see get_db() below), there is no actual
# concurrent-access hazard here — disabling the check is safe and is the
# pattern documented by SQLAlchemy itself for use with SQLite + web
# frameworks. This argument is SQLite-only: PostgreSQL's driver does not
# accept `check_same_thread` and will raise a TypeError if passed it, so
# it must never be applied unconditionally.
_connect_args: dict[str, Any] = {}
if settings.DATABASE_URL.startswith("sqlite"):
    _connect_args["check_same_thread"] = False

engine: Engine = create_engine(
    settings.DATABASE_URL,
    connect_args=_connect_args,
    # `pool_pre_ping` issues a lightweight SELECT 1 before handing out a
    # pooled connection, transparently recycling connections the DB server
    # has silently dropped (e.g. after an idle timeout on managed Postgres
    # like RDS/Supabase). Without this, the first request after an idle
    # period fails with an "SSL connection has been closed unexpectedly"
    # style error instead of the pool self-healing.
    pool_pre_ping=True,
    future=True,
    # Verbose SQL logging is genuinely useful in local development for
    # understanding what SQLAlchemy actually sends to the DB, but must
    # never be left on in production — it logs full statement text
    # (including any bound parameter values in some configurations),
    # which is both a performance cost and a potential data-exposure risk.
    echo=settings.debug,
)

# --------------------------------------------------------------------------
# Session factory
# --------------------------------------------------------------------------
# `sessionmaker` returns a FACTORY, not a session. Calling SessionLocal()
# produces a new Session bound to `engine`'s connection pool. We configure
# it once, here, at module import time — every request-scoped session
# created by get_db() below is produced by calling this same factory.
SessionLocal: sessionmaker[Session] = sessionmaker(
    bind=engine,
    # autocommit is removed/irrelevant in SQLAlchemy 2.0's session model —
    # transactions are managed explicitly via commit()/rollback(), which is
    # the correct, predictable behavior for a web application: you decide
    # exactly when a transaction ends, rather than the ORM guessing.
    autoflush=False,
    # We manage commits explicitly in the service/repository layer that
    # uses this session — the session itself should not decide when to
    # persist changes to the database. This keeps transaction boundaries
    # aligned with business-logic boundaries (e.g., "create user + create
    # audit log" should commit together, or not at all).
    autocommit=False,
)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a request-scoped SQLAlchemy Session.

    Usage in a route:

        @router.get("/simulations/{sim_id}")
        def get_simulation(sim_id: int, db: Session = Depends(get_db)) -> ...:
            ...

    The `finally: db.close()` block guarantees the session (and the
    connection it holds from the pool) is released back to the pool at the
    end of the request — regardless of whether the route handler completed
    successfully or raised an exception. Without this guarantee, exceptions
    in route handlers would leak connections, exhausting the pool under
    load.

    Note: this function intentionally does NOT commit or rollback the
    session. Transaction boundaries belong to the caller (typically a
    service-layer function), not to this low-level dependency — committing
    here would force every route to share the same transaction semantics,
    which breaks down the moment you need multi-step operations that must
    succeed or fail atomically together.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
