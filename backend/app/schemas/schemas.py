from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ============ AUTH ============
class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    role: str
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str
    full_name: str
    role: str = "employee"


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    avatar_url: Optional[str] = None


# ============ CRM ============
class ContactBase(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    position: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None


class ContactResponse(ContactBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True


class LeadBase(BaseModel):
    title: str
    contact_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    source: str = "website"
    status: str = "new"
    score: int = 0
    estimated_value: float = 0.0
    description: Optional[str] = None


class LeadResponse(LeadBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True


class DealBase(BaseModel):
    title: str
    contact_id: Optional[int] = None
    lead_id: Optional[int] = None
    stage: str = "new"
    amount: float = 0.0
    currency: str = "UZS"
    probability: int = 50
    expected_close_date: Optional[str] = None
    description: Optional[str] = None


class DealResponse(DealBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True


class ActivityBase(BaseModel):
    type: str
    title: str
    description: Optional[str] = None
    contact_id: Optional[int] = None
    deal_id: Optional[int] = None
    lead_id: Optional[int] = None
    due_date: Optional[str] = None
    completed: int = 0


class ActivityResponse(ActivityBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True


# ============ ACCOUNTING ============
class AccountBase(BaseModel):
    code: str
    name: str
    type: str
    parent_id: Optional[int] = None
    description: Optional[str] = None


class AccountResponse(AccountBase):
    id: int
    is_active: bool
    balance: float
    class Config:
        from_attributes = True


class JournalEntryBase(BaseModel):
    date: str
    description: str
    reference: Optional[str] = None


class JournalLineBase(BaseModel):
    account_id: int
    debit: float = 0.0
    credit: float = 0.0
    description: Optional[str] = None


class JournalEntryCreate(JournalEntryBase):
    lines: list[JournalLineBase] = []


class JournalEntryResponse(JournalEntryBase):
    id: int
    is_posted: bool
    created_at: datetime
    class Config:
        from_attributes = True


class InvoiceBase(BaseModel):
    number: str
    contact_name: str
    contact_id: Optional[int] = None
    date: str
    due_date: str
    status: str = "draft"
    subtotal: float = 0.0
    tax: float = 0.0
    total: float = 0.0
    notes: Optional[str] = None


class InvoiceResponse(InvoiceBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True


# ============ HR ============
class DepartmentBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    parent_id: Optional[int] = None


class DepartmentResponse(DepartmentBase):
    id: int
    class Config:
        from_attributes = True


class EmployeeBase(BaseModel):
    employee_number: str
    first_name: str
    last_name: str
    middle_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    birth_date: Optional[str] = None
    hire_date: str
    department_id: Optional[int] = None
    position: str
    salary: float = 0.0
    status: str = "active"


class EmployeeResponse(EmployeeBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True


class PayrollBase(BaseModel):
    employee_id: int
    period_start: str
    period_end: str
    base_salary: float = 0.0
    bonuses: float = 0.0
    deductions: float = 0.0
    tax: float = 0.0
    net_salary: float = 0.0


class PayrollResponse(PayrollBase):
    id: int
    is_paid: bool
    class Config:
        from_attributes = True


# ============ WAREHOUSE ============
class ProductBase(BaseModel):
    sku: str
    name: str
    category_id: Optional[int] = None
    unit: str = "piece"
    purchase_price: float = 0.0
    selling_price: float = 0.0
    min_stock: int = 0
    description: Optional[str] = None
    barcode: Optional[str] = None


class ProductResponse(ProductBase):
    id: int
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True


class StockMovementBase(BaseModel):
    product_id: int
    warehouse_id: int
    type: str
    quantity: float
    unit_price: float = 0.0
    total_price: float = 0.0
    document_ref: Optional[str] = None
    notes: Optional[str] = None
    date: str


class StockMovementResponse(StockMovementBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True


# ============ PROJECTS ============
class ProjectBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    status: str = "planning"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    budget: float = 0.0


class ProjectResponse(ProjectBase):
    id: int
    progress: int
    spent: float
    created_at: datetime
    class Config:
        from_attributes = True


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: Optional[int] = None
    status: str = "todo"
    priority: str = "medium"
    assigned_to: Optional[int] = None
    assigned_name: Optional[str] = None
    due_date: Optional[str] = None
    estimated_hours: float = 0.0


class TaskResponse(TaskBase):
    id: int
    actual_hours: float
    sort_order: int
    created_at: datetime
    class Config:
        from_attributes = True


# ============ DOCUMENTS ============
class DocumentBase(BaseModel):
    title: str
    number: Optional[str] = None
    type: str
    content: Optional[str] = None
    department: Optional[str] = None
    tags: Optional[str] = None


class DocumentResponse(DocumentBase):
    id: int
    status: str
    author_name: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True
