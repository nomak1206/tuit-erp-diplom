from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone

router = APIRouter(prefix="/api/accounting", tags=["Accounting"])

# ============ DEMO DATA ============
_accounts = [
    # === 01 Основные средства (Актив) ===
    {"id": 1, "code": "0100", "name": "Основные средства (счёт-группа)", "account_type": "asset", "group_code": "01", "group_name": "Основные средства", "parent_id": None, "description": "", "is_active": True, "balance": 0},
    {"id": 2, "code": "0110", "name": "Земельные участки", "account_type": "asset", "group_code": "01", "group_name": "Основные средства", "parent_id": 1, "description": "", "is_active": True, "balance": 80000000},
    {"id": 3, "code": "0120", "name": "Здания", "account_type": "asset", "group_code": "01", "group_name": "Основные средства", "parent_id": 1, "description": "Административное здание", "is_active": True, "balance": 350000000},
    {"id": 4, "code": "0130", "name": "Сооружения", "account_type": "asset", "group_code": "01", "group_name": "Основные средства", "parent_id": 1, "description": "", "is_active": True, "balance": 45000000},
    {"id": 5, "code": "0140", "name": "Машины и оборудование", "account_type": "asset", "group_code": "01", "group_name": "Основные средства", "parent_id": 1, "description": "Серверы, станки", "is_active": True, "balance": 120000000},
    {"id": 6, "code": "0150", "name": "Транспортные средства", "account_type": "asset", "group_code": "01", "group_name": "Основные средства", "parent_id": 1, "description": "Автопарк", "is_active": True, "balance": 95000000},
    {"id": 7, "code": "0160", "name": "Офисная мебель и оборудование", "account_type": "asset", "group_code": "01", "group_name": "Основные средства", "parent_id": 1, "description": "", "is_active": True, "balance": 28000000},
    {"id": 8, "code": "0170", "name": "Компьютерная техника", "account_type": "asset", "group_code": "01", "group_name": "Основные средства", "parent_id": 1, "description": "Ноутбуки, мониторы, принтеры", "is_active": True, "balance": 42000000},
    # === 02 Износ основных средств (Контрактив) ===
    {"id": 9, "code": "0200", "name": "Износ основных средств (счёт-группа)", "account_type": "contra_asset", "group_code": "02", "group_name": "Износ ОС", "parent_id": None, "description": "", "is_active": True, "balance": 0},
    {"id": 10, "code": "0220", "name": "Износ зданий", "account_type": "contra_asset", "group_code": "02", "group_name": "Износ ОС", "parent_id": 9, "description": "", "is_active": True, "balance": 52500000},
    {"id": 11, "code": "0240", "name": "Износ машин и оборудования", "account_type": "contra_asset", "group_code": "02", "group_name": "Износ ОС", "parent_id": 9, "description": "", "is_active": True, "balance": 36000000},
    {"id": 12, "code": "0250", "name": "Износ транспортных средств", "account_type": "contra_asset", "group_code": "02", "group_name": "Износ ОС", "parent_id": 9, "description": "", "is_active": True, "balance": 23750000},
    {"id": 13, "code": "0270", "name": "Износ компьютерной техники", "account_type": "contra_asset", "group_code": "02", "group_name": "Износ ОС", "parent_id": 9, "description": "", "is_active": True, "balance": 14000000},
    # === 04 Нематериальные активы ===
    {"id": 14, "code": "0400", "name": "НМА (счёт-группа)", "account_type": "asset", "group_code": "04", "group_name": "Нематериальные активы", "parent_id": None, "description": "", "is_active": True, "balance": 0},
    {"id": 15, "code": "0410", "name": "Лицензии и программное обеспечение", "account_type": "asset", "group_code": "04", "group_name": "Нематериальные активы", "parent_id": 14, "description": "1С, антивирус, ERP", "is_active": True, "balance": 18000000},
    {"id": 16, "code": "0420", "name": "Патенты и товарные знаки", "account_type": "asset", "group_code": "04", "group_name": "Нематериальные активы", "parent_id": 14, "description": "", "is_active": True, "balance": 5000000},
    # === 10 Товарно-материальные запасы ===
    {"id": 17, "code": "1000", "name": "ТМЗ (счёт-группа)", "account_type": "asset", "group_code": "10", "group_name": "Товарно-материальные запасы", "parent_id": None, "description": "", "is_active": True, "balance": 0},
    {"id": 18, "code": "1010", "name": "Сырьё и материалы", "account_type": "asset", "group_code": "10", "group_name": "Товарно-материальные запасы", "parent_id": 17, "description": "", "is_active": True, "balance": 22000000},
    {"id": 19, "code": "1030", "name": "Топливо", "account_type": "asset", "group_code": "10", "group_name": "Товарно-материальные запасы", "parent_id": 17, "description": "ГСМ для автопарка", "is_active": True, "balance": 4500000},
    {"id": 20, "code": "1040", "name": "Запасные части", "account_type": "asset", "group_code": "10", "group_name": "Товарно-материальные запасы", "parent_id": 17, "description": "", "is_active": True, "balance": 6800000},
    {"id": 21, "code": "1060", "name": "Канцелярские товары", "account_type": "asset", "group_code": "10", "group_name": "Товарно-материальные запасы", "parent_id": 17, "description": "", "is_active": True, "balance": 1200000},
    # === 28 Готовая продукция и товары ===
    {"id": 22, "code": "2800", "name": "Готовая продукция (счёт-группа)", "account_type": "asset", "group_code": "28", "group_name": "Готовая продукция", "parent_id": None, "description": "", "is_active": True, "balance": 0},
    {"id": 23, "code": "2810", "name": "Готовая продукция на складе", "account_type": "asset", "group_code": "28", "group_name": "Готовая продукция", "parent_id": 22, "description": "", "is_active": True, "balance": 35000000},
    {"id": 24, "code": "2900", "name": "Товары", "account_type": "asset", "group_code": "28", "group_name": "Готовая продукция", "parent_id": 22, "description": "Товары для перепродажи", "is_active": True, "balance": 18500000},
    # === 31 Расходы будущих периодов ===
    {"id": 25, "code": "3100", "name": "Расходы будущих периодов", "account_type": "asset", "group_code": "31", "group_name": "Расходы будущих периодов", "parent_id": None, "description": "Аренда авансом, подписки", "is_active": True, "balance": 8400000},
    # === 40 Счета к получению ===
    {"id": 26, "code": "4000", "name": "Счета к получению (счёт-группа)", "account_type": "asset", "group_code": "40", "group_name": "Дебиторская задолженность", "parent_id": None, "description": "", "is_active": True, "balance": 0},
    {"id": 27, "code": "4010", "name": "Расчёты с покупателями", "account_type": "asset", "group_code": "40", "group_name": "Дебиторская задолженность", "parent_id": 26, "description": "", "is_active": True, "balance": 48000000},
    {"id": 28, "code": "4020", "name": "Авансы выданные поставщикам", "account_type": "asset", "group_code": "40", "group_name": "Дебиторская задолженность", "parent_id": 26, "description": "", "is_active": True, "balance": 12000000},
    {"id": 29, "code": "4030", "name": "Прочая дебиторская задолженность", "account_type": "asset", "group_code": "40", "group_name": "Дебиторская задолженность", "parent_id": 26, "description": "", "is_active": True, "balance": 3500000},
    # === 50 Денежные средства ===
    {"id": 30, "code": "5000", "name": "Денежные средства (счёт-группа)", "account_type": "asset", "group_code": "50", "group_name": "Денежные средства", "parent_id": None, "description": "", "is_active": True, "balance": 0},
    {"id": 31, "code": "5010", "name": "Расчётный счёт (UZS)", "account_type": "asset", "group_code": "50", "group_name": "Денежные средства", "parent_id": 30, "description": "Основной банк — Капиталбанк", "is_active": True, "balance": 185000000},
    {"id": 32, "code": "5020", "name": "Валютный счёт (USD)", "account_type": "asset", "group_code": "50", "group_name": "Денежные средства", "parent_id": 30, "description": "", "is_active": True, "balance": 25000000},
    {"id": 33, "code": "5030", "name": "Депозитные счета", "account_type": "asset", "group_code": "50", "group_name": "Денежные средства", "parent_id": 30, "description": "Срочный депозит 6 мес", "is_active": True, "balance": 50000000},
    {"id": 34, "code": "5100", "name": "Касса (UZS)", "account_type": "asset", "group_code": "50", "group_name": "Денежные средства", "parent_id": 30, "description": "", "is_active": True, "balance": 3200000},
    # === 60 Счета к оплате ===
    {"id": 35, "code": "6000", "name": "Счета к оплате (счёт-группа)", "account_type": "liability", "group_code": "60", "group_name": "Кредиторская задолженность", "parent_id": None, "description": "", "is_active": True, "balance": 0},
    {"id": 36, "code": "6010", "name": "Расчёты с поставщиками", "account_type": "liability", "group_code": "60", "group_name": "Кредиторская задолженность", "parent_id": 35, "description": "", "is_active": True, "balance": 32000000},
    {"id": 37, "code": "6020", "name": "Авансы полученные от покупателей", "account_type": "liability", "group_code": "60", "group_name": "Кредиторская задолженность", "parent_id": 35, "description": "", "is_active": True, "balance": 15000000},
    # === 64 Расчёты по налогам ===
    {"id": 38, "code": "6400", "name": "Расчёты по налогам (счёт-группа)", "account_type": "liability", "group_code": "64", "group_name": "Расчёты по налогам", "parent_id": None, "description": "", "is_active": True, "balance": 0},
    {"id": 39, "code": "6410", "name": "НДФЛ (12%)", "account_type": "liability", "group_code": "64", "group_name": "Расчёты по налогам", "parent_id": 38, "description": "Налог на доходы физических лиц", "is_active": True, "balance": 8520000},
    {"id": 40, "code": "6420", "name": "НДС", "account_type": "liability", "group_code": "64", "group_name": "Расчёты по налогам", "parent_id": 38, "description": "Налог на добавленную стоимость 12%", "is_active": True, "balance": 11400000},
    {"id": 41, "code": "6430", "name": "Налог на прибыль", "account_type": "liability", "group_code": "64", "group_name": "Расчёты по налогам", "parent_id": 38, "description": "15%", "is_active": True, "balance": 14250000},
    {"id": 42, "code": "6440", "name": "ИНПС (1%)", "account_type": "liability", "group_code": "64", "group_name": "Расчёты по налогам", "parent_id": 38, "description": "Индивидуальный накопительный пенсионный счёт", "is_active": True, "balance": 710000},
    {"id": 43, "code": "6450", "name": "ЕСН (12%)", "account_type": "liability", "group_code": "64", "group_name": "Расчёты по налогам", "parent_id": 38, "description": "Единый социальный налог от работодателя", "is_active": True, "balance": 8520000},
    # === 67 Расчёты с персоналом ===
    {"id": 44, "code": "6700", "name": "Расчёты с персоналом (счёт-группа)", "account_type": "liability", "group_code": "67", "group_name": "Расчёты с персоналом", "parent_id": None, "description": "", "is_active": True, "balance": 0},
    {"id": 45, "code": "6710", "name": "Зарплата к выплате", "account_type": "liability", "group_code": "67", "group_name": "Расчёты с персоналом", "parent_id": 44, "description": "", "is_active": True, "balance": 71000000},
    {"id": 46, "code": "6720", "name": "Депонированная заработная плата", "account_type": "liability", "group_code": "67", "group_name": "Расчёты с персоналом", "parent_id": 44, "description": "", "is_active": True, "balance": 0},
    {"id": 47, "code": "6730", "name": "Подотчётные суммы", "account_type": "asset", "group_code": "67", "group_name": "Расчёты с персоналом", "parent_id": 44, "description": "", "is_active": True, "balance": 2500000},
    # === 83 Уставный капитал ===
    {"id": 48, "code": "8300", "name": "Уставный капитал", "account_type": "equity", "group_code": "83", "group_name": "Собственный капитал", "parent_id": None, "description": "", "is_active": True, "balance": 500000000},
    {"id": 49, "code": "8400", "name": "Резервный капитал", "account_type": "equity", "group_code": "83", "group_name": "Собственный капитал", "parent_id": None, "description": "5% от чистой прибыли", "is_active": True, "balance": 25000000},
    # === 87 Нераспределённая прибыль ===
    {"id": 50, "code": "8700", "name": "Нераспределённая прибыль", "account_type": "equity", "group_code": "87", "group_name": "Нераспределённая прибыль", "parent_id": None, "description": "", "is_active": True, "balance": 78000000},
    # === 90 Доходы от основной деятельности ===
    {"id": 51, "code": "9010", "name": "Выручка от реализации продукции", "account_type": "revenue", "group_code": "90", "group_name": "Доходы от основной деятельности", "parent_id": None, "description": "", "is_active": True, "balance": 245000000},
    {"id": 52, "code": "9020", "name": "Выручка от оказания услуг", "account_type": "revenue", "group_code": "90", "group_name": "Доходы от основной деятельности", "parent_id": None, "description": "IT-услуги, консалтинг", "is_active": True, "balance": 180000000},
    {"id": 53, "code": "9100", "name": "Прочие операционные доходы", "account_type": "revenue", "group_code": "91", "group_name": "Прочие доходы", "parent_id": None, "description": "Аренда, курсовые разницы", "is_active": True, "balance": 12000000},
    # === 94 Расходы ===
    {"id": 54, "code": "9010s", "name": "Себестоимость реализованной продукции", "account_type": "expense", "group_code": "90", "group_name": "Себестоимость", "parent_id": None, "description": "", "is_active": True, "balance": 125000000},
    {"id": 55, "code": "9400", "name": "Расходы периода (счёт-группа)", "account_type": "expense", "group_code": "94", "group_name": "Расходы периода", "parent_id": None, "description": "", "is_active": True, "balance": 0},
    {"id": 56, "code": "9410", "name": "Расходы на оплату труда", "account_type": "expense", "group_code": "94", "group_name": "Расходы периода", "parent_id": 55, "description": "ФОТ + ЕСН", "is_active": True, "balance": 85000000},
    {"id": 57, "code": "9420", "name": "Аренда помещений", "account_type": "expense", "group_code": "94", "group_name": "Расходы периода", "parent_id": 55, "description": "", "is_active": True, "balance": 24000000},
    {"id": 58, "code": "9430", "name": "Коммунальные услуги", "account_type": "expense", "group_code": "94", "group_name": "Расходы периода", "parent_id": 55, "description": "Электричество, газ, вода, интернет", "is_active": True, "balance": 9600000},
    {"id": 59, "code": "9440", "name": "Амортизация", "account_type": "expense", "group_code": "94", "group_name": "Расходы периода", "parent_id": 55, "description": "", "is_active": True, "balance": 15200000},
    {"id": 60, "code": "9450", "name": "Расходы на рекламу и маркетинг", "account_type": "expense", "group_code": "94", "group_name": "Расходы периода", "parent_id": 55, "description": "", "is_active": True, "balance": 8000000},
    {"id": 61, "code": "9460", "name": "Командировочные расходы", "account_type": "expense", "group_code": "94", "group_name": "Расходы периода", "parent_id": 55, "description": "", "is_active": True, "balance": 3200000},
    {"id": 62, "code": "9470", "name": "Расходы на связь", "account_type": "expense", "group_code": "94", "group_name": "Расходы периода", "parent_id": 55, "description": "Мобильная связь, интернет", "is_active": True, "balance": 2400000},
    # === 99 Финансовый результат ===
    {"id": 63, "code": "9900", "name": "Конечный финансовый результат", "account_type": "equity", "group_code": "99", "group_name": "Финансовый результат", "parent_id": None, "description": "Прибыль/убыток отчётного периода", "is_active": True, "balance": 0},
]

_journal_entries = [
    {"id": 1, "date": "2026-02-01", "description": "Оплата от TechCorp за ERP", "reference": "ПП-001", "is_posted": True, "created_at": "2026-02-01T10:00:00Z"},
    {"id": 2, "date": "2026-02-03", "description": "Закупка оборудования", "reference": "ПП-002", "is_posted": True, "created_at": "2026-02-03T11:00:00Z"},
    {"id": 3, "date": "2026-02-05", "description": "Выплата зарплаты за январь", "reference": "ПП-003", "is_posted": True, "created_at": "2026-02-05T09:00:00Z"},
    {"id": 4, "date": "2026-02-07", "description": "Оплата аренды офиса", "reference": "ПП-004", "is_posted": True, "created_at": "2026-02-07T14:00:00Z"},
    {"id": 5, "date": "2026-02-10", "description": "Оплата от MediaGroup", "reference": "ПП-005", "is_posted": False, "created_at": "2026-02-10T16:00:00Z"},
]

_invoices = [
    {"id": 1, "number": "INV-2026-001", "client_name": "TechCorp UZ", "contact_id": 1, "issue_date": "2026-01-20", "due_date": "2026-02-20", "status": "paid", "subtotal": 15000000, "tax_amount": 2250000, "total_amount": 17250000, "notes": "", "created_at": "2026-01-20T10:00:00Z"},
    {"id": 2, "number": "INV-2026-002", "client_name": "MediaGroup", "contact_id": 5, "issue_date": "2026-02-09", "due_date": "2026-03-09", "status": "sent", "subtotal": 12000000, "tax_amount": 1800000, "total_amount": 13800000, "notes": "", "created_at": "2026-02-09T16:00:00Z"},
    {"id": 3, "number": "INV-2026-003", "client_name": "BuildPro", "contact_id": 2, "issue_date": "2026-02-11", "due_date": "2026-03-11", "status": "draft", "subtotal": 25000000, "tax_amount": 3750000, "total_amount": 28750000, "notes": "Ожидает подтверждения КП", "created_at": "2026-02-11T14:00:00Z"},
    {"id": 4, "number": "INV-2026-004", "client_name": "FoodMarket", "contact_id": 4, "issue_date": "2026-01-15", "due_date": "2026-02-15", "status": "overdue", "subtotal": 8000000, "tax_amount": 1200000, "total_amount": 9200000, "notes": "Просрочка 3 дня", "created_at": "2026-01-15T11:00:00Z"},
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


@router.patch("/accounts/{account_id}")
async def update_account(account_id: int, data: dict):
    for a in _accounts:
        if a["id"] == account_id:
            a.update(data)
            return a
    raise HTTPException(status_code=404, detail="Account not found")


@router.delete("/accounts/{account_id}")
async def delete_account(account_id: int):
    global _accounts
    before = len(_accounts)
    _accounts = [a for a in _accounts if a["id"] != account_id]
    if len(_accounts) == before:
        raise HTTPException(status_code=404, detail="Account not found")
    return {"detail": "Account deleted"}


@router.get("/journal")
async def get_journal_entries():
    return _journal_entries


@router.post("/journal")
async def create_journal_entry(data: dict):
    new_id = max(j["id"] for j in _journal_entries) + 1 if _journal_entries else 1
    entry = {"id": new_id, **data, "is_posted": False, "created_at": datetime.now(timezone.utc).isoformat()}
    _journal_entries.append(entry)
    return entry


@router.delete("/journal/{entry_id}")
async def delete_journal_entry(entry_id: int):
    global _journal_entries
    before = len(_journal_entries)
    _journal_entries = [j for j in _journal_entries if j["id"] != entry_id]
    if len(_journal_entries) == before:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return {"detail": "Journal entry deleted"}


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


@router.delete("/invoices/{invoice_id}")
async def delete_invoice(invoice_id: int):
    global _invoices
    before = len(_invoices)
    _invoices = [i for i in _invoices if i["id"] != invoice_id]
    if len(_invoices) == before:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"detail": "Invoice deleted"}


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
    total_assets = sum(a["balance"] for a in _accounts if a["account_type"] == "asset")
    total_liabilities = sum(a["balance"] for a in _accounts if a["account_type"] == "liability")
    total_revenue = sum(a["balance"] for a in _accounts if a["account_type"] == "revenue")
    total_expenses = sum(a["balance"] for a in _accounts if a["account_type"] == "expense")
    total_equity = sum(a["balance"] for a in _accounts if a["account_type"] == "equity")
    total_contra = sum(a["balance"] for a in _accounts if a["account_type"] == "contra_asset")

    return {
        "total_assets": total_assets - total_contra,
        "total_liabilities": total_liabilities,
        "total_revenue": total_revenue,
        "total_expenses": total_expenses,
        "total_equity": total_equity,
        "net_profit": total_revenue - total_expenses,
        "invoices_total": sum(i["total_amount"] for i in _invoices),
        "invoices_paid": sum(i["total_amount"] for i in _invoices if i["status"] == "paid"),
        "invoices_overdue": sum(1 for i in _invoices if i["status"] == "overdue"),
    }


# ============ MONTH CLOSE (1С) ============
_closed_months = []

@router.post("/close-month")
async def close_month(data: dict):
    """Auto-generate depreciation and payroll journal entries for the period."""
    period = data.get("period", datetime.now().strftime("%Y-%m"))
    # Check if already closed
    if any(c["period"] == period for c in _closed_months):
        raise HTTPException(status_code=400, detail=f"Period {period} already closed")

    entries_created = []
    new_id = max(j["id"] for j in _journal_entries) + 1 if _journal_entries else 1

    # Step 1: Depreciation — calculate 1/12 of asset value for depreciable assets
    deprec_total = 0
    for a in _accounts:
        if a["account_type"] == "asset" and a["group_code"] == "01" and a["balance"] > 0 and a["parent_id"]:
            monthly_deprec = round(a["balance"] * 0.02)  # ~2% monthly (24% annual)
            deprec_total += monthly_deprec

    if deprec_total > 0:
        entry = {"id": new_id, "date": f"{period}-28", "description": f"Амортизация ОС за {period}", "debit_account": "9410", "credit_account": "0200", "amount": deprec_total, "reference": f"АМ-{period}", "status": "posted", "created_at": datetime.now(timezone.utc).isoformat()}
        _journal_entries.append(entry)
        entries_created.append(entry)
        new_id += 1

    # Step 2: Salary accrual
    salary_entry = {"id": new_id, "date": f"{period}-28", "description": f"Начисление ЗП за {period}", "debit_account": "9420", "credit_account": "6710", "amount": 85000000, "reference": f"ЗП-{period}", "status": "posted", "created_at": datetime.now(timezone.utc).isoformat()}
    _journal_entries.append(salary_entry)
    entries_created.append(salary_entry)
    new_id += 1

    # Step 3: Tax accrual (NDFL + INPS)
    tax_entry = {"id": new_id, "date": f"{period}-28", "description": f"Удержание НДФЛ+ИНПС за {period}", "debit_account": "6710", "credit_account": "6410", "amount": round(85000000 * 0.13), "reference": f"НАЛ-{period}", "status": "posted", "created_at": datetime.now(timezone.utc).isoformat()}
    _journal_entries.append(tax_entry)
    entries_created.append(tax_entry)

    closed = {"period": period, "closed_at": datetime.now(timezone.utc).isoformat(), "entries_count": len(entries_created), "depreciation": deprec_total, "salary": 85000000}
    _closed_months.append(closed)

    return {"status": "closed", "period": period, "entries_created": len(entries_created), "details": closed}


@router.get("/closed-months")
async def get_closed_months():
    return _closed_months


@router.get("/trial-balance")
async def get_trial_balance():
    """ОСВ — Оборотно-сальдовая ведомость."""
    rows = []
    for a in _accounts:
        if a["parent_id"] is None and a["balance"] == 0:
            continue  # Skip group headers with zero balance
        debit_turnover = sum(j["amount"] for j in _journal_entries if j.get("debit_account") == a["code"] and j.get("status") == "posted")
        credit_turnover = sum(j["amount"] for j in _journal_entries if j.get("credit_account") == a["code"] and j.get("status") == "posted")
        opening = a["balance"]
        closing = opening + debit_turnover - credit_turnover
        rows.append({
            "code": a["code"], "name": a["name"], "account_type": a["account_type"],
            "group_code": a.get("group_code", ""), "group_name": a.get("group_name", ""),
            "opening_balance": opening, "debit_turnover": debit_turnover,
            "credit_turnover": credit_turnover, "closing_balance": closing,
        })
    total_debit = sum(r["debit_turnover"] for r in rows)
    total_credit = sum(r["credit_turnover"] for r in rows)
    return {"rows": rows, "total_debit": total_debit, "total_credit": total_credit, "is_balanced": total_debit == total_credit}

