import asyncio
import os
import sys

# Add app package to path securely
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import async_session
from app.models.crm import Contact, Lead, Deal
from sqlalchemy import select

async def clean_db():
    print("Starting database cleanup...")
    async with async_session() as db:
        # Delete invalid contact
        invalid = (await db.execute(select(Contact).where(Contact.email == 'not_an_email'))).scalars().first()
        if invalid:
            await db.delete(invalid)
            print(f'Deleted invalid contact {invalid.id}')

        # Find duplicate leads
        leads = (await db.execute(select(Lead))).scalars().all()
        seen_lead_titles = set()
        for lead in leads:
            if lead.title in seen_lead_titles:
                await db.delete(lead)
                print(f'Deleted duplicate lead {lead.id} ({lead.title})')
            else:
                seen_lead_titles.add(lead.title)

        # Find duplicate deals
        deals = (await db.execute(select(Deal))).scalars().all()
        seen_deal_titles = set()
        for deal in deals:
            if deal.title in seen_deal_titles:
                await db.delete(deal)
                print(f'Deleted duplicate deal {deal.id} ({deal.title})')
            else:
                seen_deal_titles.add(deal.title)
        
        await db.commit()
    print("Database cleanup finished.")

if __name__ == '__main__':
    asyncio.run(clean_db())
