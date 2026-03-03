"""Audit Log model — tracks all user actions for compliance."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    username = Column(String(100), nullable=True)
    action = Column(String(50), nullable=False)       # create, update, delete, login, logout
    entity_type = Column(String(100), nullable=True)   # invoice, employee, deal, etc.
    entity_id = Column(Integer, nullable=True)
    details = Column(JSON, nullable=True)              # changed fields, old/new values
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", lazy="selectin")
