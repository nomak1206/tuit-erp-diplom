from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from app.database import get_db
from app.core.security import get_current_user


async def get_session(db: AsyncSession = Depends(get_db)):
    return db


async def get_authenticated_user(user: dict = Depends(get_current_user)):
    return user
