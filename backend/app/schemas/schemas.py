from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date


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
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    company: Optional[str] = Field(None, max_length=255)
    position: Optional[str] = Field(None, max_length=200)
    address: Optional[str] = None
    notes: Optional[str] = None

class ContactUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    company: Optional[str] = Field(None, max_length=255)
    position: Optional[str] = Field(None, max_length=200)
    address: Optional[str] = None
    notes: Optional[str] = None


class ContactResponse(ContactBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True


class LeadBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    contact_name: str = Field(..., min_length=1, max_length=255)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    company: Optional[str] = Field(None, max_length=255)
    source: str = "website"
    status: str = "new"
    score: int = 0
    estimated_value: float = 0.0
    description: Optional[str] = None

class LeadUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    contact_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    company: Optional[str] = Field(None, max_length=255)
    source: Optional[str] = None
    status: Optional[str] = None
    score: Optional[int] = None
    estimated_value: Optional[float] = None
    budget: Optional[float] = None # For frontend compatibility
    description: Optional[str] = None


class LeadResponse(LeadBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True


class DealBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    contact_id: Optional[int] = None
    lead_id: Optional[int] = None
    stage: str = "new"
    amount: float = 0.0
    currency: str = Field("UZS", max_length=10)
    probability: int = 50
    expected_close_date: Optional[str] = None
    description: Optional[str] = None

class DealUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    contact_id: Optional[int] = None
    lead_id: Optional[int] = None
    stage: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = Field(None, max_length=10)
    probability: Optional[int] = None
    expected_close_date: Optional[str] = None
    description: Optional[str] = None


class DealResponse(DealBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True


class ActivityBase(BaseModel):
    type: str = Field(..., max_length=50)
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    contact_id: Optional[int] = None
    deal_id: Optional[int] = None
    lead_id: Optional[int] = None
    due_date: Optional[str] = None
    completed: int = 0

class ActivityUpdate(BaseModel):
    type: Optional[str] = Field(None, max_length=50)
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    contact_id: Optional[int] = None
    deal_id: Optional[int] = None
    lead_id: Optional[int] = None
    due_date: Optional[str] = None
    completed: Optional[int] = None


class ActivityResponse(ActivityBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True


# ============ ACCOUNTING ============
class AccountBase(BaseModel):
    code: str = Field(..., max_length=20)
    name: str = Field(..., max_length=200)
    account_type: Optional[str] = Field(None, alias="account_type", max_length=50)
    type: Optional[str] = Field(None, max_length=50)
    parent_id: Optional[int] = None
    description: Optional[str] = None

class AccountUpdate(BaseModel):
    code: Optional[str] = Field(None, max_length=20)
    name: Optional[str] = Field(None, max_length=200)
    account_type: Optional[str] = Field(None, max_length=50)
    type: Optional[str] = Field(None, max_length=50)
    parent_id: Optional[int] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    balance: Optional[float] = None

    def get_account_type(self) -> str:
        return self.account_type or self.type or "asset"

    model_config = {"populate_by_name": True}


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
    number: str = Field(..., max_length=50)
    contact_name: str = Field(..., max_length=255)
    contact_id: Optional[int] = None
    date: str
    due_date: str
    status: str = "draft"
    subtotal: float = 0.0
    nds_rate: float = 12.0
    tax: float = 0.0
    total: float = 0.0
    currency: str = "UZS"
    supplier_inn: Optional[str] = Field(None, max_length=20)
    buyer_inn: Optional[str] = Field(None, max_length=20)
    contract_number: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None

class InvoiceUpdate(BaseModel):
    number: Optional[str] = Field(None, max_length=50)
    contact_name: Optional[str] = Field(None, max_length=255)
    contact_id: Optional[int] = None
    date: Optional[str] = None
    due_date: Optional[str] = None
    status: Optional[str] = None
    subtotal: Optional[float] = None
    nds_rate: Optional[float] = None
    tax: Optional[float] = None
    total: Optional[float] = None
    currency: Optional[str] = Field(None, max_length=10)
    supplier_inn: Optional[str] = Field(None, max_length=20)
    buyer_inn: Optional[str] = Field(None, max_length=20)
    contract_number: Optional[str] = Field(None, max_length=100)
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
    employee_number: str = Field(..., max_length=50)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    birth_date: Optional[str] = None
    hire_date: str
    department_id: Optional[int] = None
    position: str = Field(..., max_length=200)
    salary: float = 0.0
    status: str = "active"

class EmployeeUpdate(BaseModel):
    employee_number: Optional[str] = Field(None, max_length=50)
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    birth_date: Optional[str] = None
    hire_date: Optional[str] = None
    department_id: Optional[int] = None
    position: Optional[str] = Field(None, max_length=200)
    salary: Optional[float] = None
    status: Optional[str] = None
    dismissal_date: Optional[str] = None


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
    sku: str = Field(..., max_length=100)
    name: str = Field(..., max_length=255)
    category_id: Optional[int] = None
    unit: str = "piece"
    purchase_price: float = 0.0
    selling_price: float = 0.0
    min_stock: int = 0
    description: Optional[str] = None
    barcode: Optional[str] = Field(None, max_length=100)

class ProductUpdate(BaseModel):
    sku: Optional[str] = Field(None, max_length=100)
    name: Optional[str] = Field(None, max_length=255)
    category_id: Optional[int] = None
    unit: Optional[str] = None
    purchase_price: Optional[float] = None
    selling_price: Optional[float] = None
    min_stock: Optional[int] = None
    description: Optional[str] = None
    barcode: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None


class ProductResponse(ProductBase):
    id: int
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True


class StockMovementBase(BaseModel):
    product_id: int
    warehouse_id: int
    type: str = "incoming"
    quantity: float = 1.0
    unit_price: float = 0.0
    total_price: float = 0.0
    document_ref: Optional[str] = None
    notes: Optional[str] = None
    date: Optional[str] = None


class StockMovementResponse(StockMovementBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True


# ============ PROJECTS ============
class ProjectBase(BaseModel):
    name: str = Field(..., max_length=255)
    code: str = Field(..., max_length=100)
    description: Optional[str] = None
    status: str = "planning"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    budget: float = 0.0

class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    code: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    budget: Optional[float] = None
    spent: Optional[float] = None
    progress: Optional[int] = None


class ProjectResponse(ProjectBase):
    id: int
    progress: int
    spent: float
    created_at: datetime
    class Config:
        from_attributes = True


class TaskBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    project_id: Optional[int] = None
    status: str = "todo"
    priority: str = "medium"
    assigned_to: Optional[int] = None
    assigned_name: Optional[str] = Field(None, max_length=255)
    due_date: Optional[str] = None
    estimated_hours: float = 0.0

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    project_id: Optional[int] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[int] = None
    assigned_name: Optional[str] = Field(None, max_length=255)
    due_date: Optional[str] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    sort_order: Optional[int] = None


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
