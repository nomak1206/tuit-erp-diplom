from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.project import Project, Task, TaskComment
from app.schemas.schemas import ProjectBase, ProjectResponse, TaskBase, TaskResponse

router = APIRouter(prefix="/api/projects", tags=["Projects"])


def _proj_dict(p: Project) -> dict:
    return {
        "id": p.id, "name": p.name, "code": p.code, "description": p.description,
        "status": p.status.value if p.status else "planning",
        "start_date": str(p.start_date) if p.start_date else None,
        "end_date": str(p.end_date) if p.end_date else None,
        "budget": p.budget, "spent": p.spent, "progress": p.progress,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }


def _task_dict(t: Task) -> dict:
    return {
        "id": t.id, "title": t.title, "description": t.description,
        "project_id": t.project_id,
        "status": t.status.value if t.status else "todo",
        "priority": t.priority.value if t.priority else "medium",
        "assigned_to": t.assigned_to, "assigned_name": t.assigned_name,
        "due_date": str(t.due_date) if t.due_date else None,
        "estimated_hours": t.estimated_hours, "actual_hours": t.actual_hours,
        "sort_order": t.sort_order,
        "created_at": t.created_at.isoformat() if t.created_at else None,
    }


# ============ PROJECTS ============
@router.get("/")
async def get_projects(db: AsyncSession = Depends(get_db), skip: int = 0, limit: int = 100):
    result = await db.execute(select(Project).offset(skip).limit(limit))
    return [_proj_dict(p) for p in result.scalars().all()]


@router.get("/{project_id}")
async def get_project(project_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    p = result.scalars().first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    return _proj_dict(p)


@router.post("/", response_model=ProjectResponse, status_code=201)
async def create_project(data: ProjectBase, db: AsyncSession = Depends(get_db)):
    project = Project(**data.model_dump(), spent=0, progress=0)
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return _proj_dict(project)


@router.patch("/{project_id}")
async def update_project(project_id: int, data: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    p = result.scalars().first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    allowed = {"name", "code", "description", "status", "start_date", "end_date", "budget", "spent", "progress"}
    for k, v in data.items():
        if k in allowed:
            setattr(p, k, v)
    await db.commit()
    await db.refresh(p)
    return _proj_dict(p)


@router.delete("/{project_id}")
async def delete_project(project_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    p = result.scalars().first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.delete(p)
    await db.commit()
    return {"detail": "Project deleted"}


# ============ TASKS ============
@router.get("/tasks/all")
async def get_all_tasks(project_id: int = None, db: AsyncSession = Depends(get_db), skip: int = 0, limit: int = 200):
    q = select(Task)
    if project_id:
        q = q.where(Task.project_id == project_id)
    result = await db.execute(q.offset(skip).limit(limit))
    return [_task_dict(t) for t in result.scalars().all()]


@router.get("/tasks/{task_id}")
async def get_task(task_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    t = result.scalars().first()
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    return _task_dict(t)


@router.post("/tasks", response_model=TaskResponse, status_code=201)
async def create_task(data: TaskBase, db: AsyncSession = Depends(get_db)):
    task = Task(**data.model_dump(), actual_hours=0, sort_order=0)
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return _task_dict(task)


@router.patch("/tasks/{task_id}")
async def update_task(task_id: int, data: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    t = result.scalars().first()
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    allowed = {"title", "description", "project_id", "status", "priority", "assigned_to", "assigned_name", "due_date", "estimated_hours", "actual_hours", "sort_order"}
    for k, v in data.items():
        if k in allowed:
            setattr(t, k, v)
    await db.commit()
    await db.refresh(t)
    return _task_dict(t)


@router.delete("/tasks/{task_id}")
async def delete_task(task_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    t = result.scalars().first()
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    await db.delete(t)
    await db.commit()
    return {"detail": "Task deleted"}


# ============ COMMENTS ============
@router.get("/tasks/{task_id}/comments")
async def get_task_comments(task_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TaskComment).where(TaskComment.task_id == task_id))
    return [{"id": c.id, "task_id": c.task_id, "user_id": c.user_id, "user_name": c.user_name, "content": c.content, "created_at": c.created_at.isoformat() if c.created_at else None} for c in result.scalars().all()]


@router.post("/tasks/{task_id}/comments")
async def create_comment(task_id: int, data: dict, db: AsyncSession = Depends(get_db)):
    comment = TaskComment(task_id=task_id, user_id=data.get("user_id"), user_name=data.get("user_name"), content=data.get("content", ""))
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return {"id": comment.id, "task_id": comment.task_id, "user_id": comment.user_id, "user_name": comment.user_name, "content": comment.content, "created_at": comment.created_at.isoformat() if comment.created_at else None}
