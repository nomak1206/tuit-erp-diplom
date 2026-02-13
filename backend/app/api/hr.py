from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone, date, timedelta

router = APIRouter(prefix="/api/hr", tags=["HR"])

# ============ CONSTANTS: Uzbekistan 2025/2026 =============
NDFL_RATE = 0.12        # НДФЛ — 12%
INPS_RATE = 0.01        # ИНПС — 1%  (от сотрудника)
ESN_RATE = 0.12         # ЕСН  — 12% (от работодателя)
MROT = 1155000          # Минимальная зарплата (сўм, с 01.01.2025)
AVG_WORK_DAYS_COEFF = 25.4  # Среднее кол-во рабочих дней в месяце для расчёта отпускных
MIN_VACATION_DAYS = 21  # Минимальный отпуск (календарных дней)

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

# ============ DEMO DATA ============
_departments = [
    {"id": 1, "name": "IT-отдел", "code": "IT", "head_id": 1, "parent_id": None, "description": "Разработка и поддержка"},
    {"id": 2, "name": "Отдел продаж", "code": "SALES", "head_id": 3, "parent_id": None, "description": "Работа с клиентами"},
    {"id": 3, "name": "Бухгалтерия", "code": "ACC", "head_id": 5, "parent_id": None, "description": "Финансовый учёт"},
    {"id": 4, "name": "HR-отдел", "code": "HR", "head_id": 7, "parent_id": None, "description": "Управление персоналом"},
    {"id": 5, "name": "Склад", "code": "WH", "head_id": 9, "parent_id": None, "description": "Складское хозяйство"},
]

_employees = [
    {"id": 1, "employee_number": "EMP-001", "first_name": "Алексей", "last_name": "Иванов", "middle_name": "Петрович", "email": "aleksey@erp.local", "phone": "+998901001001", "birth_date": "1990-05-15", "hire_date": "2023-01-10", "department_id": 1, "position": "Руководитель IT", "salary": 12000000, "schedule_type": "five_day", "status": "active", "created_at": "2023-01-10T09:00:00Z"},
    {"id": 2, "employee_number": "EMP-002", "first_name": "Мария", "last_name": "Петрова", "middle_name": "Сергеевна", "email": "maria@erp.local", "phone": "+998901002002", "birth_date": "1992-08-20", "hire_date": "2023-03-15", "department_id": 1, "position": "Разработчик", "salary": 9000000, "schedule_type": "five_day", "status": "active", "created_at": "2023-03-15T09:00:00Z"},
    {"id": 3, "employee_number": "EMP-003", "first_name": "Бобур", "last_name": "Ахмедов", "middle_name": "Рустамович", "email": "bobur@erp.local", "phone": "+998901003003", "birth_date": "1988-12-01", "hire_date": "2022-06-01", "department_id": 2, "position": "Руководитель продаж", "salary": 11000000, "schedule_type": "five_day", "status": "active", "created_at": "2022-06-01T09:00:00Z"},
    {"id": 4, "employee_number": "EMP-004", "first_name": "Гулнора", "last_name": "Маматова", "middle_name": "Баходировна", "email": "gulnora@erp.local", "phone": "+998901004004", "birth_date": "1995-03-22", "hire_date": "2024-01-15", "department_id": 2, "position": "Менеджер по продажам", "salary": 7500000, "schedule_type": "five_day", "status": "active", "created_at": "2024-01-15T09:00:00Z"},
    {"id": 5, "employee_number": "EMP-005", "first_name": "Татьяна", "last_name": "Козлова", "middle_name": "Андреевна", "email": "tatyana@erp.local", "phone": "+998901005005", "birth_date": "1985-07-10", "hire_date": "2021-09-01", "department_id": 3, "position": "Главный бухгалтер", "salary": 10000000, "schedule_type": "five_day", "status": "active", "created_at": "2021-09-01T09:00:00Z"},
    {"id": 6, "employee_number": "EMP-006", "first_name": "Отабек", "last_name": "Назаров", "middle_name": "Шухратович", "email": "otabek@erp.local", "phone": "+998901006006", "birth_date": "1993-11-08", "hire_date": "2024-03-01", "department_id": 3, "position": "Бухгалтер", "salary": 6500000, "schedule_type": "five_day", "status": "active", "created_at": "2024-03-01T09:00:00Z"},
    {"id": 7, "employee_number": "EMP-007", "first_name": "Динара", "last_name": "Юсупова", "middle_name": "Камиловна", "email": "dinara@erp.local", "phone": "+998901007007", "birth_date": "1991-04-18", "hire_date": "2023-07-01", "department_id": 4, "position": "HR-менеджер", "salary": 8000000, "schedule_type": "five_day", "status": "active", "created_at": "2023-07-01T09:00:00Z"},
    {"id": 8, "employee_number": "EMP-008", "first_name": "Дмитрий", "last_name": "Сидоров", "middle_name": "Игоревич", "email": "dmitriy.s@erp.local", "phone": "+998901008008", "birth_date": "1994-09-30", "hire_date": "2024-06-15", "department_id": 1, "position": "DevOps инженер", "salary": 10000000, "schedule_type": "five_day", "status": "active", "created_at": "2024-06-15T09:00:00Z"},
    {"id": 9, "employee_number": "EMP-009", "first_name": "Равшан", "last_name": "Турсунов", "middle_name": "Абдуллаевич", "email": "ravshan@erp.local", "phone": "+998901009009", "birth_date": "1987-02-14", "hire_date": "2022-01-10", "department_id": 5, "position": "Заведующий складом", "salary": 7000000, "schedule_type": "six_day", "status": "active", "created_at": "2022-01-10T09:00:00Z"},
    {"id": 10, "employee_number": "EMP-010", "first_name": "Анна", "last_name": "Волкова", "middle_name": "Дмитриевна", "email": "anna@erp.local", "phone": "+998901010010", "birth_date": "1996-06-25", "hire_date": "2025-01-01", "department_id": 2, "position": "Стажёр", "salary": 4000000, "schedule_type": "five_day", "status": "active", "created_at": "2025-01-01T09:00:00Z"},
]

_payroll = [
    {"id": 1, "employee_id": 1, "employee_name": "Иванов А.П.", "period": "2026-01", "period_start": "2026-01-01", "period_end": "2026-01-31", "worked_days": 22, "total_days": 22, "base_salary": 12000000, "allowances": 2000000, "gross": 14000000, "ndfl": 1680000, "inps": 140000, "deductions": 0, "net_salary": 12180000, "esn_employer": 1680000, "is_paid": True, "created_at": "2026-02-01T09:00:00Z"},
    {"id": 2, "employee_id": 2, "employee_name": "Петрова М.С.", "period": "2026-01", "period_start": "2026-01-01", "period_end": "2026-01-31", "worked_days": 22, "total_days": 22, "base_salary": 9000000, "allowances": 500000, "gross": 9500000, "ndfl": 1140000, "inps": 95000, "deductions": 0, "net_salary": 8265000, "esn_employer": 1140000, "is_paid": True, "created_at": "2026-02-01T09:00:00Z"},
    {"id": 3, "employee_id": 3, "employee_name": "Ахмедов Б.Р.", "period": "2026-01", "period_start": "2026-01-01", "period_end": "2026-01-31", "worked_days": 22, "total_days": 22, "base_salary": 11000000, "allowances": 3000000, "gross": 14000000, "ndfl": 1680000, "inps": 140000, "deductions": 0, "net_salary": 12180000, "esn_employer": 1680000, "is_paid": True, "created_at": "2026-02-01T09:00:00Z"},
    {"id": 4, "employee_id": 5, "employee_name": "Козлова Т.А.", "period": "2026-01", "period_start": "2026-01-01", "period_end": "2026-01-31", "worked_days": 20, "total_days": 22, "base_salary": 10000000, "allowances": 0, "gross": 9090909, "ndfl": 1090909, "inps": 90909, "deductions": 500000, "net_salary": 7409091, "esn_employer": 1090909, "is_paid": True, "created_at": "2026-02-01T09:00:00Z"},
]

_leaves = [
    {"id": 1, "employee_id": 4, "employee_name": "Маматова Г.Б.", "type": "vacation", "start_date": "2026-03-01", "end_date": "2026-03-21", "calendar_days": 21, "work_days": 15, "vacation_pay": 4446640, "status": "approved", "reason": "Ежегодный основной отпуск", "approved_by": 3, "created_at": "2026-02-10T09:00:00Z"},
    {"id": 2, "employee_id": 2, "employee_name": "Петрова М.С.", "type": "sick", "start_date": "2026-02-08", "end_date": "2026-02-10", "calendar_days": 3, "work_days": 2, "vacation_pay": 0, "status": "approved", "reason": "Больничный лист", "approved_by": 1, "created_at": "2026-02-08T09:00:00Z"},
    {"id": 3, "employee_id": 10, "employee_name": "Волкова А.Д.", "type": "personal", "start_date": "2026-02-15", "end_date": "2026-02-15", "calendar_days": 1, "work_days": 1, "vacation_pay": 0, "status": "pending", "reason": "Личные дела", "approved_by": None, "created_at": "2026-02-12T10:00:00Z"},
]

_schedules = [
    {"id": 1, "name": "Стандартная 5-дневка", "type": "five_day", "work_days": [0, 1, 2, 3, 4], "hours_per_day": 8, "hours_per_week": 40, "break_minutes": 60, "start_time": "09:00", "end_time": "18:00", "description": "Пн–Пт, 09:00–18:00, обед 1 час", "is_default": True},
    {"id": 2, "name": "6-дневная рабочая неделя", "type": "six_day", "work_days": [0, 1, 2, 3, 4, 5], "hours_per_day": 7, "hours_per_week": 36, "break_minutes": 60, "start_time": "08:00", "end_time": "16:00", "description": "Пн–Сб, 08:00–16:00 (субб. до 13:00)", "is_default": False},
    {"id": 3, "name": "Сменный график (2/2)", "type": "shift", "work_days": [], "hours_per_day": 12, "hours_per_week": 42, "break_minutes": 60, "start_time": "08:00", "end_time": "20:00", "description": "2 дня через 2, 12-часовая смена", "is_default": False},
    {"id": 4, "name": "Гибкий график (IT)", "type": "flexible", "work_days": [0, 1, 2, 3, 4], "hours_per_day": 8, "hours_per_week": 40, "break_minutes": 60, "start_time": "10:00", "end_time": "19:00", "description": "Пн–Пт, свободный вход 10:00–11:00", "is_default": False},
]

_timesheet = [
    {"id": 1, "employee_id": 1, "date": "2026-02-10", "hours": 8, "type": "work", "note": ""},
    {"id": 2, "employee_id": 1, "date": "2026-02-11", "hours": 9, "type": "overtime", "note": "Срочный релиз"},
    {"id": 3, "employee_id": 2, "date": "2026-02-10", "hours": 0, "type": "sick", "note": "Больничный"},
    {"id": 4, "employee_id": 3, "date": "2026-02-10", "hours": 8, "type": "work", "note": ""},
    {"id": 5, "employee_id": 4, "date": "2026-02-10", "hours": 8, "type": "work", "note": ""},
    {"id": 6, "employee_id": 5, "date": "2026-02-10", "hours": 8, "type": "work", "note": ""},
]


# ============ HELPERS ============
def _calc_work_days(start_str: str, end_str: str, schedule_type: str = "five_day") -> int:
    """Считает рабочие дни в периоде, исключая праздники РУз."""
    s = date.fromisoformat(start_str)
    e = date.fromisoformat(end_str)
    holiday_dates = {date.fromisoformat(h["date"]) for h in _holidays}
    count = 0
    d = s
    while d <= e:
        is_workday = False
        if schedule_type == "six_day":
            is_workday = d.weekday() < 6  # Пн-Сб
        else:
            is_workday = d.weekday() < 5  # Пн-Пт
        if is_workday and d not in holiday_dates:
            count += 1
        d += timedelta(days=1)
    return count


def _calc_payroll_for_employee(emp: dict, period_start: str, period_end: str,
                                allowances: int = 0, deductions: int = 0,
                                worked_days: int | None = None) -> dict:
    """Полный расчёт зарплаты по законодательству РУз"""
    total_days = _calc_work_days(period_start, period_end, emp.get("schedule_type", "five_day"))
    if worked_days is None:
        worked_days = total_days

    # Пропорционально отработанным дням
    base = emp["salary"]
    if worked_days < total_days:
        base = round(emp["salary"] / total_days * worked_days)

    gross = base + allowances - deductions
    ndfl = round(gross * NDFL_RATE)
    inps = round(gross * INPS_RATE)
    net = gross - ndfl - inps
    esn = round(gross * ESN_RATE)  # за счёт работодателя

    return {
        "employee_id": emp["id"],
        "employee_name": f"{emp['last_name']} {emp['first_name'][0]}.{emp['middle_name'][0]}.",
        "period_start": period_start,
        "period_end": period_end,
        "worked_days": worked_days,
        "total_days": total_days,
        "base_salary": base,
        "allowances": allowances,
        "gross": gross,
        "ndfl": ndfl,
        "inps": inps,
        "deductions": deductions,
        "net_salary": net,
        "esn_employer": esn,
    }


# ============ ENDPOINTS ============
@router.get("/departments")
async def get_departments():
    return _departments


@router.post("/departments")
async def create_department(data: dict):
    new_id = max(d["id"] for d in _departments) + 1 if _departments else 1
    dept = {"id": new_id, **data}
    _departments.append(dept)
    return dept


@router.get("/employees")
async def get_employees():
    return _employees


@router.get("/employees/{employee_id}")
async def get_employee(employee_id: int):
    for e in _employees:
        if e["id"] == employee_id:
            return e
    raise HTTPException(status_code=404, detail="Employee not found")


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
