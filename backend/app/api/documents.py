from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.document import Document, ApprovalStep, DocumentVersion

router = APIRouter(prefix="/api/documents", tags=["Documents"])

# Static templates (no model needed — read-only config)
_document_templates = [
    {"id": 1, "name": "Трудовой договор", "doc_type": "contract", "category": "hr", "description": "Стандартный трудовой договор по ТК РУз", "fields": ["ФИО сотрудника", "Должность", "Оклад", "Дата начала", "Испытательный срок"], "icon": "📋"},
    {"id": 2, "name": "Приказ о приёме на работу", "doc_type": "order", "category": "hr", "description": "Приказ о зачислении сотрудника в штат", "fields": ["ФИО сотрудника", "Должность", "Отдел", "Оклад", "Дата приёма"], "icon": "📝"},
    {"id": 3, "name": "Приказ об увольнении", "doc_type": "order", "category": "hr", "description": "Приказ о расторжении трудового договора", "fields": ["ФИО сотрудника", "Основание", "Дата увольнения", "Компенсация"], "icon": "📝"},
    {"id": 4, "name": "Приказ на отпуск", "doc_type": "vacation_order", "category": "hr", "description": "Приказ на ежегодный / без сохранения ЗП отпуск", "fields": ["ФИО сотрудника", "Тип отпуска", "Дата начала", "Дата окончания", "Количество дней"], "icon": "🏖️"},
    {"id": 5, "name": "Табель учёта рабочего времени", "doc_type": "timesheet", "category": "hr", "description": "Ежемесячный табель по форме Т-13", "fields": ["Отдел", "Период", "Список сотрудников"], "icon": "⏰"},
    {"id": 6, "name": "Расчётный лист", "doc_type": "payslip", "category": "accounting", "description": "Расчётный лист с НДФЛ, ИНПС, ЕСН", "fields": ["ФИО сотрудника", "Период", "Оклад", "Надбавки", "Удержания"], "icon": "💰"},
    {"id": 7, "name": "Доверенность", "doc_type": "power_of_attorney", "category": "legal", "description": "Генеральная / специальная доверенность", "fields": ["Доверитель", "Доверенное лицо", "Полномочия", "Срок действия"], "icon": "📜"},
    {"id": 8, "name": "Акт выполненных работ", "doc_type": "act", "category": "accounting", "description": "Двусторонний акт приёмки работ/услуг", "fields": ["Заказчик", "Исполнитель", "Описание работ", "Сумма", "Дата"], "icon": "✅"},
    {"id": 9, "name": "Счёт-фактура", "doc_type": "invoice", "category": "accounting", "description": "Счёт-фактура с НДС 12%", "fields": ["Покупатель", "ИНН", "Товары/услуги", "Сумма", "НДС"], "icon": "🧾"},
    {"id": 10, "name": "Служебная записка", "doc_type": "memo", "category": "internal", "description": "Внутренний документ для согласований", "fields": ["От кого", "Кому", "Тема", "Содержание"], "icon": "📨"},
]


def _doc_dict(d: Document) -> dict:
    return {
        "id": d.id, "title": d.title, "number": d.number,
        "doc_type": d.type.value if d.type else "other",
        "status": d.status.value if d.status else "draft",
        "content": d.content, "file_path": d.file_path, "file_size": d.file_size,
        "author_id": d.author_id, "author_name": d.author_name,
        "department": d.department, "tags": d.tags,
        "created_at": d.created_at.isoformat() if d.created_at else None,
    }


# ============ DOCUMENTS CRUD ============
@router.get("/")
async def get_documents(db: AsyncSession = Depends(get_db), doc_type: str = None, status: str = None, skip: int = 0, limit: int = 100):
    q = select(Document)
    if doc_type:
        q = q.where(Document.type == doc_type)
    if status:
        q = q.where(Document.status == status)
    result = await db.execute(q.offset(skip).limit(limit))
    return [_doc_dict(d) for d in result.scalars().all()]


@router.get("/templates")
async def get_document_templates():
    return _document_templates


@router.get("/stats/summary")
async def get_document_stats(db: AsyncSession = Depends(get_db)):
    docs = (await db.execute(select(Document))).scalars().all()
    approval_steps = (await db.execute(select(ApprovalStep))).scalars().all()
    status_counts = {}
    type_counts = {}
    for d in docs:
        st = d.status.value if d.status else "draft"
        tp = d.type.value if d.type else "other"
        status_counts[st] = status_counts.get(st, 0) + 1
        type_counts[tp] = type_counts.get(tp, 0) + 1
    return {
        "total": len(docs),
        "by_status": status_counts,
        "by_type": type_counts,
        "pending_approvals": sum(1 for s in approval_steps if s.action and s.action.value == "pending"),
        "templates_count": len(_document_templates),
    }


@router.get("/{doc_id}")
async def get_document(doc_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.id == doc_id))
    d = result.scalars().first()
    if not d:
        raise HTTPException(status_code=404, detail="Document not found")
    steps_result = await db.execute(select(ApprovalStep).where(ApprovalStep.document_id == doc_id))
    steps = [{"id": s.id, "document_id": s.document_id, "step_order": s.step_order, "approver_id": s.approver_id, "approver_name": s.approver_name, "action": s.action.value if s.action else "pending", "comment": s.comment, "acted_at": s.acted_at.isoformat() if s.acted_at else None} for s in steps_result.scalars().all()]
    return {**_doc_dict(d), "approval_steps": steps}


@router.post("/", status_code=201)
async def create_document(data: dict, db: AsyncSession = Depends(get_db)):
    doc = Document(
        title=data.get("title", ""),
        number=data.get("number"),
        type=data.get("doc_type", "other"),
        status="draft",
        content=data.get("content"),
        author_id=data.get("author_id"),
        author_name=data.get("author_name"),
        department=data.get("department"),
        tags=data.get("tags"),
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return _doc_dict(doc)


@router.patch("/{doc_id}")
async def update_document(doc_id: int, data: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.id == doc_id))
    d = result.scalars().first()
    if not d:
        raise HTTPException(status_code=404, detail="Document not found")
    allowed = {"title", "number", "type", "status", "content", "department", "tags"}
    for k, v in data.items():
        if k in allowed:
            setattr(d, k, v)
    await db.commit()
    await db.refresh(d)
    return _doc_dict(d)


@router.delete("/{doc_id}")
async def delete_document(doc_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.id == doc_id))
    d = result.scalars().first()
    if not d:
        raise HTTPException(status_code=404, detail="Document not found")
    await db.delete(d)
    await db.commit()
    return {"detail": "Document deleted"}
