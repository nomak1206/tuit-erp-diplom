import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.database import Base


class LeadSource(str, enum.Enum):
    WEBSITE = "website"
    PHONE = "phone"
    EMAIL = "email"
    REFERRAL = "referral"
    SOCIAL = "social"
    ADVERTISING = "advertising"
    OTHER = "other"


class LeadStatus(str, enum.Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    QUALIFIED = "qualified"
    CONVERTED = "converted"
    LOST = "lost"


class DealStage(str, enum.Enum):
    NEW = "new"
    NEGOTIATION = "negotiation"
    PROPOSAL = "proposal"
    CONTRACT = "contract"
    WON = "won"
    LOST = "lost"


class ActivityType(str, enum.Enum):
    CALL = "call"
    MEETING = "meeting"
    EMAIL = "email"
    TASK = "task"
    NOTE = "note"


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    company = Column(String(255), nullable=True)
    position = Column(String(200), nullable=True)
    address = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    deals = relationship("Deal", back_populates="contact", lazy="selectin")
    activities = relationship("Activity", back_populates="contact", lazy="selectin")
    invoices = relationship("Invoice", back_populates="contact", lazy="selectin")


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    contact_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    company = Column(String(255), nullable=True)
    source = Column(Enum(LeadSource), default=LeadSource.WEBSITE)
    status = Column(Enum(LeadStatus), default=LeadStatus.NEW)
    score = Column(Integer, default=0)
    estimated_value = Column(Float, default=0.0)
    description = Column(Text, nullable=True)
    assigned_to = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    assignee = relationship("User", foreign_keys=[assigned_to], lazy="selectin")
    deals = relationship("Deal", back_populates="lead", lazy="selectin")
    activities = relationship("Activity", back_populates="lead", lazy="selectin")


class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    contact_id = Column(Integer, ForeignKey("contacts.id", ondelete="SET NULL"), nullable=True)
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="SET NULL"), nullable=True)
    stage = Column(Enum(DealStage), default=DealStage.NEW)
    amount = Column(Float, default=0.0)
    currency = Column(String(10), default="UZS")
    probability = Column(Integer, default=50)
    expected_close_date = Column(Date, nullable=True)
    description = Column(Text, nullable=True)
    assigned_to = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    contact = relationship("Contact", back_populates="deals", lazy="selectin")
    lead = relationship("Lead", back_populates="deals", lazy="selectin")
    assignee = relationship("User", foreign_keys=[assigned_to], lazy="selectin")
    activities = relationship("Activity", back_populates="deal", lazy="selectin")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(ActivityType), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    contact_id = Column(Integer, ForeignKey("contacts.id", ondelete="SET NULL"), nullable=True)
    deal_id = Column(Integer, ForeignKey("deals.id", ondelete="SET NULL"), nullable=True)
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="SET NULL"), nullable=True)
    assigned_to = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    completed = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    contact = relationship("Contact", back_populates="activities", lazy="selectin")
    deal = relationship("Deal", back_populates="activities", lazy="selectin")
    lead = relationship("Lead", back_populates="activities", lazy="selectin")
    assignee = relationship("User", foreign_keys=[assigned_to], lazy="selectin")
