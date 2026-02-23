import asyncio
import os
import sys
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import async_session
from app.models.user import User
from app.models.notification import Notification

async def seed_n():
    async with async_session() as session:
        admin = (await session.execute(select(User).where(User.email == "admin@tashkent.erp"))).scalars().first()
        if not admin:
            print("Admin user not found!")
            return

        print("Seeding demo notifications for Admin...")
        n_crm = Notification(
            user_id=admin.id, type="success", title="crm.new_lead_title",
            description="crm.new_lead_desc", module="crm", link="/crm/leads"
        )
        n_acc = Notification(
            user_id=admin.id, type="info", title="accounting.invoice_paid_title",
            description="accounting.invoice_paid_desc", module="accounting", link="/accounting/trial-balance"
        )
        n_hr = Notification(
            user_id=admin.id, type="warning", title="hr.vacation_request_title",
            description="hr.vacation_request_desc", module="hr", link="/hr/employees"
        )
        n_wh = Notification(
            user_id=admin.id, type="error", title="warehouse.low_stock_title",
            description="warehouse.low_stock_desc", module="warehouse", link="/warehouse"
        )
        n_proj = Notification(
            user_id=admin.id, type="info", title="projects.new_task_title",
            description="projects.new_task_desc", module="projects", link="/projects"
        )
        n_doc = Notification(
            user_id=admin.id, type="success", title="documents.document_signed",
            description="documents.contract_approved", module="documents", link="/documents"
        )

        session.add_all([n_crm, n_acc, n_hr, n_wh, n_proj, n_doc])
        await session.commit()
        print("Notifications seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_n())
