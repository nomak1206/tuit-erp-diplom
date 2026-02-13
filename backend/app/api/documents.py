from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone

router = APIRouter(prefix="/api/documents", tags=["Documents"])

# ============ DEMO DATA ============
_documents = [
    {"id": 1, "title": "Договор с TechCorp UZ", "number": "ДОГ-2026-001", "type": "contract", "status": "approved", "content": "Договор на внедрение ERP-системы...", "file_path": None, "file_size": None, "author_id": 1, "author_name": "Алексей Иванов", "department": "IT", "tags": "договор,erp,techcorp", "created_at": "2026-01-15T10:00:00Z"},
    {"id": 2, "title": "Счёт для MediaGroup", "number": "СЧ-2026-001", "type": "invoice", "status": "approved", "content": "Счёт на оплату услуг аналитики...", "file_path": None, "file_size": None, "author_id": 5, "author_name": "Татьяна Козлова", "department": "Бухгалтерия", "tags": "счёт,mediagroup", "created_at": "2026-02-09T16:00:00Z"},
    {"id": 3, "title": "Приказ о приёме на работу", "number": "ПР-2026-005", "type": "order", "status": "approved", "content": "Приказ о приёме Волковой А.Д. на должность стажёра...", "file_path": None, "file_size": None, "author_id": 7, "author_name": "Динара Юсупова", "department": "HR", "tags": "приказ,приём,кадры", "created_at": "2025-12-28T10:00:00Z"},
    {"id": 4, "title": "Акт инвентаризации склада", "number": "АКТ-2026-001", "type": "act", "status": "pending", "content": "Акт инвентаризации по основному складу за январь...", "file_path": None, "file_size": None, "author_id": 9, "author_name": "Равшан Турсунов", "department": "Склад", "tags": "акт,инвентаризация,склад", "created_at": "2026-02-01T14:00:00Z"},
    {"id": 5, "title": "Служебная записка — закупка ПО", "number": "СЗ-2026-003", "type": "memo", "status": "draft", "content": "Прошу рассмотреть закупку лицензий на...", "file_path": None, "file_size": None, "author_id": 1, "author_name": "Алексей Иванов", "department": "IT", "tags": "служебная записка,закупка", "created_at": "2026-02-10T11:00:00Z"},
    {"id": 6, "title": "Отчёт по продажам за январь", "number": "ОТЧ-2026-001", "type": "report", "status": "approved", "content": "Итоги продаж за январь 2026 года...", "file_path": None, "file_size": None, "author_id": 3, "author_name": "Бобур Ахмедов", "department": "Продажи", "tags": "отчёт,продажи", "created_at": "2026-02-03T09:00:00Z"},
    {"id": 7, "title": "Внутренний регламент ИБ", "number": "РЕГ-2026-001", "type": "other", "status": "pending", "content": "Регламент информационной безопасности...", "file_path": None, "file_size": None, "author_id": 8, "author_name": "Дмитрий Сидоров", "department": "IT", "tags": "регламент,безопасность", "created_at": "2026-02-11T09:00:00Z"},
]

_approval_steps = [
    {"id": 1, "document_id": 4, "step_order": 1, "approver_id": 9, "approver_name": "Равшан Турсунов", "action": "approved", "comment": "Проверено", "acted_at": "2026-02-02T10:00:00Z"},
    {"id": 2, "document_id": 4, "step_order": 2, "approver_id": 5, "approver_name": "Татьяна Козлова", "action": "pending", "comment": None, "acted_at": None},
    {"id": 3, "document_id": 7, "step_order": 1, "approver_id": 1, "approver_name": "Алексей Иванов", "action": "pending", "comment": None, "acted_at": None},
]


@router.get("/")
async def get_documents(doc_type: str = None, status: str = None):
    result = _documents
    if doc_type:
        result = [d for d in result if d["type"] == doc_type]
    if status:
        result = [d for d in result if d["status"] == status]
    return result


@router.get("/{doc_id}")
async def get_document(doc_id: int):
    for d in _documents:
        if d["id"] == doc_id:
            return {**d, "approval_steps": [s for s in _approval_steps if s["document_id"] == doc_id]}
    raise HTTPException(status_code=404, detail="Document not found")


@router.post("/")
async def create_document(data: dict):
    new_id = max(d["id"] for d in _documents) + 1 if _documents else 1
    doc = {"id": new_id, **data, "status": "draft", "created_at": datetime.now(timezone.utc).isoformat()}
    _documents.append(doc)
    return doc


@router.patch("/{doc_id}")
async def update_document(doc_id: int, data: dict):
    for d in _documents:
        if d["id"] == doc_id:
            d.update(data)
            return d
    raise HTTPException(status_code=404, detail="Document not found")


@router.get("/stats/summary")
async def get_document_stats():
    status_counts = {}
    type_counts = {}
    for d in _documents:
        status_counts[d["status"]] = status_counts.get(d["status"], 0) + 1
        type_counts[d["type"]] = type_counts.get(d["type"], 0) + 1
    return {
        "total": len(_documents),
        "by_status": status_counts,
        "by_type": type_counts,
        "pending_approvals": sum(1 for s in _approval_steps if s["action"] == "pending"),
    }
