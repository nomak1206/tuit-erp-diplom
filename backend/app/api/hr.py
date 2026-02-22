from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone, date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.hr import Employee, Department

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
    {"date": "2026-01-01", "name": "Новый год"},
    {"date": "2026-03-08", "name": "Международный женский день"},
    {"date": "2026-03-21", "name": "Навруз"},
    {"date": "2026-05-09", "name": "День памяти и почестей"},
    {"date": "2026-09-01", "name": "День независимости"},
    {"date": "2026-10-01", "name": "День учителя"},
    {"date": "2026-12-08", "name": "День Конституции"},
    # Религиозные праздники (плавающие)
    {"date": "2026-03-31", "name": "Рамазан Хайит"},
    {"date": "2026-06-07", "name": "Курбан Хайит"},
]

# ============ ENDPOINTS ============
@router.get("/departments")
async def get_departments(db: AsyncSession = Depends(get_db), skip: int = 0, limit: int = 100):
    result = await db.execute(select(Department).offset(skip).limit(limit))
    departments = result.scalars().all()
    return [{"id": d.id, "name": d.name, "code": d.code, "description": d.description} for d in departments]

@router.get("/employees")
async def get_employees(db: AsyncSession = Depends(get_db), skip: int = 0, limit: int = 100):
    result = await db.execute(select(Employee).options(selectinload(Employee.department)).offset(skip).limit(limit))
    emps = result.scalars().all()
    
    # Format to match frontend expectations
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
async def create_employee(data: dict):
    new_id = max(e["id"] for e in _employees) + 1 if _employees else 1
    emp = {"id": new_id, **data, "status": "active", "created_at": datetime.now(timezone.utc).isoformat()}
    _employees.append(emp)
    return emp


@router.patch("/employees/{employee_id}")
async def update_employee(employee_id: int, data: dict):
    for e in _employees:
        if e["id"] == employee_id:
            e.update(data)
            return e
    raise HTTPException(status_code=404, detail="Employee not found")


@router.delete("/employees/{employee_id}")
async def delete_employee(employee_id: int):
    global _employees, _payroll, _leaves
    before = len(_employees)
    _employees = [e for e in _employees if e["id"] != employee_id]
    if len(_employees) == before:
        raise HTTPException(status_code=404, detail="Employee not found")
    _payroll = [p for p in _payroll if p["employee_id"] != employee_id]
    _leaves = [l for l in _leaves if l["employee_id"] != employee_id]
    return {"detail": "Employee deleted"}


# ---- Payroll ----
@router.get("/payroll")
async def get_payroll():
    return _payroll


@router.post("/payroll/calculate")
async def calculate_payroll(data: dict):
    """Calculate payroll for a single employee — UZ-compliant"""
    employee_id = data.get("employee_id")
    emp = next((e for e in _employees if e["id"] == employee_id), None)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    result = _calc_payroll_for_employee(
        emp,
        data.get("period_start", ""),
        data.get("period_end", ""),
        data.get("allowances", 0),
        data.get("deductions", 0),
        data.get("worked_days"),
    )

    period = data.get("period_start", "")[:7]  # "2026-02"
    new_id = max(p["id"] for p in _payroll) + 1 if _payroll else 1
    entry = {
        "id": new_id,
        "period": period,
        **result,
        "is_paid": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _payroll.append(entry)
    return entry


@router.post("/payroll/calculate-all")
async def calculate_payroll_all(data: dict):
    """Mass payroll — calculate for ALL active employees in a period"""
    period_start = data.get("period_start", "")
    period_end = data.get("period_end", "")
    if not period_start or not period_end:
        raise HTTPException(status_code=400, detail="period_start and period_end required")

    results = []
    period = period_start[:7]
    for emp in _employees:
        if emp["status"] != "active":
            continue
        result = _calc_payroll_for_employee(emp, period_start, period_end)
        new_id = max(p["id"] for p in _payroll) + 1 if _payroll else 1
        entry = {
            "id": new_id,
            "period": period,
            **result,
            "is_paid": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        _payroll.append(entry)
        results.append(entry)

    return {"count": len(results), "entries": results,
            "totals": {
                "gross": sum(r["gross"] for r in results),
                "ndfl": sum(r["ndfl"] for r in results),
                "inps": sum(r["inps"] for r in results),
                "net": sum(r["net_salary"] for r in results),
                "esn": sum(r["esn_employer"] for r in results),
            }}


# ---- Leaves / Vacations ----
@router.get("/leaves")
async def get_leaves():
    return _leaves


@router.post("/leaves")
async def create_leave(data: dict):
    new_id = max(l["id"] for l in _leaves) + 1 if _leaves else 1
    employee_id = data.get("employee_id")
    emp = next((e for e in _employees if e["id"] == employee_id), None)
    emp_name = f"{emp['last_name']} {emp['first_name'][0]}.{emp['middle_name'][0]}." if emp else "—"

    start = data.get("start_date", "")
    end = data.get("end_date", "")
    cal_days = (date.fromisoformat(end) - date.fromisoformat(start)).days + 1 if start and end else 0
    work_days = _calc_work_days(start, end) if start and end else 0

    leave = {
        "id": new_id,
        "employee_id": employee_id,
        "employee_name": emp_name,
        "type": data.get("type", "vacation"),
        "start_date": start,
        "end_date": end,
        "calendar_days": cal_days,
        "work_days": work_days,
        "vacation_pay": 0,
        "status": "pending",
        "reason": data.get("reason", ""),
        "approved_by": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _leaves.append(leave)
    return leave


@router.get("/vacation/calculate")
async def calculate_vacation(employee_id: int, start_date: str, end_date: str):
    """Расчёт отпускных по ТК Узбекистана.
    Формула: Среднемесячная ЗП / 25.4 × рабочие дни в отпуске
    """
    emp = next((e for e in _employees if e["id"] == employee_id), None)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    s = date.fromisoformat(start_date)
    e = date.fromisoformat(end_date)
    calendar_days = (e - s).days + 1
    work_days = _calc_work_days(start_date, end_date, emp.get("schedule_type", "five_day"))

    # Средняя ЗП = salary (берём как среднемесячную для демо-версии)
    avg_salary = emp["salary"]
    daily_rate = round(avg_salary / AVG_WORK_DAYS_COEFF)
    vacation_pay = daily_rate * work_days

    # Удержания с отпускных
    ndfl = round(vacation_pay * NDFL_RATE)
    inps = round(vacation_pay * INPS_RATE)
    net_vacation = vacation_pay - ndfl - inps

    # Остаток дней отпуска (21 - уже использовано)
    used_vacation = sum(
        l["calendar_days"] for l in _leaves
        if l["employee_id"] == employee_id and l["type"] == "vacation" and l["status"] == "approved"
    )

    return {
        "employee_id": employee_id,
        "employee_name": f"{emp['last_name']} {emp['first_name']} {emp['middle_name']}",
        "position": emp["position"],
        "avg_salary": avg_salary,
        "daily_rate": daily_rate,
        "start_date": start_date,
        "end_date": end_date,
        "calendar_days": calendar_days,
        "work_days": work_days,
        "vacation_pay_gross": vacation_pay,
        "ndfl": ndfl,
        "inps": inps,
        "vacation_pay_net": net_vacation,
        "min_vacation_days": MIN_VACATION_DAYS,
        "used_days": used_vacation,
        "remaining_days": max(0, MIN_VACATION_DAYS - used_vacation),
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
    new_id = max(s["id"] for s in _schedules) + 1 if _schedules else 1
    schedule = {"id": new_id, **data}
    _schedules.append(schedule)
    return schedule


# ---- Timesheet ----
@router.get("/timesheet")
async def get_timesheet():
    return _timesheet


@router.post("/timesheet")
async def create_timesheet_entry(data: dict):
    new_id = max(t["id"] for t in _timesheet) + 1 if _timesheet else 1
    entry = {"id": new_id, **data}
    _timesheet.append(entry)
    return entry


# ---- Stats ----
@router.get("/stats")
async def get_hr_stats():
    active = sum(1 for e in _employees if e["status"] == "active")
    total_salary = sum(e["salary"] for e in _employees if e["status"] == "active")
    dept_counts = {}
    for e in _employees:
        d_id = e.get("department_id")
        dept_counts[d_id] = dept_counts.get(d_id, 0) + 1

    return {
        "total_employees": len(_employees),
        "active_employees": active,
        "departments_count": len(_departments),
        "total_salary_fund": total_salary,
        "average_salary": round(total_salary / max(active, 1)),
        "pending_leaves": sum(1 for l in _leaves if l["status"] == "pending"),
        "department_distribution": dept_counts,
        "mrot": MROT,
        "ndfl_rate": NDFL_RATE,
        "inps_rate": INPS_RATE,
        "esn_rate": ESN_RATE,
    }


# ---- Staffing Table (Штатное расписание) ----
@router.get("/staffing")
async def get_staffing():
    return _staffing_positions


@router.post("/staffing")
async def create_staffing(data: dict):
    new_id = max(s["id"] for s in _staffing_positions) + 1 if _staffing_positions else 1
    pos = {"id": new_id, **data}
    _staffing_positions.append(pos)
    return pos


@router.patch("/staffing/{pos_id}")
async def update_staffing(pos_id: int, data: dict):
    for p in _staffing_positions:
        if p["id"] == pos_id:
            p.update(data)
            return p
    raise HTTPException(status_code=404, detail="Position not found")


@router.delete("/staffing/{pos_id}")
async def delete_staffing(pos_id: int):
    global _staffing_positions
    before = len(_staffing_positions)
    _staffing_positions = [s for s in _staffing_positions if s["id"] != pos_id]
    if len(_staffing_positions) == before:
        raise HTTPException(status_code=404, detail="Position not found")
    return {"detail": "Position deleted"}


@router.get("/staffing/summary")
async def get_staffing_summary():
    total_positions = sum(s["count"] for s in _staffing_positions)
    occupied = sum(s["occupied"] for s in _staffing_positions)
    vacancies = total_positions - occupied
    by_dept = {}
    for s in _staffing_positions:
        d_id = s["department_id"]
        dept = next((d for d in _departments if d["id"] == d_id), {})
        dept_name = dept.get("name", f"Отдел {d_id}")
        if dept_name not in by_dept:
            by_dept[dept_name] = {"total": 0, "occupied": 0, "vacancies": 0, "salary_fund_min": 0, "salary_fund_max": 0}
        by_dept[dept_name]["total"] += s["count"]
        by_dept[dept_name]["occupied"] += s["occupied"]
        by_dept[dept_name]["vacancies"] += s["count"] - s["occupied"]
        by_dept[dept_name]["salary_fund_min"] += s["salary_min"] * s["count"]
        by_dept[dept_name]["salary_fund_max"] += s["salary_max"] * s["count"]
    return {
        "total_positions": total_positions,
        "occupied": occupied,
        "vacancies": vacancies,
        "fill_rate": round(occupied / max(total_positions, 1) * 100, 1),
        "by_department": by_dept,
    }

