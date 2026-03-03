"""
CBU Exchange Rate API + VAT Books + File Upload + Telegram/Email notifications.
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from datetime import datetime, timezone, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.core.security import get_current_user
from app.models.accounting import Invoice
import httpx
import os

router = APIRouter(prefix="/api/extra", tags=["Extra"], dependencies=[Depends(get_current_user)])


# ============ CBU EXCHANGE RATE ============
@router.get("/exchange-rates")
async def get_exchange_rates():
    """Fetch current exchange rates from Central Bank of Uzbekistan."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get("https://cbu.uz/ru/arkhiv-kursov-valyut/json/")
            resp.raise_for_status()
            rates = resp.json()
            # Return key currencies
            key_codes = {"USD", "EUR", "RUB", "GBP", "CNY", "KZT", "TRY", "KRW", "JPY"}
            filtered = [
                {
                    "code": r.get("Ccy"),
                    "name": r.get("CcyNm_RU"),
                    "rate": float(r.get("Rate", 0)),
                    "diff": float(r.get("Diff", 0)),
                    "date": r.get("Date"),
                }
                for r in rates if r.get("Ccy") in key_codes
            ]
            return {"rates": filtered, "date": rates[0].get("Date") if rates else None}
    except Exception as e:
        return {"rates": [], "error": str(e)}


# ============ VAT BOOKS (НДС) ============
@router.get("/vat/purchase-book")
async def get_purchase_book(
    start_date: str = None, end_date: str = None,
    db: AsyncSession = Depends(get_db)
):
    """Книга покупок — входящий НДС (invoices where we are the buyer)."""
    query = select(Invoice).where(Invoice.buyer_inn.isnot(None))
    if start_date:
        query = query.where(Invoice.date >= date.fromisoformat(start_date))
    if end_date:
        query = query.where(Invoice.date <= date.fromisoformat(end_date))
    result = await db.execute(query)
    invoices = result.scalars().all()
    total_nds = sum(i.nds_amount or 0 for i in invoices)
    total_amount = sum(i.total or 0 for i in invoices)
    return {
        "entries": [
            {
                "number": i.number, "date": str(i.date),
                "supplier": i.contact_name, "supplier_inn": i.supplier_inn,
                "amount": i.subtotal, "nds_rate": i.nds_rate,
                "nds_amount": i.nds_amount, "total": i.total,
            } for i in invoices
        ],
        "total_nds": total_nds,
        "total_amount": total_amount,
        "count": len(invoices),
    }


@router.get("/vat/sales-book")
async def get_sales_book(
    start_date: str = None, end_date: str = None,
    db: AsyncSession = Depends(get_db)
):
    """Книга продаж — исходящий НДС (invoices where we are the seller)."""
    query = select(Invoice).where(Invoice.supplier_inn.isnot(None))
    if start_date:
        query = query.where(Invoice.date >= date.fromisoformat(start_date))
    if end_date:
        query = query.where(Invoice.date <= date.fromisoformat(end_date))
    result = await db.execute(query)
    invoices = result.scalars().all()
    total_nds = sum(i.nds_amount or 0 for i in invoices)
    total_amount = sum(i.total or 0 for i in invoices)
    return {
        "entries": [
            {
                "number": i.number, "date": str(i.date),
                "buyer": i.contact_name, "buyer_inn": i.buyer_inn,
                "amount": i.subtotal, "nds_rate": i.nds_rate,
                "nds_amount": i.nds_amount, "total": i.total,
            } for i in invoices
        ],
        "total_nds": total_nds,
        "total_amount": total_amount,
        "count": len(invoices),
    }


@router.get("/vat/summary")
async def get_vat_summary(
    start_date: str = None, end_date: str = None,
    db: AsyncSession = Depends(get_db)
):
    """НДС к уплате = Исходящий НДС - Входящий НДС."""
    purchase = await get_purchase_book(start_date, end_date, db)
    sales = await get_sales_book(start_date, end_date, db)
    return {
        "incoming_nds": purchase["total_nds"],
        "outgoing_nds": sales["total_nds"],
        "nds_payable": sales["total_nds"] - purchase["total_nds"],
        "period_start": start_date,
        "period_end": end_date,
    }


# ============ FILE UPLOAD ============
UPLOAD_DIR = "/app/uploads"

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    entity_type: str = "document",
    entity_id: int = 0,
):
    """Upload a file and return its path."""
    os.makedirs(f"{UPLOAD_DIR}/{entity_type}", exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_name = file.filename.replace(" ", "_") if file.filename else "file"
    path = f"{UPLOAD_DIR}/{entity_type}/{timestamp}_{safe_name}"
    with open(path, "wb") as f:
        content = await file.read()
        f.write(content)
    return {
        "filename": safe_name,
        "path": path,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "size": len(content),
    }


@router.get("/files/{entity_type}/{entity_id}")
async def list_files(entity_type: str, entity_id: int):
    """List files for a given entity."""
    dir_path = f"{UPLOAD_DIR}/{entity_type}"
    if not os.path.exists(dir_path):
        return []
    files = os.listdir(dir_path)
    return [{"filename": f, "path": f"{dir_path}/{f}"} for f in files]


# ============ NOTIFICATIONS CONFIG ============
@router.get("/notifications/config")
async def get_notifications_config():
    """Return current notification configuration."""
    return {
        "telegram": {
            "enabled": bool(os.getenv("TELEGRAM_BOT_TOKEN")),
            "bot_token_set": bool(os.getenv("TELEGRAM_BOT_TOKEN")),
            "chat_id_set": bool(os.getenv("TELEGRAM_CHAT_ID")),
        },
        "email": {
            "enabled": bool(os.getenv("SMTP_HOST")),
            "smtp_host": os.getenv("SMTP_HOST", ""),
            "smtp_port": int(os.getenv("SMTP_PORT", "587")),
            "from_email": os.getenv("SMTP_FROM", ""),
        },
    }


@router.post("/notifications/test-telegram")
async def test_telegram():
    """Send a test message via Telegram bot."""
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    if not token or not chat_id:
        raise HTTPException(400, "TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set in .env")
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"https://api.telegram.org/bot{token}/sendMessage",
                json={"chat_id": chat_id, "text": "✅ ERP System: Тестовое уведомление работает!"}
            )
            return {"success": resp.status_code == 200, "response": resp.json()}
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.post("/notifications/test-email")
async def test_email():
    """Send a test email via SMTP."""
    import smtplib
    from email.mime.text import MIMEText
    host = os.getenv("SMTP_HOST")
    port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("SMTP_FROM")
    to_email = os.getenv("SMTP_TO", from_email)
    if not all([host, user, password, from_email]):
        raise HTTPException(400, "SMTP settings must be configured in .env")
    try:
        msg = MIMEText("✅ ERP System: Тестовое email-уведомление работает!")
        msg["Subject"] = "ERP Test Notification"
        msg["From"] = from_email
        msg["To"] = to_email
        with smtplib.SMTP(host, port) as server:
            server.starttls()
            server.login(user, password)
            server.send_message(msg)
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}
