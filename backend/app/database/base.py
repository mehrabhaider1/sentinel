"""
Declarative base and naming-convention configuration for SQLAlchemy models.

This module defines the single shared `Base` class that every ORM model in
the application must inherit from, along with a deterministic naming
convention for all implicitly-generated database constraints (indexes,
unique constraints, foreign keys, primary keys, check constraints).

Why this matters:
    Without an explicit naming convention, SQLAlchemy delegates constraint
    naming to the underlying database driver, which is non-deterministic
    across backends (SQLite vs. PostgreSQL) and across schema changes.
    Alembic's autogenerate feature diffs migrations by comparing constraint
    *names* — if those names aren't stable and predictable, Alembic cannot
    reliably detect renames vs. drop+create, producing broken or destructive
    migration scripts. This convention is the pattern recommended in the
    official SQLAlchemy documentation and Alembic's naming-conventions guide:
    https://alembic.sqlalchemy.org/en/latest/naming.html

Do NOT define ORM model classes in this module. This module owns only the
declarative base and metadata configuration. Models belong in
`app/models/`, each inheriting from `Base` defined here.
"""

from __future__ import annotations

from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

# --------------------------------------------------------------------------
# Naming convention
# --------------------------------------------------------------------------
# Token reference:
#   %(table_name)s            -> the table's name
#   %(column_0_name)s         -> name of the first column in the constraint
#   %(column_0_N_name)s       -> names of all columns, joined with N as sep
#   %(referred_table_name)s   -> the table a foreign key references
#   %(constraint_name)s       -> user-supplied constraint name, if any
#
# Prefix conventions used below (industry-standard, matches Alembic's docs):
#   ix_  -> index
#   uq_  -> unique constraint
#   ck_  -> check constraint
#   fk_  -> foreign key
#   pk_  -> primary key
NAMING_CONVENTION: dict[str, str] = {
    "ix": "ix_%(table_name)s_%(column_0_name)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    """
    Shared declarative base for all ORM models in the application.

    Every model in `app/models/` must inherit from this class:

        class User(Base):
            __tablename__ = "users"
            id: Mapped[int] = mapped_column(primary_key=True)

    All models sharing this single `Base` is what allows:
      - `Base.metadata.create_all(engine)` to create every table at once
        (used in dev/test bootstrapping against SQLite).
      - Alembic's `env.py` to autogenerate migrations by introspecting
        `Base.metadata` and diffing it against the live database schema.
      - Cross-model relationships (`relationship()`) to resolve correctly,
        since SQLAlchemy looks up related classes via the shared registry
        attached to this base.

    The `metadata` override below attaches the naming convention so every
    constraint SQLAlchemy generates implicitly (e.g., an FK created via
    `ForeignKey("users.id")` with no explicit `name=` argument) gets a
    deterministic, predictable name instead of a database-assigned one.
    """

    metadata = MetaData(naming_convention=NAMING_CONVENTION)
