import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text, ForeignKey, Date, Boolean, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class AccountType(str, enum.Enum):
    ASSET = "asset"
    LIABILITY = "liability"
    EQUITY = "equity"
    REVENUE = "revenue"
    EXPENSE = "expense"


class InvoiceStatus(str, enum.Enum):
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"


class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    BANK_TRANSFER = "bank_transfer"
    CARD = "card"
    CHECK = "check"


class Currency(str, enum.Enum):
    UZS = "UZS"
    USD = "USD"


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    type = Column(Enum(AccountType), nullable=False)
    parent_id = Column(Integer, ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    balance = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    parent = relationship("Account", remote_side=[id], backref="children", lazy="selectin")
    journal_lines = relationship("JournalLine", back_populates="account", lazy="selectin")


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    description = Column(Text, nullable=False)
    reference = Column(String(100), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_posted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    author = relationship("User", foreign_keys=[created_by], lazy="selectin")
    lines = relationship("JournalLine", back_populates="entry", cascade="all, delete-orphan", lazy="selectin")


class JournalLine(Base):
    __tablename__ = "journal_lines"

    id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(Integer, ForeignKey("journal_entries.id", ondelete="CASCADE"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="RESTRICT"), nullable=False)
    debit = Column(Float, default=0.0)
    credit = Column(Float, default=0.0)
    description = Column(String(255), nullable=True)

    # Relationships
    entry = relationship("JournalEntry", back_populates="lines", lazy="selectin")
    account = relationship("Account", back_populates="journal_lines", lazy="selectin")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(String(50), unique=True, nullable=False)
    contact_id = Column(Integer, ForeignKey("contacts.id", ondelete="SET NULL"), nullable=True)
    contact_name = Column(String(255), nullable=False)
    date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(Enum(InvoiceStatus), default=InvoiceStatus.DRAFT)
    subtotal = Column(Float, default=0.0)
    nds_rate = Column(Float, default=12.0)       # НДС ставка (%)
    nds_amount = Column(Float, default=0.0)       # НДС сумма
    tax = Column(Float, default=0.0)              # Общий налог (legacy)
    total = Column(Float, default=0.0)
    currency = Column(Enum(Currency), default=Currency.UZS)
    # ИНН поставщика / покупателя (e-factura)
    supplier_inn = Column(String(20), nullable=True)
    buyer_inn = Column(String(20), nullable=True)
    contract_number = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    contact = relationship("Contact", back_populates="invoices", lazy="selectin")
    payments = relationship("Payment", back_populates="invoice", lazy="selectin")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="SET NULL"), nullable=True)
    amount = Column(Float, nullable=False)
    method = Column(Enum(PaymentMethod), default=PaymentMethod.BANK_TRANSFER)
    reference = Column(String(100), nullable=True)
    date = Column(Date, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    invoice = relationship("Invoice", back_populates="payments", lazy="selectin")
