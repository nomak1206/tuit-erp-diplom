import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text, ForeignKey, Date, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class EmployeeStatus(str, enum.Enum):
    ACTIVE = "active"
    ON_LEAVE = "on_leave"
    DISMISSED = "dismissed"


class LeaveType(str, enum.Enum):
    VACATION = "vacation"
    SICK = "sick"
    PERSONAL = "personal"
    MATERNITY = "maternity"
    OTHER = "other"


class LeaveStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    head_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    parent_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    head = relationship("User", foreign_keys=[head_id], lazy="selectin")
    parent = relationship("Department", remote_side=[id], backref="children", lazy="selectin")
    employees = relationship("Employee", back_populates="department", lazy="selectin")


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_number = Column(String(20), unique=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    middle_name = Column(String(100), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    birth_date = Column(Date, nullable=True)
    hire_date = Column(Date, nullable=False)
    dismissal_date = Column(Date, nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    position = Column(String(200), nullable=False)
    salary = Column(Float, default=0.0)
    status = Column(Enum(EmployeeStatus), default=EmployeeStatus.ACTIVE)
    address = Column(Text, nullable=True)
    passport_data = Column(String(255), nullable=True)
    inn = Column(String(20), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    department = relationship("Department", back_populates="employees", lazy="selectin")
    user = relationship("User", back_populates="employee_profile", lazy="selectin")
    timesheets = relationship("Timesheet", back_populates="employee", cascade="all, delete-orphan", lazy="selectin")
    payroll_entries = relationship("PayrollEntry", back_populates="employee", cascade="all, delete-orphan", lazy="selectin")
    leaves = relationship("Leave", back_populates="employee", cascade="all, delete-orphan", lazy="selectin")


class Timesheet(Base):
    __tablename__ = "timesheets"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    hours_worked = Column(Float, default=8.0)
    overtime = Column(Float, default=0.0)
    is_absent = Column(Boolean, default=False)
    notes = Column(String(255), nullable=True)

    # Relationships
    employee = relationship("Employee", back_populates="timesheets", lazy="selectin")


class PayrollEntry(Base):
    __tablename__ = "payroll_entries"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    base_salary = Column(Float, default=0.0)
    bonuses = Column(Float, default=0.0)
    deductions = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)
    net_salary = Column(Float, default=0.0)
    is_paid = Column(Boolean, default=False)
    paid_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    employee = relationship("Employee", back_populates="payroll_entries", lazy="selectin")


class Leave(Base):
    __tablename__ = "leaves"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    type = Column(Enum(LeaveType), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    days_count = Column(Integer, nullable=False)
    status = Column(Enum(LeaveStatus), default=LeaveStatus.PENDING)
    reason = Column(Text, nullable=True)
    approved_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    employee = relationship("Employee", back_populates="leaves", lazy="selectin")
    approver = relationship("User", foreign_keys=[approved_by], lazy="selectin")


class WorkSchedule(Base):
    __tablename__ = "work_schedules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    schedule_type = Column(String(50), default="five_day")  # five_day, six_day, shift
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    start_time = Column(String(10), default="09:00")
    end_time = Column(String(10), default="18:00")
    break_minutes = Column(Integer, default=60)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    department = relationship("Department", lazy="selectin")


class StaffingPosition(Base):
    __tablename__ = "staffing_positions"

    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    position_name = Column(String(255), nullable=False)
    count = Column(Integer, default=1)
    occupied = Column(Integer, default=0)
    salary_min = Column(Float, default=0.0)
    salary_max = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    department = relationship("Department", lazy="selectin")
