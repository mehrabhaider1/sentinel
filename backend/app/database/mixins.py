"""
Reusable SQLAlchemy declarative mixins.

This module defines cross-cutting column mixins that ORM models compose in
alongside `Base` (see app/database/base.py) to gain standard behavior
without duplicating column definitions in every model.

`TimestampMixin` provides `created_at` / `updated_at` columns using
timezone-aware UTC datetimes. Timestamps are generated in Python
(`datetime.now(timezone.utc)`) rather than via the database's `now()`/
`CURRENT_TIMESTAMP` function. This is a deliberate choice: this project
targets SQLite in development and PostgreSQL in production, and these
backends do not represent `CURRENT_TIMESTAMP` identically — SQLite returns
a timezone-naive UTC string, while PostgreSQL's `now()` returns a proper
`timestamptz`. Computing the timestamp in the application guarantees the
exact same, correctly timezone-aware value regardless of which database
backend is active. If this application is later deployed across multiple
concurrent instances where server-side timestamp generation becomes
preferable (to avoid dependence on each instance's system clock), migrate
`default=` to `server_default=func.now()` at that time — see the inline
note below.

Do NOT define ORM model classes in this module. Mixins here must not
inherit `DeclarativeBase` themselves; they are combined with `Base` at the
model definition site (e.g. `class Simulation(Base, TimestampMixin): ...`).
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime
from sqlalchemy.orm import Mapped, mapped_column


def _utcnow() -> datetime:
    """
    Return the current time as a timezone-aware UTC datetime.

    Factored into a named function (rather than an inline lambda) for two
    reasons: it's independently unit-testable (you can monkeypatch
    `app.database.mixins._utcnow` in tests to freeze time), and it avoids
    creating a new lambda object per mapped_column() call, which is
    marginally clearer when inspecting the mapped column's `default` in a
    debugger — you see a named function, not `<lambda at 0x...>`.
    """
    return datetime.now(timezone.utc)


class TimestampMixin:
    """
    Adds `created_at` and `updated_at` columns to any model it's combined
    with.

    Usage:

        class Simulation(Base, TimestampMixin):
            __tablename__ = "simulations"
            id: Mapped[int] = mapped_column(primary_key=True)

    Both columns store timezone-aware UTC datetimes:
      - `created_at` is set once, at insert time, and never changes again.
      - `updated_at` is set at insert time and automatically refreshed by
        SQLAlchemy on every subsequent UPDATE to the row, via `onupdate`.
        This guarantees `updated_at` stays accurate even for updates issued
        via bulk `update()` statements or service code that forgets to set
        it manually — the guarantee lives at the column level, not in
        application discipline.

    `DateTime(timezone=True)` is required for both columns — omitting it
    causes PostgreSQL to store a `timestamp without time zone` column,
    silently discarding the UTC offset and reintroducing exactly the
    ambiguity ("is this UTC? server-local? unknown?") that timezone-aware
    timestamps exist to eliminate.
    """

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=_utcnow,
        nullable=False,
        doc="UTC timestamp when this row was first inserted.",
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=_utcnow,
        onupdate=_utcnow,
        nullable=False,
        doc="UTC timestamp when this row was last modified.",
    )
