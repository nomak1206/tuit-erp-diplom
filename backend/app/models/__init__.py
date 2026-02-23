"""
SQLAlchemy models — re-export all for convenience.

Usage:
    from app.models import User, Contact, Deal, Employee, ...
"""
from app.models.user import User, AuditLog, UserRole
from app.models.crm import Contact, Lead, Deal, Activity, LeadSource, LeadStatus, DealStage, ActivityType
from app.models.accounting import Account, JournalEntry, JournalLine, Invoice, Payment, AccountType, InvoiceStatus, PaymentMethod
from app.models.hr import Department, Employee, Timesheet, PayrollEntry, Leave, EmployeeStatus, LeaveType, LeaveStatus
from app.models.warehouse import Category, Product, Warehouse, StockMovement, InventoryCheck, MovementType, UnitOfMeasure
from app.models.project import Project, Task, TaskComment, ProjectStatus, TaskStatus, TaskPriority
from app.models.document import Document, DocumentVersion, ApprovalStep, DocumentType, DocumentStatus, ApprovalAction
from app.models.notification import Notification

__all__ = [
    # User
    "User", "AuditLog", "UserRole",
    # CRM
    "Contact", "Lead", "Deal", "Activity",
    "LeadSource", "LeadStatus", "DealStage", "ActivityType",
    # Accounting
    "Account", "JournalEntry", "JournalLine", "Invoice", "Payment",
    "AccountType", "InvoiceStatus", "PaymentMethod",
    # HR
    "Department", "Employee", "Timesheet", "PayrollEntry", "Leave",
    "EmployeeStatus", "LeaveType", "LeaveStatus",
    # Warehouse
    "Category", "Product", "Warehouse", "StockMovement", "InventoryCheck",
    "MovementType", "UnitOfMeasure",
    # Projects
    "Project", "Task", "TaskComment",
    "ProjectStatus", "TaskStatus", "TaskPriority",
    # Documents
    "Document", "DocumentVersion", "ApprovalStep",
    "DocumentType", "DocumentStatus", "ApprovalAction",
    # Notification
    "Notification",
]
