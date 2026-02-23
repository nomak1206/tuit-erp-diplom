from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List, Any
from app.database import get_db
from app.core.security import get_current_user
from app.models.notification import Notification

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/", response_model=List[Any])
async def get_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all notifications for current user"""
    result = await db.scalars(
        select(Notification)
        .where(Notification.user_id == int(current_user["sub"]))
        .order_by(Notification.created_at.desc())
    )
    notifications = result.all()
    
    return [
        {
            "id": n.id,
            "type": n.type,
            "title": n.title,
            "description": n.description,
            "module": n.module,
            "link": n.link,
            "is_read": n.is_read,
            "created_at": n.created_at
        }
        for n in notifications
    ]

@router.put("/{notification_id}/read")
async def mark_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Mark a single notification as read"""
    notif = await db.get(Notification, notification_id)
    if not notif or notif.user_id != int(current_user["sub"]):
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notif.is_read = True
    await db.commit()
    return {"success": True}

@router.put("/read-all")
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Mark all notifications as read for current user"""
    await db.execute(
        update(Notification)
        .where(Notification.user_id == int(current_user["sub"]))
        .values(is_read=True)
    )
    await db.commit()
    return {"success": True}
