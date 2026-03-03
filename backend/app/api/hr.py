from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone, date, timedelta
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.security import get_current_user
from app.core.permissions import require_role
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.user import UserRole
from app.models.hr import Employee, Department, Timesheet, PayrollEntry, Leave, LeaveType, LeaveStatus, EmployeeStatus, WorkSchedule, StaffingPosition
from app.schemas.schemas import EmployeeBase, DepartmentBase, EmployeeUpdate

router = APIRouter(prefix="/api/hr", tags=["HR"], dependencies=[Depends(get_current_user)])

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

# WARNING: Holidays remain in-memory as they are static constants.
# Schedules and Staffing use database tables now.

# ============ ENDPOINTS ============
@router.get("/departments")
async def get_departments(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Department))
    departments = result.scalars().all()
    return [{"id": d.id, "name": d.name, "code": d.code, "description": d.description} for d in departments]

@router.get("/employees")
async def get_employees(db: AsyncSession = Depends(get_db), skip: int = 0, limit: int = 100):
    result = await db.execute(select(Employee).options(selectinload(Employee.department)).offset(skip).limit(limit))
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
async def create_employee(data: EmployeeBase, db: AsyncSession = Depends(get_db)):
    try:
        hire_date_str = data.hire_date
        if hire_date_str:
            hire_date = date.fromisoformat(hire_date_str[:10])
        else:
            hire_date = date.today()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid hire_date format. Use YYYY-MM-DD")

    emp = Employee(
        employee_number=data.employee_number,
        first_name=data.first_name,
        last_name=data.last_name,
        middle_name=data.middle_name,
        email=data.email,
        phone=data.phone,
        hire_date=hire_date,
        department_id=data.department_id,
        position=data.position,
        salary=data.salary,
        status=EmployeeStatus.ACTIVE
    )
    db.add(emp)
    await db.commit()
    await db.refresh(emp)
    return {"id": emp.id, "first_name": emp.first_name, "last_name": emp.last_name}


@router.patch("/employees/{employee_id}")
async def update_employee(employee_id: int, data: EmployeeUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = result.scalars().first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        if k in ["hire_date", "birth_date", "dismissal_date"] and v:
            try:
                v = date.fromisoformat(str(v)[:10])
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid date format for {k}")
        setattr(emp, k, v)
    
    await db.commit()
    await db.refresh(emp)
    return {"id": emp.id, "first_name": emp.first_name, "last_name": emp.last_name}


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
async def get_payroll(db: AsyncSession = Depends(get_db), skip: int = 0, limit: int = 100):
    result = await db.execute(select(PayrollEntry).options(selectinload(PayrollEntry.employee)).offset(skip).limit(limit))
    entries = result.scalars().all()
    return [
        {
            "id": p.id,
            "employee_id": p.employee_id,
            "period": p.period_start.strftime("%Y-%m") if p.period_start else "—",
            "period_start": str(p.period_start) if p.period_start else None,
            "period_end": str(p.period_end) if p.period_end else None,
            "employee_name": f"{p.employee.last_name} {p.employee.first_name}" if p.employee else "Unknown",
            "base_salary": p.base_salary,
            "gross": p.base_salary,
            "worked_days": getattr(p, 'worked_days', None) or _calc_work_days(str(p.period_start), str(p.period_end)) if p.period_start and p.period_end else 22,
            "total_days": _calc_work_days(str(p.period_start), str(p.period_end)) if p.period_start and p.period_end else 22,
            "allowances": getattr(p, 'bunuses', 0) or 0,
            "ndfl": p.tax,
            "inps": p.deductions,
            "esn_employer": round(p.base_salary * 0.12) if p.base_salary else 0,
            "net_salary": p.net_salary,
            "is_paid": p.is_paid,
        }
        for p in entries
    ]


@router.post("/payroll/calculate-all")
async def calculate_payroll_all(data: dict, db: AsyncSession = Depends(get_db)):
    period_start = data.get("period_start", "")
    period_end = data.get("period_end", "")
    if not period_start or not period_end:
        raise HTTPException(status_code=400, detail="period_start and period_end required")

    result = await db.execute(
        select(Employee).where(Employee.status == EmployeeStatus.ACTIVE)
    )
    employees = result.scalars().all()
    entries = []
    totals = {"gross": 0, "ndfl": 0, "inps": 0, "net": 0, "esn": 0}

    ps = datetime.strptime(period_start, "%Y-%m-%d").date()
    pe = datetime.strptime(period_end, "%Y-%m-%d").date()

    for emp in employees:
        gross = float(emp.salary or 0)
        ndfl = round(gross * NDFL_RATE)
        inps = round(gross * INPS_RATE)
        esn = round(gross * ESN_RATE)
        net = gross - ndfl - inps

        entry = PayrollEntry(
            employee_id=emp.id,
            period_start=ps,
            period_end=pe,
            base_salary=gross,
            tax=ndfl,
            deductions=inps,
            net_salary=net,
            is_paid=False,
        )
        db.add(entry)

        entries.append({
            "employee_id": emp.id,
            "employee_name": f"{emp.last_name} {emp.first_name}",
            "gross": gross, "ndfl": ndfl, "inps": inps,
            "esn_employer": esn, "net_salary": net,
        })
        totals["gross"] += gross
        totals["ndfl"] += ndfl
        totals["inps"] += inps
        totals["net"] += net
        totals["esn"] += esn

    await db.commit()
    return {"count": len(entries), "entries": entries, "totals": totals}


# ---- Leaves / Vacations ----
@router.get("/leaves")
async def get_leaves(db: AsyncSession = Depends(get_db), skip: int = 0, limit: int = 100):
    result = await db.execute(select(Leave).options(selectinload(Leave.employee)).offset(skip).limit(limit))
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
    start_t = data.get("start_date")
    end_t = data.get("end_date")
    if not start_t or not end_t:
        raise HTTPException(status_code=400, detail="Missing dates")
    sd = date.fromisoformat(start_t[:10])
    ed = date.fromisoformat(end_t[:10])
    if sd > ed:
        raise HTTPException(status_code=400, detail="Invalid dates: end_date must be after start_date")
        
    leave = Leave(
        employee_id=data.get("employee_id"),
        type=data.get("type", "vacation"),
        start_date=sd,
        end_date=ed,
        days_count=_calc_work_days(start_t, end_t),
        reason=data.get("reason"),
        status=LeaveStatus.PENDING
    )
    db.add(leave)
    await db.commit()
    await db.refresh(leave)
    return {"id": leave.id}


@router.get("/vacation/calculate")
async def calculate_vacation(employee_id: int, start_date: str, end_date: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = result.scalars().first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    avg_salary = float(emp.salary or MROT)
    daily_rate = round(avg_salary / AVG_WORK_DAYS_COEFF, 2)

    sd = datetime.strptime(start_date, "%Y-%m-%d").date()
    ed = datetime.strptime(end_date, "%Y-%m-%d").date()
    calendar_days = max((ed - sd).days + 1, 1)
    work_days = _calc_work_days(start_date, end_date, "five_day")

    vacation_pay_gross = round(daily_rate * work_days, 2)
    ndfl = round(vacation_pay_gross * NDFL_RATE, 2)
    inps = round(vacation_pay_gross * INPS_RATE, 2)
    vacation_pay_net = round(vacation_pay_gross - ndfl - inps, 2)

    # Count used vacation days
    leaves_result = await db.execute(
        select(Leave).where(Leave.employee_id == employee_id, Leave.type == LeaveType.VACATION)
    )
    used_days = sum(
        max((lv.end_date - lv.start_date).days + 1, 0)
        for lv in leaves_result.scalars().all()
        if lv.start_date and lv.end_date
    )

    return {
        "employee_id": employee_id,
        "employee_name": f"{emp.last_name} {emp.first_name}",
        "position": emp.position or "—",
        "avg_salary": avg_salary,
        "daily_rate": daily_rate,
        "start_date": start_date,
        "end_date": end_date,
        "calendar_days": calendar_days,
        "work_days": work_days,
        "vacation_pay_gross": vacation_pay_gross,
        "ndfl": ndfl,
        "inps": inps,
        "vacation_pay_net": vacation_pay_net,
        "min_vacation_days": MIN_VACATION_DAYS,
        "used_days": used_days,
        "remaining_days": max(MIN_VACATION_DAYS - used_days, 0)
    }


# ---- Sick Leave Calculation ----
@router.get("/sick-leave/calculate")
async def calculate_sick_leave(
    employee_id: int, start_date: str, end_date: str,
    db: AsyncSession = Depends(get_db)
):
    """Calculate sick leave pay per Uzbekistan labor code."""
    emp = (await db.execute(select(Employee).where(Employee.id == employee_id))).scalars().first()
    if not emp:
        raise HTTPException(404, "Сотрудник не найден")

    salary = emp.salary or 0
    avg_daily = round(salary / AVG_WORK_DAYS_COEFF, 2)

    sd = date.fromisoformat(start_date[:10])
    ed = date.fromisoformat(end_date[:10])
    calendar_days = max((ed - sd).days + 1, 1)
    work_days = _calc_work_days(start_date, end_date, "five_day")

    # Tenure coefficient per Uz labor code
    hire_date = emp.hire_date or date.today()
    tenure_years = (date.today() - hire_date).days / 365.25
    if tenure_years >= 8:
        coeff = 1.0  # 100%
    elif tenure_years >= 5:
        coeff = 0.8  # 80%
    else:
        coeff = 0.6  # 60%

    sick_pay_gross = round(avg_daily * work_days * coeff, 2)
    # First 10 days — employer pays, rest — social insurance fund (INPS)
    employer_days = min(work_days, 10)
    fund_days = max(work_days - 10, 0)
    employer_pay = round(avg_daily * employer_days * coeff, 2)
    fund_pay = round(avg_daily * fund_days * coeff, 2)

    ndfl = round(sick_pay_gross * NDFL_RATE, 2)
    inps = round(sick_pay_gross * INPS_RATE, 2)
    net_pay = round(sick_pay_gross - ndfl - inps, 2)

    return {
        "employee_id": employee_id,
        "employee_name": f"{emp.last_name} {emp.first_name}",
        "position": emp.position or "—",
        "salary": salary,
        "avg_daily_rate": avg_daily,
        "start_date": start_date, "end_date": end_date,
        "calendar_days": calendar_days, "work_days": work_days,
        "tenure_years": round(tenure_years, 1),
        "coefficient": coeff,
        "sick_pay_gross": sick_pay_gross,
        "employer_pays": employer_pay,
        "employer_days": employer_days,
        "fund_pays": fund_pay,
        "fund_days": fund_days,
        "ndfl": ndfl, "inps": inps,
        "net_pay": net_pay,
    }


# ---- Holidays ----
@router.get("/holidays")
async def get_holidays():
    return _holidays

# ---- Schedules ----
@router.get("/schedules")
async def get_schedules(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(WorkSchedule))
    schedules = result.scalars().all()
    return [{"id": s.id, "name": s.name, "schedule_type": s.schedule_type,
             "department_id": s.department_id, "department_name": s.department.name if s.department else None,
             "start_time": s.start_time, "end_time": s.end_time,
             "break_minutes": s.break_minutes, "is_active": s.is_active} for s in schedules]

@router.post("/schedules")
async def create_schedule(data: dict, db: AsyncSession = Depends(get_db)):
    schedule = WorkSchedule(
        name=data.get("name", ""),
        schedule_type=data.get("schedule_type", "five_day"),
        department_id=data.get("department_id"),
        start_time=data.get("start_time", "09:00"),
        end_time=data.get("end_time", "18:00"),
        break_minutes=data.get("break_minutes", 60),
    )
    db.add(schedule)
    await db.commit()
    await db.refresh(schedule)
    return {"id": schedule.id, "name": schedule.name}

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
async def get_staffing(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(StaffingPosition))
    positions = result.scalars().all()
    return [{"id": p.id, "position_name": p.position_name, "department_id": p.department_id,
             "department_name": p.department.name if p.department else None,
             "count": p.count, "occupied": p.occupied,
             "salary_min": p.salary_min, "salary_max": p.salary_max,
             "is_active": p.is_active} for p in positions]

@router.post("/staffing")
async def create_staffing(data: dict, db: AsyncSession = Depends(get_db)):
    position = StaffingPosition(
        position_name=data.get("position_name", data.get("name", "")),
        department_id=data.get("department_id"),
        count=data.get("count", 1),
        occupied=data.get("occupied", 0),
        salary_min=data.get("salary_min", 0),
        salary_max=data.get("salary_max", 0),
    )
    db.add(position)
    await db.commit()
    await db.refresh(position)
    return {"id": position.id, "position_name": position.position_name}

@router.get("/staffing/summary")
async def get_staffing_summary(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(StaffingPosition))
    positions = result.scalars().all()
    total = sum(p.count for p in positions)
    occupied = sum(p.occupied for p in positions)
    return {
        "total_positions": total,
        "occupied": occupied,
        "vacancies": total - occupied,
        "fill_rate": round(occupied / max(total, 1) * 100, 1),
        "by_department": {},
    }
