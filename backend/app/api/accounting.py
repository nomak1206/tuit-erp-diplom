from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone

router = APIRouter(prefix="/api/accounting", tags=["Accounting"])

# ============ DEMO DATA ============
_accounts = [
    {"id": 1, "code": "0100", "name": "Основные средства", "type": "asset", "parent_id": None, "description": "Здания, оборудование", "is_active": True, "balance": 150000000},
    {"id": 2, "code": "0110", "name": "Здания и сооружения", "type": "asset", "parent_id": 1, "description": "", "is_active": True, "balance": 100000000},
    {"id": 3, "code": "0120", "name": "Оборудование", "type": "asset", "parent_id": 1, "description": "", "is_active": True, "balance": 50000000},
    {"id": 4, "code": "5000", "name": "Расчётный счёт", "type": "asset", "parent_id": None, "description": "Основной банковский счёт", "is_active": True, "balance": 85000000},
    {"id": 5, "code": "5100", "name": "Касса", "type": "asset", "parent_id": None, "description": "", "is_active": True, "balance": 5000000},
    {"id": 6, "code": "6000", "name": "Расчёты с поставщиками", "type": "liability", "parent_id": None, "description": "", "is_active": True, "balance": 12000000},
    {"id": 7, "code": "6200", "name": "Расчёты с покупателями", "type": "asset", "parent_id": None, "description": "", "is_active": True, "balance": 28000000},
    {"id": 8, "code": "7000", "name": "Доходы от реализации", "type": "revenue", "parent_id": None, "description": "", "is_active": True, "balance": 95000000},
    {"id": 9, "code": "8000", "name": "Себестоимость продукции", "type": "expense", "parent_id": None, "description": "", "is_active": True, "balance": 45000000},
    {"id": 10, "code": "8100", "name": "Административные расходы", "type": "expense", "parent_id": None, "description": "Зарплата, аренда, коммуналка", "is_active": True, "balance": 22000000},
    {"id": 11, "code": "8500", "name": "Уставный капитал", "type": "equity", "parent_id": None, "description": "", "is_active": True, "balance": 200000000},
]

_journal_entries = [
    {"id": 1, "date": "2026-02-01", "description": "Оплата от TechCorp за ERP", "reference": "ПП-001", "is_posted": True, "created_at": "2026-02-01T10:00:00Z"},
    {"id": 2, "date": "2026-02-03", "description": "Закупка оборудования", "reference": "ПП-002", "is_posted": True, "created_at": "2026-02-03T11:00:00Z"},
    {"id": 3, "date": "2026-02-05", "description": "Выплата зарплаты за январь", "reference": "ПП-003", "is_posted": True, "created_at": "2026-02-05T09:00:00Z"},
    {"id": 4, "date": "2026-02-07", "description": "Оплата аренды офиса", "reference": "ПП-004", "is_posted": True, "created_at": "2026-02-07T14:00:00Z"},
    {"id": 5, "date": "2026-02-10", "description": "Оплата от MediaGroup", "reference": "ПП-005", "is_posted": False, "created_at": "2026-02-10T16:00:00Z"},
]

_invoices = [
    {"id": 1, "number": "INV-2026-001", "contact_name": "TechCorp UZ", "contact_id": 1, "date": "2026-01-20", "due_date": "2026-02-20", "status": "paid", "subtotal": 15000000, "tax": 2250000, "total": 17250000, "notes": "", "created_at": "2026-01-20T10:00:00Z"},
    {"id": 2, "number": "INV-2026-002", "contact_name": "MediaGroup", "contact_id": 5, "date": "2026-02-09", "due_date": "2026-03-09", "status": "sent", "subtotal": 12000000, "tax": 1800000, "total": 13800000, "notes": "", "created_at": "2026-02-09T16:00:00Z"},
    {"id": 3, "number": "INV-2026-003", "contact_name": "BuildPro", "contact_id": 2, "date": "2026-02-11", "due_date": "2026-03-11", "status": "draft", "subtotal": 25000000, "tax": 3750000, "total": 28750000, "notes": "Ожидает подтверждения КП", "created_at": "2026-02-11T14:00:00Z"},
    {"id": 4, "number": "INV-2026-004", "contact_name": "FoodMarket", "contact_id": 4, "date": "2026-01-15", "due_date": "2026-02-15", "status": "overdue", "subtotal": 8000000, "tax": 1200000, "total": 9200000, "notes": "Просрочка 3 дня", "created_at": "2026-01-15T11:00:00Z"},
]

_payments = [
    {"id": 1, "invoice_id": 1, "amount": 17250000, "method": "bank_transfer", "reference": "ПП-001", "date": "2026-02-01", "description": "Оплата по счёту INV-2026-001", "created_at": "2026-02-01T10:00:00Z"},
    {"id": 2, "invoice_id": None, "amount": 5000000, "method": "cash", "reference": "ПКО-001", "date": "2026-02-03", "description": "Возврат аванса", "created_at": "2026-02-03T11:00:00Z"},
]


@router.get("/accounts")
async def get_accounts():
    return _accounts


@router.post("/accounts")
async def create_account(data: dict):
    new_id = max(a["id"] for a in _accounts) + 1 if _accounts else 1
    account = {"id": new_id, **data, "is_active": True, "balance": 0}
    _accounts.append(account)
    return account


@router.get("/journal")
async def get_journal_entries():
    return _journal_entries


@router.post("/journal")
async def create_journal_entry(data: dict):
    new_id = max(j["id"] for j in _journal_entries) + 1 if _journal_entries else 1
    entry = {"id": new_id, **data, "is_posted": False, "created_at": datetime.now(timezone.utc).isoformat()}
    _journal_entries.append(entry)
    return entry


@router.get("/invoices")
async def get_invoices():
    return _invoices


@router.post("/invoices")
async def create_invoice(data: dict):
    new_id = max(i["id"] for i in _invoices) + 1 if _invoices else 1
    invoice = {"id": new_id, **data, "created_at": datetime.now(timezone.utc).isoformat()}
    _invoices.append(invoice)
    return invoice


@router.patch("/invoices/{invoice_id}")
async def update_invoice(invoice_id: int, data: dict):
    for inv in _invoices:
        if inv["id"] == invoice_id:
            inv.update(data)
            return inv
    raise HTTPException(status_code=404, detail="Invoice not found")


@router.get("/payments")
async def get_payments():
    return _payments


@router.post("/payments")
async def create_payment(data: dict):
    new_id = max(p["id"] for p in _payments) + 1 if _payments else 1
    payment = {"id": new_id, **data, "created_at": datetime.now(timezone.utc).isoformat()}
    _payments.append(payment)
    return payment


@router.get("/reports/summary")
async def get_accounting_summary():
    total_assets = sum(a["balance"] for a in _accounts if a["type"] == "asset")
    total_liabilities = sum(a["balance"] for a in _accounts if a["type"] == "liability")
    total_revenue = sum(a["balance"] for a in _accounts if a["type"] == "revenue")
    total_expenses = sum(a["balance"] for a in _accounts if a["type"] == "expense")
    total_equity = sum(a["balance"] for a in _accounts if a["type"] == "equity")

    return {
        "total_assets": total_assets,
        "total_liabilities": total_liabilities,
        "total_revenue": total_revenue,
        "total_expenses": total_expenses,
        "total_equity": total_equity,
        "net_profit": total_revenue - total_expenses,
        "invoices_total": sum(i["total"] for i in _invoices),
        "invoices_paid": sum(i["total"] for i in _invoices if i["status"] == "paid"),
        "invoices_overdue": sum(1 for i in _invoices if i["status"] == "overdue"),
    }
