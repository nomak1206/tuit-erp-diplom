import sentry_sdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from app.config import get_settings
from app.api import auth, crm, accounting, hr, warehouse, projects, documents, analytics

settings = get_settings()

# ---------- Sentry ----------
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=0.3,
        profiles_sample_rate=0.1,
        environment="development" if settings.DEBUG else "production",
        release=f"erp-crm@{settings.APP_VERSION}",
        send_default_pii=False,
    )

# ---------- FastAPI ----------
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="ERP/CRM система автоматизации управления предприятием",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Prometheus Metrics ----------
if settings.ENABLE_METRICS:
    Instrumentator(
        should_group_status_codes=True,
        should_ignore_untemplated=True,
        excluded_handlers=["/metrics", "/docs", "/redoc", "/openapi.json"],
    ).instrument(app).expose(app, endpoint="/metrics")

# ---------- Routers ----------
app.include_router(auth.router)
app.include_router(crm.router)
app.include_router(accounting.router)
app.include_router(hr.router)
app.include_router(warehouse.router)
app.include_router(projects.router)
app.include_router(documents.router)
app.include_router(analytics.router)


@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
