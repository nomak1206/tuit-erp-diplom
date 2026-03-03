from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.core.security import get_current_user
from app.core.permissions import require_role
from app.models.user import UserRole
from app.models.accounting import Account, JournalEntry, JournalLine, Invoice, Payment
from app.schemas.schemas import AccountBase, AccountResponse, JournalEntryCreate, InvoiceBase, InvoiceResponse, AccountUpdate, InvoiceUpdate

router = APIRouter(prefix="/api/accounting", tags=["Accounting"], dependencies=[Depends(get_current_user)])


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
        "nds_rate": i.nds_rate, "nds_amount": i.nds_amount,
        "currency": i.currency.value if i.currency else "UZS",
        "supplier_inn": i.supplier_inn, "buyer_inn": i.buyer_inn,
        "contract_number": i.contract_number,
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
    account_type = data.get_account_type()
    account = Account(code=data.code, name=data.name, type=account_type, parent_id=data.parent_id, description=data.description, is_active=True, balance=0)
    db.add(account)
    await db.commit()
    await db.refresh(account)
    return _acc_dict(account)


@router.patch("/accounts/{account_id}")
async def update_account(account_id: int, data: AccountUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Account).where(Account.id == account_id))
    a = result.scalars().first()
    if not a:
        raise HTTPException(status_code=404, detail="Account not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
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
    try:
        entry_date = datetime.strptime(data.get("date", datetime.now().strftime("%Y-%m-%d")), "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    entry = JournalEntry(
        date=entry_date,
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
    subtotal = data.subtotal or 0
    nds_rate = getattr(data, 'nds_rate', 12.0) or 12.0
    nds_amount = round(subtotal * nds_rate / 100, 2)
    total = data.total or (subtotal + nds_amount)
    invoice = Invoice(
        number=data.number, contact_name=data.contact_name, contact_id=data.contact_id,
        date=datetime.strptime(data.date, "%Y-%m-%d").date(),
        due_date=datetime.strptime(data.due_date, "%Y-%m-%d").date(),
        status=data.status, subtotal=subtotal,
        nds_rate=nds_rate, nds_amount=nds_amount,
        tax=data.tax or nds_amount, total=total,
        currency=getattr(data, 'currency', 'UZS') or 'UZS',
        supplier_inn=getattr(data, 'supplier_inn', None),
        buyer_inn=getattr(data, 'buyer_inn', None),
        contract_number=getattr(data, 'contract_number', None),
        notes=data.notes,
    )
    db.add(invoice)
    await db.commit()
    await db.refresh(invoice)
    return _inv_dict(invoice)


@router.patch("/invoices/{invoice_id}")
async def update_invoice(invoice_id: int, data: InvoiceUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    inv = result.scalars().first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        if k in ["date", "due_date"] and v:
            try:
                setattr(inv, k, datetime.strptime(str(v), "%Y-%m-%d").date())
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid date format for {k}")
        else:
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
    from app.models.accounting import InvoiceStatus

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

    # AUTO-CREATE JOURNAL ENTRY (Double-Entry Bookkeeping)
    # Credit: 4010 (Accounts Receivable)
    # Debit: 5010 (Cash) or 5110 (Bank) based on method
    debit_code = "5010" if payment.method and payment.method.value == "cash" else "5110"
    
    ar_acc = (await db.execute(select(Account).where(Account.code == "4010"))).scalars().first()
    cash_acc = (await db.execute(select(Account).where(Account.code == debit_code))).scalars().first()

    if ar_acc and cash_acc:
        inv_ref = f"Оплата по счёту #{payment.invoice_id}" if payment.invoice_id else "Поступление средств"
        je = JournalEntry(
            date=payment.date,
            description=payment.description or inv_ref,
            reference=payment.reference or f"PAY-{payment.id}",
            is_posted=True
        )
        db.add(je)
        await db.flush()  # to get je.id

        db.add(JournalLine(entry_id=je.id, account_id=cash_acc.id, debit=payment.amount, credit=0.0, description="Поступление средств"))
        db.add(JournalLine(entry_id=je.id, account_id=ar_acc.id, debit=0.0, credit=payment.amount, description="Погашение задолженности покупателя"))
        
        # Update Invoice Status if paid in full
        if payment.invoice_id:
            inv = (await db.execute(select(Invoice).where(Invoice.id == payment.invoice_id))).scalars().first()
            if inv:
                pmts = await db.execute(select(func.sum(Payment.amount)).where(Payment.invoice_id == inv.id))
                pmt_sum = pmts.scalar() or 0.0
                if pmt_sum >= inv.total:
                    inv.status = InvoiceStatus.PAID

        await db.commit()

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


# ============ REPORTS ============

@router.get("/reports/osv")
async def get_osv_report(
    start_date: str = None, end_date: str = None,
    db: AsyncSession = Depends(get_db)
):
    """Оборотно-сальдовая ведомость (ОСВ / Trial Balance) with optional date filters."""
    accounts = (await db.execute(select(Account))).scalars().all()
    entries_query = select(JournalEntry)
    if start_date:
        entries_query = entries_query.where(JournalEntry.date >= start_date)
    if end_date:
        entries_query = entries_query.where(JournalEntry.date <= end_date)
    entries = (await db.execute(entries_query.options())).scalars().all()
    entry_ids = [e.id for e in entries]

    # Get all journal lines for these entries
    lines = []
    if entry_ids:
        lines_result = await db.execute(select(JournalLine).where(JournalLine.entry_id.in_(entry_ids)))
        lines = lines_result.scalars().all()

    # Build debit/credit totals per account
    debit_totals = {}
    credit_totals = {}
    for line in lines:
        debit_totals[line.account_id] = debit_totals.get(line.account_id, 0) + (line.debit or 0)
        credit_totals[line.account_id] = credit_totals.get(line.account_id, 0) + (line.credit or 0)

    rows = []
    total_debit = 0
    total_credit = 0
    total_balance = 0
    for a in sorted(accounts, key=lambda x: x.code):
        debit = debit_totals.get(a.id, 0)
        credit = credit_totals.get(a.id, 0)
        balance = a.balance or 0
        rows.append({
            "code": a.code, "name": a.name,
            "opening_balance": balance,
            "debit_turnover": debit, "credit_turnover": credit,
            "closing_balance": balance + debit - credit,
            "type": a.type.value if a.type else "asset",
        })
        total_debit += debit
        total_credit += credit
        total_balance += balance

    return {
        "rows": rows,
        "totals": {"debit": total_debit, "credit": total_credit, "balance": total_balance},
        "period": {"start": start_date, "end": end_date},
        "count": len(rows),
    }


@router.get("/reports/receivables")
async def get_receivables_report(db: AsyncSession = Depends(get_db)):
    """Дебиторская / кредиторская задолженность."""
    invoices = (await db.execute(select(Invoice))).scalars().all()
    debtors = []
    creditors = []
    for inv in invoices:
        amount = inv.total or 0
        status = inv.status.value if inv.status else "draft"
        entry = {
            "number": inv.number, "client": inv.contact_name,
            "amount": amount, "status": status,
            "date": str(inv.date) if inv.date else None,
            "due_date": str(inv.due_date) if inv.due_date else None,
            "overdue": inv.due_date and inv.due_date < datetime.now(timezone.utc).date() and status != "paid",
        }
        if status in ("sent", "overdue", "draft"):
            debtors.append(entry)

    return {
        "debtors": debtors,
        "creditors": creditors,
        "total_receivable": sum(d["amount"] for d in debtors),
        "total_payable": sum(c["amount"] for c in creditors),
        "overdue_count": sum(1 for d in debtors if d.get("overdue")),
    }


@router.get("/reports/monthly-revenue")
async def get_monthly_revenue(db: AsyncSession = Depends(get_db)):
    """Помесячная выручка для графиков."""
    invoices = (await db.execute(select(Invoice))).scalars().all()
    monthly = {}
    for inv in invoices:
        if inv.date and inv.status and inv.status.value == "paid":
            month_key = inv.date.strftime("%Y-%m")
            monthly[month_key] = monthly.get(month_key, 0) + (inv.total or 0)
    return {
        "months": [{"month": k, "revenue": v} for k, v in sorted(monthly.items())],
    }
