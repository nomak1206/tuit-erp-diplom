from fastapi import APIRouter, HTTPException
from typing import Optional
from datetime import datetime, timezone

router = APIRouter(prefix="/api/crm", tags=["CRM"])

# ============ DEMO DATA ============
_contacts = [
    {"id": 1, "first_name": "Азиз", "last_name": "Каримов", "email": "aziz@example.com", "phone": "+998901111111", "company": "TechCorp UZ", "position": "CEO", "address": "Ташкент, Мирзо Улугбек", "notes": "VIP клиент", "created_at": "2026-01-15T10:00:00Z"},
    {"id": 2, "first_name": "Нодира", "last_name": "Рахимова", "email": "nodira@example.com", "phone": "+998902222222", "company": "BuildPro", "position": "Закупщик", "address": "Самарканд", "notes": "", "created_at": "2026-01-20T14:00:00Z"},
    {"id": 3, "first_name": "Дмитрий", "last_name": "Ким", "email": "dmitriy@example.com", "phone": "+998903333333", "company": "LogiTrans", "position": "Директор", "address": "Бухара", "notes": "Партнёр по логистике", "created_at": "2026-02-01T09:00:00Z"},
    {"id": 4, "first_name": "Шахзод", "last_name": "Усманов", "email": "shahzod@example.com", "phone": "+998904444444", "company": "FoodMarket", "position": "Менеджер", "address": "Наманган", "notes": "", "created_at": "2026-02-05T11:00:00Z"},
    {"id": 5, "first_name": "Лола", "last_name": "Мирзаева", "email": "lola@example.com", "phone": "+998905555555", "company": "MediaGroup", "position": "Маркетолог", "address": "Ташкент, Чиланзар", "notes": "Рекламное агентство", "created_at": "2026-02-10T16:00:00Z"},
]

_leads = [
    {"id": 1, "title": "Автоматизация склада", "contact_name": "Азиз Каримов", "email": "aziz@example.com", "phone": "+998901111111", "company": "TechCorp UZ", "source": "website", "status": "qualified", "score": 85, "budget": 15000000, "description": "Нужна система управления складом", "created_at": "2026-01-10T10:00:00Z"},
    {"id": 2, "title": "CRM для строительной компании", "contact_name": "Нодира Рахимова", "email": "nodira@example.com", "phone": "+998902222222", "company": "BuildPro", "source": "referral", "status": "contacted", "score": 70, "budget": 25000000, "description": "CRM + управление проектами", "created_at": "2026-01-18T14:00:00Z"},
    {"id": 3, "title": "ERP для логистики", "contact_name": "Дмитрий Ким", "email": "dmitriy@example.com", "phone": "+998903333333", "company": "LogiTrans", "source": "cold_call", "status": "new", "score": 60, "budget": 50000000, "description": "Полная автоматизация логистики", "created_at": "2026-02-01T09:00:00Z"},
    {"id": 4, "title": "Торговая платформа", "contact_name": "Шахзод Усманов", "email": "shahzod@example.com", "phone": "+998904444444", "company": "FoodMarket", "source": "advertisement", "status": "new", "score": 45, "budget": 8000000, "description": "Онлайн торговля продуктами", "created_at": "2026-02-05T11:00:00Z"},
    {"id": 5, "title": "Маркетинговая аналитика", "contact_name": "Лола Мирзаева", "email": "lola@example.com", "phone": "+998905555555", "company": "MediaGroup", "source": "social", "status": "converted", "score": 90, "budget": 12000000, "description": "Система аналитики рекламных кампаний", "created_at": "2026-02-08T16:00:00Z"},
]

_deals = [
    {"id": 1, "title": "Внедрение ERP TechCorp", "contact_id": 1, "lead_id": 1, "stage": "contract", "amount": 15000000, "currency": "UZS", "probability": 90, "expected_close_date": "2026-03-01", "description": "Финальный этап согласования", "created_at": "2026-01-20T10:00:00Z"},
    {"id": 2, "title": "CRM BuildPro", "contact_id": 2, "lead_id": 2, "stage": "proposal", "amount": 25000000, "currency": "UZS", "probability": 60, "expected_close_date": "2026-04-15", "description": "Подготовка коммерческого предложения", "created_at": "2026-01-25T14:00:00Z"},
    {"id": 3, "title": "Логистика LogiTrans", "contact_id": 3, "lead_id": 3, "stage": "new", "amount": 50000000, "currency": "UZS", "probability": 30, "expected_close_date": "2026-06-01", "description": "Первичная встреча проведена", "created_at": "2026-02-02T09:00:00Z"},
    {"id": 4, "title": "Аналитика MediaGroup", "contact_id": 5, "lead_id": 5, "stage": "won", "amount": 12000000, "currency": "UZS", "probability": 100, "expected_close_date": "2026-02-10", "description": "Контракт подписан", "created_at": "2026-02-09T16:00:00Z"},
    {"id": 5, "title": "Торговый терминал FoodMarket", "contact_id": 4, "lead_id": 4, "stage": "negotiation", "amount": 8000000, "currency": "UZS", "probability": 45, "expected_close_date": "2026-05-01", "description": "Обсуждение требований", "created_at": "2026-02-06T11:00:00Z"},
    {"id": 6, "title": "Обновление CRM TechCorp", "contact_id": 1, "lead_id": None, "stage": "new", "amount": 5000000, "currency": "UZS", "probability": 20, "expected_close_date": "2026-07-01", "description": "Модернизация существующей системы", "created_at": "2026-02-11T10:00:00Z"},
    {"id": 7, "title": "Мобильное приложение BuildPro", "contact_id": 2, "lead_id": None, "stage": "lost", "amount": 18000000, "currency": "UZS", "probability": 0, "expected_close_date": "2026-03-15", "description": "Клиент выбрал другого подрядчика", "created_at": "2026-02-03T14:00:00Z"},
]

_activities = [
    {"id": 1, "type": "call", "title": "Звонок Азизу Каримову", "description": "Обсудить условия контракта", "contact_id": 1, "deal_id": 1, "lead_id": None, "due_date": "2026-02-13T10:00:00Z", "completed": 0, "created_at": "2026-02-12T08:00:00Z"},
    {"id": 2, "type": "meeting", "title": "Презентация для BuildPro", "description": "Демо CRM-системы", "contact_id": 2, "deal_id": 2, "lead_id": None, "due_date": "2026-02-14T14:00:00Z", "completed": 0, "created_at": "2026-02-12T09:00:00Z"},
    {"id": 3, "type": "email", "title": "КП для LogiTrans", "description": "Отправить коммерческое предложение", "contact_id": 3, "deal_id": 3, "lead_id": None, "due_date": "2026-02-13T16:00:00Z", "completed": 0, "created_at": "2026-02-12T10:00:00Z"},
    {"id": 4, "type": "task", "title": "Подготовить договор", "description": "Стандартный договор для MediaGroup", "contact_id": 5, "deal_id": 4, "lead_id": None, "due_date": "2026-02-12T18:00:00Z", "completed": 1, "created_at": "2026-02-11T10:00:00Z"},
    {"id": 5, "type": "note", "title": "Заметка по FoodMarket", "description": "Клиент просит скидку 10%", "contact_id": 4, "deal_id": 5, "lead_id": None, "due_date": None, "completed": 0, "created_at": "2026-02-12T11:00:00Z"},
]


# ============ CONTACTS ============
@router.get("/contacts")
async def get_contacts():
    return _contacts


@router.get("/contacts/{contact_id}")
async def get_contact(contact_id: int):
    for c in _contacts:
        if c["id"] == contact_id:
            return c
    raise HTTPException(status_code=404, detail="Contact not found")


@router.post("/contacts")
async def create_contact(data: dict):
    new_id = max(c["id"] for c in _contacts) + 1 if _contacts else 1
    contact = {"id": new_id, **data, "created_at": datetime.now(timezone.utc).isoformat()}
    _contacts.append(contact)
    return contact


@router.patch("/contacts/{contact_id}")
async def update_contact(contact_id: int, data: dict):
    for c in _contacts:
        if c["id"] == contact_id:
            c.update(data)
            return c
    raise HTTPException(status_code=404, detail="Contact not found")


@router.delete("/contacts/{contact_id}")
async def delete_contact(contact_id: int):
    global _contacts
    before = len(_contacts)
    _contacts = [c for c in _contacts if c["id"] != contact_id]
    if len(_contacts) == before:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"detail": "Contact deleted"}


# ============ LEADS ============
@router.get("/leads")
async def get_leads():
    return _leads


@router.get("/leads/{lead_id}")
async def get_lead(lead_id: int):
    for l in _leads:
        if l["id"] == lead_id:
            return l
    raise HTTPException(status_code=404, detail="Lead not found")


@router.post("/leads")
async def create_lead(data: dict):
    new_id = max(l["id"] for l in _leads) + 1 if _leads else 1
    lead = {"id": new_id, **data, "created_at": datetime.now(timezone.utc).isoformat()}
    _leads.append(lead)
    return lead


@router.patch("/leads/{lead_id}")
async def update_lead(lead_id: int, data: dict):
    for l in _leads:
        if l["id"] == lead_id:
            l.update(data)
            return l
    raise HTTPException(status_code=404, detail="Lead not found")


@router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: int):
    global _leads
    before = len(_leads)
    _leads = [l for l in _leads if l["id"] != lead_id]
    if len(_leads) == before:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"detail": "Lead deleted"}


# ============ DEALS ============
@router.get("/deals")
async def get_deals():
    return _deals


@router.get("/deals/{deal_id}")
async def get_deal(deal_id: int):
    for d in _deals:
        if d["id"] == deal_id:
            return d
    raise HTTPException(status_code=404, detail="Deal not found")


@router.post("/deals")
async def create_deal(data: dict):
    new_id = max(d["id"] for d in _deals) + 1 if _deals else 1
    deal = {"id": new_id, **data, "created_at": datetime.now(timezone.utc).isoformat()}
    _deals.append(deal)
    return deal


@router.patch("/deals/{deal_id}")
async def update_deal(deal_id: int, data: dict):
    for d in _deals:
        if d["id"] == deal_id:
            d.update(data)
            return d
    raise HTTPException(status_code=404, detail="Deal not found")


@router.delete("/deals/{deal_id}")
async def delete_deal(deal_id: int):
    global _deals
    before = len(_deals)
    _deals = [d for d in _deals if d["id"] != deal_id]
    if len(_deals) == before:
        raise HTTPException(status_code=404, detail="Deal not found")
    return {"detail": "Deal deleted"}


# ============ ACTIVITIES ============
@router.get("/activities")
async def get_activities():
    return _activities


@router.post("/activities")
async def create_activity(data: dict):
    new_id = max(a["id"] for a in _activities) + 1 if _activities else 1
    activity = {"id": new_id, **data, "created_at": datetime.now(timezone.utc).isoformat()}
    _activities.append(activity)
    return activity


@router.delete("/activities/{activity_id}")
async def delete_activity(activity_id: int):
    global _activities
    before = len(_activities)
    _activities = [a for a in _activities if a["id"] != activity_id]
    if len(_activities) == before:
        raise HTTPException(status_code=404, detail="Activity not found")
    return {"detail": "Activity deleted"}


# ============ PIPELINE STATS ============
@router.get("/pipeline/stats")
async def get_pipeline_stats():
    stages = {"new": 0, "negotiation": 0, "proposal": 0, "contract": 0, "won": 0, "lost": 0}
    stage_amounts = {"new": 0, "negotiation": 0, "proposal": 0, "contract": 0, "won": 0, "lost": 0}
    for d in _deals:
        stage = d["stage"]
        stages[stage] = stages.get(stage, 0) + 1
        stage_amounts[stage] = stage_amounts.get(stage, 0) + d["amount"]

    return {
        "stages": stages,
        "stage_amounts": stage_amounts,
        "total_deals": len(_deals),
        "total_amount": sum(d["amount"] for d in _deals),
        "won_amount": stage_amounts["won"],
        "conversion_rate": round(stages["won"] / max(len(_deals), 1) * 100, 1),
    }
