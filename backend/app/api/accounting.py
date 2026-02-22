from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.accounting import Account, JournalEntry, JournalLine, Invoice, Payment
from app.schemas.schemas import AccountBase, AccountResponse, JournalEntryCreate, InvoiceBase, InvoiceResponse

router = APIRouter(prefix="/api/accounting", tags=["Accounting"])


def _acc_dict(a: Account) -> dict:
    return {
        "id": a.id, "code": a.code, "name": a.name,
        "account_type": a.type.value if a.type else "asset",
        "parent_id": a.parent_id, "description": a.description,
        "is_active": a.is_active, "balance": a.balance,
    }


def _inv_dict(i: Invoice) -> dict:
    return {
        "id": i.id, "number": i.number, "client_name": i.contact_name,
        "contact_id": i.contact_id,
        "issue_date": str(i.date) if i.date else None,
        "due_date": str(i.due_date) if i.due_date else None,
        "status": i.status.value if i.status else "draft",
        "subtotal": i.subtotal, "tax_amount": i.tax, "total_amount": i.total,
        "notes": i.notes,
        "created_at": i.created_at.isoformat() if i.created_at else None,
    }


# ============ ACCOUNTS ============
@router.get("/accounts")
async def get_accounts(db: AsyncSession = Depends(get_db), skip: int = 0, limit: int = 200):
    result = await db.execute(select(Account).offset(skip).limit(limit))
    return [_acc_dict(a) for a in result.scalars().all()]


@router.post("/accounts", status_code=201)
async def create_account(data: AccountBase, db: AsyncSession = Depends(get_db)):
    account = Account(code=data.code, name=data.name, type=data.type, parent_id=data.parent_id, description=data.description, is_active=True, balance=0)
    db.add(account)
    await db.commit()
    await db.refresh(account)
    return _acc_dict(account)


@router.patch("/accounts/{account_id}")
async def update_account(account_id: int, data: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Account).where(Account.id == account_id))
    a = result.scalars().first()
    if not a:
        raise HTTPException(status_code=404, detail="Account not found")
    allowed = {"code", "name", "type", "parent_id", "description", "is_active", "balance"}
    for k, v in data.items():
        if k in allowed:
            setattr(a, k, v)
    await db.commit()
    await db.refresh(a)
    return _acc_dict(a)


@router.delete("/accounts/{account_id}")
async def delete_account(account_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Account).where(Account.id == account_id))
    a = result.scalars().first()
    if not a:
        raise HTTPException(status_code=404, detail="Account not found")
    await db.delete(a)
    await db.commit()
    return {"detail": "Account deleted"}


# ============ JOURNAL ENTRIES ============
@router.get("/journal")
async def get_journal_entries(db: AsyncSession = Depends(get_db), skip: int = 0, limit: int = 100):
    result = await db.execute(select(JournalEntry).offset(skip).limit(limit))
    entries = result.scalars().all()
    return [{"id": e.id, "date": str(e.date) if e.date else None, "description": e.description, "reference": e.reference, "is_posted": e.is_posted, "created_at": e.created_at.isoformat() if e.created_at else None} for e in entries]


@router.post("/journal", status_code=201)
async def create_journal_entry(data: dict, db: AsyncSession = Depends(get_db)):
    entry = JournalEntry(
        date=datetime.strptime(data.get("date", datetime.now().strftime("%Y-%m-%d")), "%Y-%m-%d").date(),
        description=data.get("description", ""),
        reference=data.get("reference"),
        is_posted=False,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return {"id": entry.id, "date": str(entry.date), "description": entry.description, "reference": entry.reference, "is_posted": entry.is_posted, "created_at": entry.created_at.isoformat() if entry.created_at else None}


@router.delete("/journal/{entry_id}")
async def delete_journal_entry(entry_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(JournalEntry).where(JournalEntry.id == entry_id))
    e = result.scalars().first()
    if not e:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    await db.delete(e)
    await db.commit()
    return {"detail": "Journal entry deleted"}


# ============ INVOICES ============
@router.get("/invoices")
async def get_invoices(db: AsyncSession = Depends(get_db), skip: int = 0, limit: int = 100):
    result = await db.execute(select(Invoice).offset(skip).limit(limit))
    return [_inv_dict(i) for i in result.scalars().all()]


@router.post("/invoices", status_code=201)
async def create_invoice(data: InvoiceBase, db: AsyncSession = Depends(get_db)):
    invoice = Invoice(
        number=data.number, contact_name=data.contact_name, contact_id=data.contact_id,
        date=datetime.strptime(data.date, "%Y-%m-%d").date(),
        due_date=datetime.strptime(data.due_date, "%Y-%m-%d").date(),
        status=data.status, subtotal=data.subtotal, tax=data.tax, total=data.total,
        notes=data.notes,
    )
    db.add(invoice)
    await db.commit()
    await db.refresh(invoice)
    return _inv_dict(invoice)


@router.patch("/invoices/{invoice_id}")
async def update_invoice(invoice_id: int, data: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    inv = result.scalars().first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    allowed = {"number", "contact_name", "contact_id", "date", "due_date", "status", "subtotal", "tax", "total", "notes"}
    for k, v in data.items():
        if k in allowed:
            setattr(inv, k, v)
    await db.commit()
    await db.refresh(inv)
    return _inv_dict(inv)


@router.delete("/invoices/{invoice_id}")
async def delete_invoice(invoice_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    inv = result.scalars().first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    await db.delete(inv)
    await db.commit()
    return {"detail": "Invoice deleted"}


# ============ PAYMENTS ============
@router.get("/payments")
async def get_payments(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Payment))
    return [{"id": p.id, "invoice_id": p.invoice_id, "amount": p.amount, "method": p.method.value if p.method else "bank_transfer", "reference": p.reference, "date": str(p.date) if p.date else None, "description": p.description, "created_at": p.created_at.isoformat() if p.created_at else None} for p in result.scalars().all()]


@router.post("/payments", status_code=201)
async def create_payment(data: dict, db: AsyncSession = Depends(get_db)):
    payment = Payment(
        invoice_id=data.get("invoice_id"),
        amount=data.get("amount", 0),
        method=data.get("method", "bank_transfer"),
        reference=data.get("reference"),
        date=datetime.strptime(data.get("date", datetime.now().strftime("%Y-%m-%d")), "%Y-%m-%d").date(),
        description=data.get("description"),
    )
    db.add(payment)
    await db.commit()
    await db.refresh(payment)
    return {"id": payment.id, "invoice_id": payment.invoice_id, "amount": payment.amount, "method": payment.method.value if payment.method else "bank_transfer", "date": str(payment.date), "created_at": payment.created_at.isoformat() if payment.created_at else None}


# ============ REPORTS ============
@router.get("/reports/summary")
async def get_accounting_summary(db: AsyncSession = Depends(get_db)):
    accounts = (await db.execute(select(Account))).scalars().all()
    invoices = (await db.execute(select(Invoice))).scalars().all()

    total_assets = sum(a.balance for a in accounts if a.type and a.type.value == "asset")
    total_liabilities = sum(a.balance for a in accounts if a.type and a.type.value == "liability")
    total_revenue = sum(a.balance for a in accounts if a.type and a.type.value == "revenue")
    total_expenses = sum(a.balance for a in accounts if a.type and a.type.value == "expense")
    total_equity = sum(a.balance for a in accounts if a.type and a.type.value == "equity")

    return {
        "total_assets": total_assets,
        "total_liabilities": total_liabilities,
        "total_revenue": total_revenue,
        "total_expenses": total_expenses,
        "total_equity": total_equity,
        "net_profit": total_revenue - total_expenses,
        "invoices_total": sum(i.total for i in invoices),
        "invoices_paid": sum(i.total for i in invoices if i.status and i.status.value == "paid"),
        "invoices_overdue": sum(1 for i in invoices if i.status and i.status.value == "overdue"),
    }


# ============ TRIAL BALANCE ============
@router.get("/trial-balance")
async def get_trial_balance(db: AsyncSession = Depends(get_db)):
    accounts = (await db.execute(select(Account))).scalars().all()
    entries = (await db.execute(select(JournalEntry).where(JournalEntry.is_posted == True))).scalars().all()
    entry_ids = [e.id for e in entries]

    lines = []
    if entry_ids:
        lines_result = await db.execute(select(JournalLine).where(JournalLine.entry_id.in_(entry_ids)))
        lines = lines_result.scalars().all()

    rows = []
    for a in accounts:
        if a.parent_id is None and a.balance == 0:
            continue
        debit_turnover = sum(l.debit for l in lines if l.account_id == a.id)
        credit_turnover = sum(l.credit for l in lines if l.account_id == a.id)
        opening = a.balance
        closing = opening + debit_turnover - credit_turnover
        rows.append({
            "code": a.code, "name": a.name,
            "account_type": a.type.value if a.type else "asset",
            "opening_balance": opening, "debit_turnover": debit_turnover,
            "credit_turnover": credit_turnover, "closing_balance": closing,
        })

    total_debit = sum(r["debit_turnover"] for r in rows)
    total_credit = sum(r["credit_turnover"] for r in rows)
    return {"rows": rows, "total_debit": total_debit, "total_credit": total_credit, "is_balanced": total_debit == total_credit}


# ============ MONTH CLOSE ============
@router.post("/close-month")
async def close_month(data: dict, db: AsyncSession = Depends(get_db)):
    period = data.get("period", datetime.now().strftime("%Y-%m"))

    # Depreciation
    accounts = (await db.execute(select(Account))).scalars().all()
    deprec_total = 0
    for a in accounts:
        if a.type and a.type.value == "asset" and a.balance > 0 and a.parent_id:
            deprec_total += round(a.balance * 0.02)

    entries_created = 0
    if deprec_total > 0:
        entry = JournalEntry(date=datetime.strptime(f"{period}-28", "%Y-%m-%d").date(), description=f"Амортизация ОС за {period}", reference=f"АМ-{period}", is_posted=True)
        db.add(entry)
        entries_created += 1

    # Salary accrual
    salary_entry = JournalEntry(date=datetime.strptime(f"{period}-28", "%Y-%m-%d").date(), description=f"Начисление ЗП за {period}", reference=f"ЗП-{period}", is_posted=True)
    db.add(salary_entry)
    entries_created += 1

    # Tax accrual
    tax_entry = JournalEntry(date=datetime.strptime(f"{period}-28", "%Y-%m-%d").date(), description=f"Удержание НДФЛ+ИНПС за {period}", reference=f"НАЛ-{period}", is_posted=True)
    db.add(tax_entry)
    entries_created += 1

    await db.commit()
    return {"status": "closed", "period": period, "entries_created": entries_created, "depreciation": deprec_total}


@router.get("/closed-months")
async def get_closed_months(db: AsyncSession = Depends(get_db)):
    # Find months with "close" journal entries
    result = await db.execute(select(JournalEntry).where(JournalEntry.reference.like("ЗП-%")))
    entries = result.scalars().all()
    return [{"period": e.reference.replace("ЗП-", ""), "closed_at": e.created_at.isoformat() if e.created_at else None} for e in entries]
