from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.core.security import get_current_user
from app.models.crm import Contact, Lead, Deal, Activity, LeadStatus, DealStage

router = APIRouter(prefix="/api/crm", tags=["CRM"], dependencies=[Depends(get_current_user)])

# ============ CONTACTS ============
@router.get("/contacts")
async def get_contacts(db: AsyncSession = Depends(get_db), skip: int = 0, limit: int = 100):
    result = await db.execute(select(Contact).offset(skip).limit(limit))
    contacts = result.scalars().all()
    return [
        {
            "id": c.id,
            "first_name": c.first_name,
            "last_name": c.last_name,
            "email": c.email,
            "phone": c.phone,
            "company": c.company,
            "position": c.position,
            "address": c.address,
            "notes": c.notes,
            "created_at": c.created_at.isoformat() if c.created_at else None
        }
        for c in contacts
    ]


@router.get("/contacts/{contact_id}")
async def get_contact(contact_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Contact).where(Contact.id == contact_id))
    c = result.scalars().first()
    if not c:
        raise HTTPException(status_code=404, detail="Contact not found")
        
    return {
        "id": c.id,
        "first_name": c.first_name,
        "last_name": c.last_name,
        "email": c.email,
        "phone": c.phone,
        "company": c.company,
        "position": c.position,
        "address": c.address,
        "notes": c.notes,
        "created_at": c.created_at.isoformat() if c.created_at else None
    }


# ============ LEADS ============
@router.get("/leads")
async def get_leads(db: AsyncSession = Depends(get_db), skip: int = 0, limit: int = 100):
    result = await db.execute(select(Lead).offset(skip).limit(limit))
    leads = result.scalars().all()
    return [
        {
            "id": l.id,
            "title": l.title,
            "contact_name": l.contact_name,
            "email": l.email,
            "phone": l.phone,
            "company": l.company,
            "source": l.source.value,
            "status": l.status.value,
            "score": l.score,
            "budget": l.estimated_value, # named budget in frontend
            "description": l.description,
            "created_at": l.created_at.isoformat() if l.created_at else None
        }
        for l in leads
    ]


@router.get("/leads/{lead_id}")
async def get_lead(lead_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    l = result.scalars().first()
    if not l:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    return {
        "id": l.id,
        "title": l.title,
        "contact_name": l.contact_name,
        "email": l.email,
        "phone": l.phone,
        "company": l.company,
        "source": l.source.value,
        "status": l.status.value,
        "score": l.score,
        "budget": l.estimated_value,
        "description": l.description,
        "created_at": l.created_at.isoformat() if l.created_at else None
    }


# ============ DEALS ============
@router.get("/deals")
async def get_deals(db: AsyncSession = Depends(get_db), skip: int = 0, limit: int = 100):
    result = await db.execute(select(Deal).offset(skip).limit(limit))
    deals = result.scalars().all()
    return [
        {
            "id": d.id,
            "title": d.title,
            "contact_id": d.contact_id,
            "lead_id": d.lead_id,
            "stage": d.stage.value,
            "amount": d.amount,
            "currency": d.currency,
            "probability": d.probability,
            "expected_close_date": str(d.expected_close_date) if d.expected_close_date else None,
            "description": d.description,
            "created_at": d.created_at.isoformat() if d.created_at else None
        }
        for d in deals
    ]


@router.get("/deals/{deal_id}")
async def get_deal(deal_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Deal).where(Deal.id == deal_id))
    d = result.scalars().first()
    if not d:
        raise HTTPException(status_code=404, detail="Deal not found")
        
    return {
        "id": d.id,
        "title": d.title,
        "contact_id": d.contact_id,
        "lead_id": d.lead_id,
        "stage": d.stage.value,
        "amount": d.amount,
        "currency": d.currency,
        "probability": d.probability,
        "expected_close_date": str(d.expected_close_date) if d.expected_close_date else None,
        "description": d.description,
        "created_at": d.created_at.isoformat() if d.created_at else None
    }


# ============ ACTIVITIES ============
@router.get("/activities")
async def get_activities(db: AsyncSession = Depends(get_db), skip: int = 0, limit: int = 100):
    result = await db.execute(select(Activity).offset(skip).limit(limit))
    activities = result.scalars().all()
    return [
        {
            "id": a.id, "type": a.type.value if a.type else "note",
            "title": a.title, "subject": a.title, "description": a.description,
            "contact_id": a.contact_id, "deal_id": a.deal_id, "lead_id": a.lead_id,
            "due_date": a.due_date.isoformat() if a.due_date else None,
            "completed": 1 if a.completed else 0,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        } for a in activities
    ]


@router.post("/activities", status_code=201)
async def create_activity(data: dict, db: AsyncSession = Depends(get_db)):
    activity = Activity(
        type=data.get("type", "note"), title=data.get("title", ""),
        description=data.get("description"), contact_id=data.get("contact_id"),
        deal_id=data.get("deal_id"), lead_id=data.get("lead_id"),
    )
    db.add(activity)
    await db.commit()
    await db.refresh(activity)
    return {"id": activity.id, "type": activity.type.value if activity.type else "note", "title": activity.title, "created_at": activity.created_at.isoformat() if activity.created_at else None}


@router.delete("/activities/{activity_id}")
async def delete_activity(activity_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Activity).where(Activity.id == activity_id))
    a = result.scalars().first()
    if not a:
        raise HTTPException(status_code=404, detail="Activity not found")
    await db.delete(a)
    await db.commit()
    return {"detail": "Activity deleted"}


# ============ PIPELINE STATS ============
@router.get("/pipeline/stats")
async def get_pipeline_stats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Deal))
    deals = result.scalars().all()

    stages = {"new": 0, "negotiation": 0, "proposal": 0, "contract": 0, "won": 0, "lost": 0}
    stage_amounts = {"new": 0.0, "negotiation": 0.0, "proposal": 0.0, "contract": 0.0, "won": 0.0, "lost": 0.0}
    for d in deals:
        stage = d.stage.value
        stages[stage] = stages.get(stage, 0) + 1
        stage_amounts[stage] = stage_amounts.get(stage, 0.0) + (d.amount or 0.0)

    return {
        "stages": stages,
        "stage_amounts": stage_amounts,
        "total_deals": len(deals),
        "total_amount": sum(d.amount or 0 for d in deals),
        "won_amount": stage_amounts["won"],
        "conversion_rate": round(stages["won"] / max(len(deals), 1) * 100, 1),
    }
@router.post("/contacts", status_code=200)
async def create_contact(data: dict, db: AsyncSession = Depends(get_db)):
    c = Contact(
        first_name=data.get("first_name", ""),
        last_name=data.get("last_name", ""),
        email=data.get("email"),
        phone=data.get("phone"),
        company=data.get("company"),
        position=data.get("position"),
        address=data.get("address"),
        notes=data.get("notes"),
    )
    db.add(c)
    await db.commit()
    await db.refresh(c)
    return {"id": c.id, "first_name": c.first_name, "last_name": c.last_name, "email": c.email}

@router.post("/leads", status_code=200)
async def create_lead(data: dict, db: AsyncSession = Depends(get_db)):
    # Calculate estimated value if budget is provided
    budget = data.get("budget") or data.get("estimated_value")
    if budget is not None:
        estimated_value = float(budget)
    else:
        estimated_value = 0.0

    l = Lead(
        title=data.get("title", "New Lead"),
        contact_name=data.get("contact_name") or (data.get("first_name", "") + " " + data.get("last_name", "")).strip() or "Unknown",
        email=data.get("email"),
        phone=data.get("phone"),
        company=data.get("company"),
        description=data.get("description"),
        source=data.get("source", "website"),
        status=data.get("status", LeadStatus.NEW),
        estimated_value=estimated_value,
    )
    db.add(l)
    await db.commit()
    await db.refresh(l)
    return {"id": l.id, "title": l.title, "status": l.status.value if hasattr(l.status, 'value') else l.status}

@router.post("/leads/{lead_id}/activities", status_code=200)
async def create_lead_activity(lead_id: int, data: dict, db: AsyncSession = Depends(get_db)):
    act = Activity(
        lead_id=lead_id,
        type=data.get("type", "note"),
        title=data.get("title", data.get("description", "Activity")),
        description=data.get("description"),
        due_date=datetime.fromisoformat(data["due_date"].replace('Z', '+00:00')) if data.get("due_date") else None
    )
    db.add(act)
    await db.commit()
    await db.refresh(act)
    return {"id": act.id, "status": "created"}

@router.post("/leads/{lead_id}/convert", status_code=200)
async def convert_lead(lead_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    l = result.scalars().first()
    if not l:
        raise HTTPException(status_code=404, detail="Lead not found")
    l.status = LeadStatus.CONVERTED
    d = Deal(
        title=l.title,
        lead_id=l.id,
        amount=l.estimated_value or 0.0,
        stage=DealStage.NEW
    )
    db.add(d)
    await db.commit()
    await db.refresh(d)
    return {"id": d.id, "title": d.title, "stage": "new"}

@router.put("/deals/{deal_id}", status_code=200)
async def update_deal(deal_id: int, data: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Deal).where(Deal.id == deal_id))
    d = result.scalars().first()
    if not d:
        raise HTTPException(status_code=404, detail="Deal not found")
    if "stage" in data:
        for stage in DealStage:
            if stage.value == data["stage"]:
                d.stage = stage
                break
    if "title" in data:
        d.title = data["title"]
    await db.commit()
    await db.refresh(d)
    return {"id": d.id, "stage": d.stage.value if hasattr(d.stage, 'value') else d.stage, "title": d.title}
