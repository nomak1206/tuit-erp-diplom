from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone

router = APIRouter(prefix="/api/hr", tags=["HR"])

# ============ DEMO DATA ============
_departments = [
    {"id": 1, "name": "IT-отдел", "code": "IT", "head_id": 1, "parent_id": None, "description": "Разработка и поддержка"},
    {"id": 2, "name": "Отдел продаж", "code": "SALES", "head_id": 3, "parent_id": None, "description": "Работа с клиентами"},
    {"id": 3, "name": "Бухгалтерия", "code": "ACC", "head_id": 5, "parent_id": None, "description": "Финансовый учёт"},
    {"id": 4, "name": "HR-отдел", "code": "HR", "head_id": 7, "parent_id": None, "description": "Управление персоналом"},
    {"id": 5, "name": "Склад", "code": "WH", "head_id": 9, "parent_id": None, "description": "Складское хозяйство"},
]

_employees = [
    {"id": 1, "employee_number": "EMP-001", "first_name": "Алексей", "last_name": "Иванов", "middle_name": "Петрович", "email": "aleksey@erp.local", "phone": "+998901001001", "birth_date": "1990-05-15", "hire_date": "2023-01-10", "department_id": 1, "position": "Руководитель IT", "salary": 12000000, "status": "active", "created_at": "2023-01-10T09:00:00Z"},
    {"id": 2, "employee_number": "EMP-002", "first_name": "Мария", "last_name": "Петрова", "middle_name": "Сергеевна", "email": "maria@erp.local", "phone": "+998901002002", "birth_date": "1992-08-20", "hire_date": "2023-03-15", "department_id": 1, "position": "Разработчик", "salary": 9000000, "status": "active", "created_at": "2023-03-15T09:00:00Z"},
    {"id": 3, "employee_number": "EMP-003", "first_name": "Бобур", "last_name": "Ахмедов", "middle_name": "Рустамович", "email": "bobur@erp.local", "phone": "+998901003003", "birth_date": "1988-12-01", "hire_date": "2022-06-01", "department_id": 2, "position": "Руководитель продаж", "salary": 11000000, "status": "active", "created_at": "2022-06-01T09:00:00Z"},
    {"id": 4, "employee_number": "EMP-004", "first_name": "Гулнора", "last_name": "Маматова", "middle_name": "Баходировна", "email": "gulnora@erp.local", "phone": "+998901004004", "birth_date": "1995-03-22", "hire_date": "2024-01-15", "department_id": 2, "position": "Менеджер по продажам", "salary": 7500000, "status": "active", "created_at": "2024-01-15T09:00:00Z"},
    {"id": 5, "employee_number": "EMP-005", "first_name": "Татьяна", "last_name": "Козлова", "middle_name": "Андреевна", "email": "tatyana@erp.local", "phone": "+998901005005", "birth_date": "1985-07-10", "hire_date": "2021-09-01", "department_id": 3, "position": "Главный бухгалтер", "salary": 10000000, "status": "active", "created_at": "2021-09-01T09:00:00Z"},
    {"id": 6, "employee_number": "EMP-006", "first_name": "Отабек", "last_name": "Назаров", "middle_name": "Шухратович", "email": "otabek@erp.local", "phone": "+998901006006", "birth_date": "1993-11-08", "hire_date": "2024-03-01", "department_id": 3, "position": "Бухгалтер", "salary": 6500000, "status": "active", "created_at": "2024-03-01T09:00:00Z"},
    {"id": 7, "employee_number": "EMP-007", "first_name": "Динара", "last_name": "Юсупова", "middle_name": "Камиловна", "email": "dinara@erp.local", "phone": "+998901007007", "birth_date": "1991-04-18", "hire_date": "2023-07-01", "department_id": 4, "position": "HR-менеджер", "salary": 8000000, "status": "active", "created_at": "2023-07-01T09:00:00Z"},
    {"id": 8, "employee_number": "EMP-008", "first_name": "Дмитрий", "last_name": "Сидоров", "middle_name": "Игоревич", "email": "dmitriy.s@erp.local", "phone": "+998901008008", "birth_date": "1994-09-30", "hire_date": "2024-06-15", "department_id": 1, "position": "DevOps инженер", "salary": 10000000, "status": "active", "created_at": "2024-06-15T09:00:00Z"},
    {"id": 9, "employee_number": "EMP-009", "first_name": "Равшан", "last_name": "Турсунов", "middle_name": "Абдуллаевич", "email": "ravshan@erp.local", "phone": "+998901009009", "birth_date": "1987-02-14", "hire_date": "2022-01-10", "department_id": 5, "position": "Заведующий складом", "salary": 7000000, "status": "active", "created_at": "2022-01-10T09:00:00Z"},
    {"id": 10, "employee_number": "EMP-010", "first_name": "Анна", "last_name": "Волкова", "middle_name": "Дмитриевна", "email": "anna@erp.local", "phone": "+998901010010", "birth_date": "1996-06-25", "hire_date": "2025-01-01", "department_id": 2, "position": "Стажёр", "salary": 4000000, "status": "active", "created_at": "2025-01-01T09:00:00Z"},
]

_payroll = [
    {"id": 1, "employee_id": 1, "period_start": "2026-01-01", "period_end": "2026-01-31", "base_salary": 12000000, "bonuses": 2000000, "deductions": 0, "tax": 1680000, "net_salary": 12320000, "is_paid": True, "created_at": "2026-02-01T09:00:00Z"},
    {"id": 2, "employee_id": 2, "period_start": "2026-01-01", "period_end": "2026-01-31", "base_salary": 9000000, "bonuses": 500000, "deductions": 0, "tax": 1140000, "net_salary": 8360000, "is_paid": True, "created_at": "2026-02-01T09:00:00Z"},
    {"id": 3, "employee_id": 3, "period_start": "2026-01-01", "period_end": "2026-01-31", "base_salary": 11000000, "bonuses": 3000000, "deductions": 0, "tax": 1680000, "net_salary": 12320000, "is_paid": True, "created_at": "2026-02-01T09:00:00Z"},
    {"id": 4, "employee_id": 5, "period_start": "2026-01-01", "period_end": "2026-01-31", "base_salary": 10000000, "bonuses": 0, "deductions": 500000, "tax": 1140000, "net_salary": 8360000, "is_paid": True, "created_at": "2026-02-01T09:00:00Z"},
]

_leaves = [
    {"id": 1, "employee_id": 4, "type": "vacation", "start_date": "2026-03-01", "end_date": "2026-03-14", "days_count": 14, "status": "approved", "reason": "Ежегодный отпуск", "approved_by": 3, "created_at": "2026-02-10T09:00:00Z"},
    {"id": 2, "employee_id": 2, "type": "sick", "start_date": "2026-02-08", "end_date": "2026-02-10", "days_count": 3, "status": "approved", "reason": "Больничный лист", "approved_by": 1, "created_at": "2026-02-08T09:00:00Z"},
    {"id": 3, "employee_id": 10, "type": "personal", "start_date": "2026-02-15", "end_date": "2026-02-15", "days_count": 1, "status": "pending", "reason": "Личные дела", "approved_by": None, "created_at": "2026-02-12T10:00:00Z"},
]


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


@router.get("/payroll")
async def get_payroll():
    return _payroll


@router.post("/payroll/calculate")
async def calculate_payroll(data: dict):
    """Calculate payroll for an employee — demo version"""
    employee_id = data.get("employee_id")
    emp = next((e for e in _employees if e["id"] == employee_id), None)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    base = emp["salary"]
    bonuses = data.get("bonuses", 0)
    deductions = data.get("deductions", 0)
    tax_rate = 0.12  # НДФЛ 12%
    tax = (base + bonuses - deductions) * tax_rate
    net = base + bonuses - deductions - tax

    new_id = max(p["id"] for p in _payroll) + 1 if _payroll else 1
    entry = {
        "id": new_id,
        "employee_id": employee_id,
        "period_start": data.get("period_start", ""),
        "period_end": data.get("period_end", ""),
        "base_salary": base,
        "bonuses": bonuses,
        "deductions": deductions,
        "tax": round(tax),
        "net_salary": round(net),
        "is_paid": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _payroll.append(entry)
    return entry


@router.get("/leaves")
async def get_leaves():
    return _leaves


@router.post("/leaves")
async def create_leave(data: dict):
    new_id = max(l["id"] for l in _leaves) + 1 if _leaves else 1
    leave = {"id": new_id, **data, "status": "pending", "approved_by": None, "created_at": datetime.now(timezone.utc).isoformat()}
    _leaves.append(leave)
    return leave


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
    }
