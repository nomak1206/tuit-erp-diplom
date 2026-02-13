from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone

router = APIRouter(prefix="/api/projects", tags=["Projects"])

# ============ DEMO DATA ============
_projects = [
    {"id": 1, "name": "ERP для TechCorp", "code": "PRJ-001", "description": "Внедрение ERP-системы для TechCorp UZ", "status": "active", "start_date": "2026-01-15", "end_date": "2026-06-30", "budget": 15000000, "spent": 4500000, "progress": 35, "created_at": "2026-01-15T10:00:00Z"},
    {"id": 2, "name": "CRM BuildPro", "code": "PRJ-002", "description": "Разработка CRM для строительной компании", "status": "planning", "start_date": "2026-03-01", "end_date": "2026-09-30", "budget": 25000000, "spent": 0, "progress": 0, "created_at": "2026-02-01T14:00:00Z"},
    {"id": 3, "name": "Модуль аналитики", "code": "PRJ-003", "description": "Дашборд аналитики для MediaGroup", "status": "active", "start_date": "2026-02-01", "end_date": "2026-04-30", "budget": 12000000, "spent": 3000000, "progress": 55, "created_at": "2026-02-01T09:00:00Z"},
    {"id": 4, "name": "Мобильное приложение", "code": "PRJ-004", "description": "Мобильное приложение для управления складом", "status": "on_hold", "start_date": "2026-01-01", "end_date": "2026-05-31", "budget": 20000000, "spent": 8000000, "progress": 40, "created_at": "2026-01-01T10:00:00Z"},
    {"id": 5, "name": "Интеграция 1С", "code": "PRJ-005", "description": "Интеграция с 1С:Бухгалтерия", "status": "completed", "start_date": "2025-10-01", "end_date": "2026-01-31", "budget": 8000000, "spent": 7500000, "progress": 100, "created_at": "2025-10-01T10:00:00Z"},
]

_tasks = [
    {"id": 1, "title": "Дизайн базы данных", "description": "Проектирование ER-диаграммы", "project_id": 1, "status": "done", "priority": "high", "assigned_to": 1, "assigned_name": "Алексей Иванов", "due_date": "2026-01-25", "estimated_hours": 16, "actual_hours": 14, "sort_order": 1, "created_at": "2026-01-15T10:00:00Z"},
    {"id": 2, "title": "Backend API — CRM", "description": "Реализация REST API для CRM-модуля", "project_id": 1, "status": "done", "priority": "high", "assigned_to": 2, "assigned_name": "Мария Петрова", "due_date": "2026-02-10", "estimated_hours": 40, "actual_hours": 38, "sort_order": 2, "created_at": "2026-01-26T10:00:00Z"},
    {"id": 3, "title": "Frontend — Dashboard", "description": "Главный дашборд системы", "project_id": 1, "status": "in_progress", "priority": "high", "assigned_to": 8, "assigned_name": "Дмитрий Сидоров", "due_date": "2026-02-20", "estimated_hours": 24, "actual_hours": 12, "sort_order": 3, "created_at": "2026-02-01T10:00:00Z"},
    {"id": 4, "title": "Тестирование модулей", "description": "Unit и integration тесты", "project_id": 1, "status": "todo", "priority": "medium", "assigned_to": 2, "assigned_name": "Мария Петрова", "due_date": "2026-03-01", "estimated_hours": 32, "actual_hours": 0, "sort_order": 4, "created_at": "2026-02-05T10:00:00Z"},
    {"id": 5, "title": "Деплой на prod", "description": "Настройка CI/CD и деплой", "project_id": 1, "status": "todo", "priority": "medium", "assigned_to": 8, "assigned_name": "Дмитрий Сидоров", "due_date": "2026-03-15", "estimated_hours": 8, "actual_hours": 0, "sort_order": 5, "created_at": "2026-02-10T10:00:00Z"},
    {"id": 6, "title": "Прототип интерфейса", "description": "Figma макеты для аналитики", "project_id": 3, "status": "done", "priority": "high", "assigned_to": 8, "assigned_name": "Дмитрий Сидоров", "due_date": "2026-02-10", "estimated_hours": 12, "actual_hours": 10, "sort_order": 1, "created_at": "2026-02-01T10:00:00Z"},
    {"id": 7, "title": "Виджеты графиков", "description": "Recharts для аналитического дашборда", "project_id": 3, "status": "in_progress", "priority": "medium", "assigned_to": 2, "assigned_name": "Мария Петрова", "due_date": "2026-02-25", "estimated_hours": 20, "actual_hours": 8, "sort_order": 2, "created_at": "2026-02-05T10:00:00Z"},
    {"id": 8, "title": "Документация проекта", "description": "Техническая документация", "project_id": 1, "status": "review", "priority": "low", "assigned_to": 1, "assigned_name": "Алексей Иванов", "due_date": "2026-02-28", "estimated_hours": 8, "actual_hours": 6, "sort_order": 6, "created_at": "2026-02-08T10:00:00Z"},
]

_comments = [
    {"id": 1, "task_id": 3, "user_id": 8, "user_name": "Дмитрий Сидоров", "content": "Начал работу над дашбордом. Использую Recharts для графиков.", "created_at": "2026-02-02T10:00:00Z"},
    {"id": 2, "task_id": 3, "user_id": 1, "user_name": "Алексей Иванов", "content": "Добавь KPI карточки сверху.", "created_at": "2026-02-03T11:00:00Z"},
]


@router.get("/")
async def get_projects():
    return _projects


@router.get("/{project_id}")
async def get_project(project_id: int):
    for p in _projects:
        if p["id"] == project_id:
            return p
    raise HTTPException(status_code=404, detail="Project not found")


@router.post("/")
async def create_project(data: dict):
    new_id = max(p["id"] for p in _projects) + 1 if _projects else 1
    project = {"id": new_id, **data, "spent": 0, "progress": 0, "created_at": datetime.now(timezone.utc).isoformat()}
    _projects.append(project)
    return project


@router.patch("/{project_id}")
async def update_project(project_id: int, data: dict):
    for p in _projects:
        if p["id"] == project_id:
            p.update(data)
            return p
    raise HTTPException(status_code=404, detail="Project not found")


@router.delete("/{project_id}")
async def delete_project(project_id: int):
    global _projects, _tasks
    before = len(_projects)
    _projects = [p for p in _projects if p["id"] != project_id]
    if len(_projects) == before:
        raise HTTPException(status_code=404, detail="Project not found")
    # Cascade delete associated tasks
    _tasks = [t for t in _tasks if t["project_id"] != project_id]
    return {"detail": "Project deleted"}


@router.get("/tasks/all")
async def get_all_tasks(project_id: int = None):
    if project_id:
        return [t for t in _tasks if t["project_id"] == project_id]
    return _tasks


@router.get("/tasks/{task_id}")
async def get_task(task_id: int):
    for t in _tasks:
        if t["id"] == task_id:
            return t
    raise HTTPException(status_code=404, detail="Task not found")


@router.post("/tasks")
async def create_task(data: dict):
    new_id = max(t["id"] for t in _tasks) + 1 if _tasks else 1
    task = {"id": new_id, **data, "actual_hours": 0, "sort_order": new_id, "created_at": datetime.now(timezone.utc).isoformat()}
    _tasks.append(task)
    return task


@router.patch("/tasks/{task_id}")
async def update_task(task_id: int, data: dict):
    for t in _tasks:
        if t["id"] == task_id:
            t.update(data)
            return t
    raise HTTPException(status_code=404, detail="Task not found")


@router.delete("/tasks/{task_id}")
async def delete_task(task_id: int):
    global _tasks, _comments
    before = len(_tasks)
    _tasks = [t for t in _tasks if t["id"] != task_id]
    if len(_tasks) == before:
        raise HTTPException(status_code=404, detail="Task not found")
    # Cascade delete associated comments
    _comments = [c for c in _comments if c["task_id"] != task_id]
    return {"detail": "Task deleted"}


@router.get("/tasks/{task_id}/comments")
async def get_task_comments(task_id: int):
    return [c for c in _comments if c["task_id"] == task_id]


@router.post("/tasks/{task_id}/comments")
async def create_comment(task_id: int, data: dict):
    new_id = max(c["id"] for c in _comments) + 1 if _comments else 1
    comment = {"id": new_id, "task_id": task_id, **data, "created_at": datetime.now(timezone.utc).isoformat()}
    _comments.append(comment)
    return comment
