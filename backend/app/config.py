from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "ERP/CRM System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database (PostgreSQL 18 on port 5433)
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5433/erp_db"
    DATABASE_URL_SYNC: str = "postgresql://postgres:postgres@localhost:5433/erp_db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # JWT — MUST be set via .env
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Sentry
    SENTRY_DSN: str = ""

    # Prometheus
    ENABLE_METRICS: bool = True

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
