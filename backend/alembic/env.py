import os
import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# Alembic Config object
config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ---------- Import ALL models via centralized __init__.py ----------
from app.database import Base
from app.models import (  # noqa: F401
    User, AuditLog,
    Contact, Lead, Deal, Activity,
    Account, JournalEntry, JournalLine, Invoice, Payment,
    Department, Employee, Timesheet, PayrollEntry, Leave,
    Category, Product, Warehouse, StockMovement, InventoryCheck,
    Project, Task, TaskComment,
    Document, DocumentVersion, ApprovalStep,
)

target_metadata = Base.metadata


def get_url() -> str:
    """
    Get database URL.
    Priority: DATABASE_URL env var > alembic.ini sqlalchemy.url
    This allows Docker to override the connection string via environment.
    """
    env_url = os.getenv("DATABASE_URL")
    if env_url:
        return env_url
    return config.get_main_option("sqlalchemy.url", "")


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Run migrations in 'online' mode with async engine."""
    # Build config section and override URL from environment if available
    section = config.get_section(config.config_ini_section, {})
    section["sqlalchemy.url"] = get_url()

    connectable = async_engine_from_config(
        section,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
