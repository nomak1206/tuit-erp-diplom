from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone, date, timedelta
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.hr import Employee, Department, Timesheet, PayrollEntry, Leave, LeaveType, LeaveStatus, EmployeeStatus

router = APIRouter(prefix="/api/hr", tags=["HR"])

# ============ CONSTANTS: Uzbekistan 2025/2026 =============
NDFL_RATE = 0.12        # НДФЛ — 12%
INPS_RATE = 0.01        # ИНПС — 1%  (от сотрудника)
ESN_RATE = 0.12         # ЕСН  — 12% (от работодателя)
MROT = 1155000          # Минимальная зарплата (сўм, с 01.01.2025)
AVG_WORK_DAYS_COEFF = 25.4  # Среднее кол-во рабочих дней в месяце для расчёта отпускных
MIN_VACATION_DAYS = 21  # Минимальный отпуск (календарных дней)

def _calc_work_days(start_str: str, end_str: str, schedule_type: str = "five_day") -> int:
    try:
        s = date.fromisoformat(start_str[:10])
        e = date.fromisoformat(end_str[:10])
    except ValueError:
        return 0
    days = 0
    current = s
    while current <= e:
        if schedule_type == "six_day":
            if current.weekday() < 6:  # 0-5 = Mon-Sat
                days += 1
        elif schedule_type == "shift":
            # For shift, just approximate or count every day as we don't know the exact schedule
            days += 1
        else: # five_day
            if current.weekday() < 5:  # 0-4 = Mon-Fri
                days += 1
        current += timedelta(days=1)
    return days

# Государственные праздники Республики Узбекистан
_holidays = [
    {"date": "2026-01-01", "name": "hr.holidays.new_year"},
    {"date": "2026-03-08", "name": "hr.holidays.womens_day"},
    {"date": "2026-03-21", "name": "hr.holidays.navruz"},
    {"date": "2026-05-09", "name": "hr.holidays.memorial_day"},
    {"date": "2026-09-01", "name": "hr.holidays.independence_day"},
    {"date": "2026-10-01", "name": "hr.holidays.teachers_day"},
    {"date": "2026-12-08", "name": "hr.holidays.constitution_day"},
    # Религиозные праздники (плавающие)
    {"date": "2026-03-31", "name": "hr.holidays.ramadan_hayit"},
    {"date": "2026-06-07", "name": "hr.holidays.qurban_hayit"},
]

# Остаточные in-memory списки для некритичных функций Штатного расписания
_schedules = []
_staffing_positions = []

# ============ ENDPOINTS ============
@router.get("/departments")
async def get_departments(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Department))
    departments = result.scalars().all()
    return [{"id": d.id, "name": d.name, "code": d.code, "description": d.description} for d in departments]

@router.get("/employees")
async def get_employees(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Employee).options(selectinload(Employee.department)))
    emps = result.scalars().all()
    
    return [
        {
            "id": e.id,
            "employee_number": e.employee_number,
            "first_name": e.first_name,
            "last_name": e.last_name,
            "middle_name": e.middle_name,
            "email": e.email,
            "phone": e.phone,
            "birth_date": str(e.birth_date) if e.birth_date else None,
            "hire_date": str(e.hire_date),
            "department_id": e.department_id,
            "department_name": e.department.name if e.department else None,
            "position": e.position,
            "salary": e.salary,
            "status": e.status.value,
            "created_at": e.created_at.isoformat() if e.created_at else None
        }
        for e in emps
    ]

@router.get("/employees/{employee_id}")
async def get_employee(employee_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Employee).where(Employee.id == employee_id).options(selectinload(Employee.department)))
    e = result.scalars().first()
    if not e:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    return {
        "id": e.id,
        "employee_number": e.employee_number,
        "first_name": e.first_name,
        "last_name": e.last_name,
        "middle_name": e.middle_name,
        "email": e.email,
        "phone": e.phone,
        "birth_date": str(e.birth_date) if e.birth_date else None,
        "hire_date": str(e.hire_date),
        "department_id": e.department_id,
        "department_name": e.department.name if e.department else None,
        "position": e.position,
        "salary": e.salary,
        "status": e.status.value,
        "created_at": e.created_at.isoformat() if e.created_at else None
    }


@router.post("/employees")
async def create_employee(data: dict, db: AsyncSession = Depends(get_db)):
    emp = Employee(
        employee_number=data.get("employee_number", f"EMP-{int(datetime.now().timestamp())}"),
        first_name=data.get("first_name", "Unknown"),
        last_name=data.get("last_name", "Unknown"),
        middle_name=data.get("middle_name"),
        email=data.get("email"),
        phone=data.get("phone"),
        hire_date=date.fromisoformat(data.get("hire_date", date.today().isoformat()[:10])),
        department_id=data.get("department_id"),
        position=data.get("position", "Employee"),
        salary=data.get("salary", 0.0),
        status=EmployeeStatus.ACTIVE
    )
    db.add(emp)
    await db.commit()
    await db.refresh(emp)
    return {"id": emp.id, "first_name": emp.first_name, "last_name": emp.last_name}


@router.patch("/employees/{employee_id}")
async def update_employee(employee_id: int, data: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = result.scalars().first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    for k, v in data.items():
        if hasattr(emp, k) and k != "id":
            if k in ["hire_date", "birth_date", "dismissal_date"] and v:
                v = date.fromisoformat(v[:10])
            setattr(emp, k, v)
    
    await db.commit()
    return {"id": emp.id}


@router.delete("/employees/{employee_id}")
async def delete_employee(employee_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = result.scalars().first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    await db.delete(emp)
    await db.commit()
    return {"detail": "Employee deleted"}


# ---- Payroll ----
@router.get("/payroll")
async def get_payroll(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PayrollEntry).options(selectinload(PayrollEntry.employee)))
    entries = result.scalars().all()
    return [
        {
            "id": p.id,
            "employee_id": p.employee_id,
            "period": p.period_start.strftime("%Y-%m"),
            "employee_name": f"{p.employee.last_name} {p.employee.first_name}" if p.employee else "Unknown",
            "gross": p.base_salary,
            "ndfl": p.tax,
            "inps": p.deductions,
            "esn_employer": p.bunuses if hasattr(p, 'bunuses') else 0,
            "net_salary": p.net_salary,
            "is_paid": p.is_paid
        }
        for p in entries
    ]


@router.post("/payroll/calculate-all")
async def calculate_payroll_all(data: dict, db: AsyncSession = Depends(get_db)):
    period_start = data.get("period_start", "")
    period_end = data.get("period_end", "")
    if not period_start or not period_end:
        raise HTTPException(status_code=400, detail="period_start and period_end required")

    return {"count": 0, "entries": [], "totals": {"gross": 0, "ndfl": 0, "inps": 0, "net": 0, "esn": 0}}


# ---- Leaves / Vacations ----
@router.get("/leaves")
async def get_leaves(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Leave).options(selectinload(Leave.employee)))
    leaves = result.scalars().all()
    return [
        {
            "id": l.id,
            "employee_id": l.employee_id,
            "employee_name": f"{l.employee.last_name} {l.employee.first_name}" if l.employee else "Unknown",
            "type": l.type.value,
            "start_date": l.start_date.isoformat(),
            "end_date": l.end_date.isoformat(),
            "calendar_days": l.days_count,
            "work_days": l.days_count,
            "status": l.status.value,
            "reason": l.reason
        }
        for l in leaves
    ]


@router.post("/leaves")
async def create_leave(data: dict, db: AsyncSession = Depends(get_db)):
    leave = Leave(
        employee_id=data.get("employee_id"),
        type=data.get("type", "vacation"),
        start_date=date.fromisoformat(data.get("start_date")[:10]),
        end_date=date.fromisoformat(data.get("end_date")[:10]),
        days_count=_calc_work_days(data.get("start_date"), data.get("end_date")),
        reason=data.get("reason"),
        status=LeaveStatus.PENDING
    )
    db.add(leave)
    await db.commit()
    await db.refresh(leave)
    return {"id": leave.id}


@router.get("/vacation/calculate")
async def calculate_vacation(employee_id: int, start_date: str, end_date: str, db: AsyncSession = Depends(get_db)):
    return {
        "employee_id": employee_id,
        "employee_name": f"Employee {employee_id}",
        "position": "Unknown",
        "avg_salary": MROT,
        "daily_rate": MROT / AVG_WORK_DAYS_COEFF,
        "start_date": start_date,
        "end_date": end_date,
        "calendar_days": 1,
        "work_days": 1,
        "vacation_pay_gross": MROT,
        "ndfl": 0,
        "inps": 0,
        "vacation_pay_net": MROT,
        "min_vacation_days": MIN_VACATION_DAYS,
        "used_days": 0,
        "remaining_days": MIN_VACATION_DAYS
    }


# ---- Holidays ----
@router.get("/holidays")
async def get_holidays():
    return _holidays

# ---- Schedules ----
@router.get("/schedules")
async def get_schedules():
    return _schedules

@router.post("/schedules")
async def create_schedule(data: dict):
    _schedules.append(data)
    return data

# ---- Timesheet ----
@router.get("/timesheet")
async def get_timesheet(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Timesheet).options(selectinload(Timesheet.employee)))
    timesheets = result.scalars().all()
    return [{"id": t.id, "employee_id": t.employee_id, "date": t.date.isoformat(), "hours_worked": t.hours_worked} for t in timesheets]

@router.post("/timesheet")
async def create_timesheet_entry(data: dict, db: AsyncSession = Depends(get_db)):
    entry = Timesheet(
        employee_id=data.get("employee_id"),
        date=date.fromisoformat(data.get("date")[:10]),
        hours_worked=data.get("hours_worked", 8.0)
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return {"id": entry.id}

# ---- Stats ----
@router.get("/stats")
async def get_hr_stats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Employee))
    emps = result.scalars().all()
    active = sum(1 for e in emps if e.status.value == "active")
    total_salary = sum(e.salary for e in emps if e.status.value == "active")
    
    return {
        "total_employees": len(emps),
        "active_employees": active,
        "departments_count": 0,
        "total_salary_fund": total_salary,
        "average_salary": round(total_salary / max(active, 1)),
        "pending_leaves": 0,
        "department_distribution": {},
        "mrot": MROT,
        "ndfl_rate": NDFL_RATE,
        "inps_rate": INPS_RATE,
        "esn_rate": ESN_RATE,
    }

# ---- Staffing Table ----
@router.get("/staffing")
async def get_staffing():
    return _staffing_positions

@router.post("/staffing")
async def create_staffing(data: dict):
    _staffing_positions.append(data)
    return data

@router.get("/staffing/summary")
async def get_staffing_summary():
    return {
        "total_positions": 0,
        "occupied": 0,
        "vacancies": 0,
        "fill_rate": 0.0,
        "by_department": {},
    }
