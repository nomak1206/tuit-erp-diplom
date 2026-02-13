"""
Notification tasks — email sending, push notifications, webhooks.
"""
import logging
from app.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_email_notification(self, to_email: str, subject: str, body: str):
    """Send email notification (SMTP integration placeholder)."""
    try:
        logger.info(f"Sending email to {to_email}: {subject}")
        # TODO: integrate with SMTP / SendGrid / Mailgun
        # smtp_client.send(to=to_email, subject=subject, body=body)
        return {"status": "sent", "to": to_email, "subject": subject}
    except Exception as exc:
        logger.error(f"Email send failed: {exc}")
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=3)
def send_deal_status_notification(self, deal_id: int, new_status: str, user_id: int):
    """Notify relevant users when deal status changes."""
    try:
        logger.info(f"Deal #{deal_id} status changed to {new_status} by user #{user_id}")
        # TODO: fetch deal, find observers, send notifications
        return {"deal_id": deal_id, "status": new_status, "notified": True}
    except Exception as exc:
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=3)
def send_task_assignment_notification(self, task_id: int, assignee_id: int):
    """Notify user when a task is assigned to them."""
    try:
        logger.info(f"Task #{task_id} assigned to user #{assignee_id}")
        return {"task_id": task_id, "assignee_id": assignee_id, "notified": True}
    except Exception as exc:
        raise self.retry(exc=exc)


@celery_app.task
def send_invoice_reminder(invoice_id: int):
    """Send payment reminder for overdue invoices."""
    logger.info(f"Sending payment reminder for invoice #{invoice_id}")
    return {"invoice_id": invoice_id, "reminder_sent": True}


@celery_app.task
def send_pending_notifications():
    """Periodic task: process queued notifications."""
    logger.info("Processing pending notifications queue...")
    # TODO: query pending notifications from DB, send them
    return {"processed": 0}
