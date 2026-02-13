"""
Celery application — background task processor.
Uses Redis as broker and result backend.
"""
from celery import Celery
from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "erp_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.notifications",
        "app.tasks.reports",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Tashkent",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 min hard limit
    task_soft_time_limit=240,  # 4 min soft limit
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=100,
)

# Beat schedule — periodic tasks
celery_app.conf.beat_schedule = {
    "generate-daily-report": {
        "task": "app.tasks.reports.generate_daily_report",
        "schedule": 86400.0,  # every 24 hours
    },
    "send-pending-notifications": {
        "task": "app.tasks.notifications.send_pending_notifications",
        "schedule": 300.0,  # every 5 min
    },
}
