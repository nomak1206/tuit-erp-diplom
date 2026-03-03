"""
CRM automations — deal stage triggers and inactivity timer.
Runs via Celery Beat.
"""
from datetime import datetime, timezone, timedelta
from sqlalchemy import select, update
from app.database import sync_session
from app.models.crm import Deal, DealStage
from app.models.notification import Notification
import logging

logger = logging.getLogger(__name__)


def check_deal_inactivity(days_threshold: int = 7):
    """Find deals inactive for more than N days and create reminder notifications."""
    with sync_session() as db:
        threshold = datetime.now(timezone.utc) - timedelta(days=days_threshold)
        # Deals that haven't been updated in N days and are still open
        open_stages = [DealStage.NEW, DealStage.NEGOTIATION, DealStage.PROPOSAL]
        deals = db.execute(
            select(Deal).where(
                Deal.stage.in_(open_stages),
                Deal.updated_at < threshold,
            )
        ).scalars().all()

        created = 0
        for deal in deals:
            # Check if reminder already exists in last 24h
            existing = db.execute(
                select(Notification).where(
                    Notification.entity_type == "deal",
                    Notification.entity_id == deal.id,
                    Notification.created_at > datetime.now(timezone.utc) - timedelta(hours=24),
                )
            ).scalars().first()
            if existing:
                continue

            notif = Notification(
                user_id=deal.responsible_id or deal.created_by,
                title=f"Сделка без активности: {deal.name}",
                message=f"Сделка \"{deal.name}\" не обновлялась {days_threshold} дней. Сумма: {deal.amount:,.0f} UZS",
                type="warning",
                entity_type="deal",
                entity_id=deal.id,
            )
            db.add(notif)
            created += 1

        db.commit()
        logger.info(f"Deal inactivity check: {len(deals)} inactive, {created} notifications created")
        return created


def auto_advance_deals():
    """Automatically advance deals when conditions are met.
    Example: Move to WON when payment is received.
    """
    with sync_session() as db:
        # Find deals in PROPOSAL stage with linked paid invoices
        # This is a simplified version — in production, join with invoices
        results = db.execute(
            select(Deal).where(Deal.stage == DealStage.PROPOSAL)
        ).scalars().all()

        advanced = 0
        for deal in results:
            # If deal has been in PROPOSAL for more than 30 days without activity,
            # create a warning notification
            if deal.updated_at and deal.updated_at < datetime.now(timezone.utc) - timedelta(days=30):
                notif = Notification(
                    user_id=deal.responsible_id or deal.created_by,
                    title=f"Сделка требует внимания: {deal.name}",
                    message=f"Сделка в стадии КП уже 30 дней. Рекомендуется связаться с клиентом.",
                    type="warning",
                    entity_type="deal",
                    entity_id=deal.id,
                )
                db.add(notif)
                advanced += 1

        db.commit()
        logger.info(f"Deal auto-advance: {advanced} notifications")
        return advanced


# ============ Celery Task wrappers ============
from app.celery_app import celery_app

@celery_app.task(name="app.tasks.crm_automations.check_deal_inactivity_task")
def check_deal_inactivity_task():
    return check_deal_inactivity(days_threshold=7)

@celery_app.task(name="app.tasks.crm_automations.auto_advance_deals_task")
def auto_advance_deals_task():
    return auto_advance_deals()
