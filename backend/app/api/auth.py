from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User, UserRole, AuditLog
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
    get_current_user,
)
from app.schemas.schemas import LoginRequest, RegisterRequest, UserResponse, UpdateProfileRequest

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def _user_to_response(u: User) -> UserResponse:
    return UserResponse(
        id=u.id,
        email=u.email,
        username=u.username,
        full_name=u.full_name,
        role=u.role.value if hasattr(u.role, 'value') else str(u.role),
        avatar_url=u.avatar_url,
        phone=u.phone,
        position=u.position,
        department=u.department,
        is_active=u.is_active,
    )


async def _get_user_by_username(db: AsyncSession, username: str) -> User | None:
    result = await db.execute(select(User).where(User.username == username))
    return result.scalars().first()


async def _get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()


# ---------- Seed default admin on startup ----------
async def ensure_default_users(db: AsyncSession):
    """Create default admin/manager accounts if they do not exist."""
    result = await db.execute(select(User).where(User.username.in_(["admin", "manager"])))
    existing_users = {u.username for u in result.scalars().all()}
    
    defaults = [
        User(
            email="admin@erp.local",
            username="admin",
            hashed_password=hash_password("admin123"),
            full_name="Администратор Системы",
            role=UserRole.ADMIN,
            phone="+998901234567",
            position="Системный администратор",
            department="IT",
            is_active=True,
            is_superuser=True,
        ),
        User(
            email="manager@erp.local",
            username="manager",
            hashed_password=hash_password("manager123"),
            full_name="Менеджер Продаж",
            role=UserRole.MANAGER,
            phone="+998907654321",
            position="Руководитель отдела продаж",
            department="Продажи",
            is_active=True,
        ),
    ]

    for u in defaults:
        if u.username not in existing_users:
            db.add(u)
    await db.commit()


# ============ LOGIN ============
@router.post("/login")
async def login(data: LoginRequest, request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    await ensure_default_users(db)

    user = await _get_user_by_username(db, data.username)
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный логин или пароль")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Учётная запись отключена")

    # Update last_login
    user.last_login = datetime.now(timezone.utc)

    # Audit log
    log = AuditLog(
        user_id=user.id,
        user_name=user.username,
        action="login",
        entity_type="user",
        entity_id=user.id,
        details=f"Login from {request.client.host if request.client else 'unknown'}",
    )
    db.add(log)
    await db.commit()
    await db.refresh(user)

    token_data = {
        "sub": str(user.id),
        "username": user.username,
        "role": user.role.value if hasattr(user.role, 'value') else str(user.role),
        "full_name": user.full_name,
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False, # Set to True in production with HTTPS
        samesite="lax",
        max_age=30 * 60 # 30 mins
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=7 * 24 * 60 * 60 # 7 days
    )
    
    return {
        "message": "Login successful",
        "user": _user_to_response(user),
        "email": user.email # Add email at root level for test compatibility
    }


# ============ REGISTER ============
@router.post("/register", response_model=UserResponse, status_code=201)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check uniqueness
    existing = await _get_user_by_username(db, data.username)
    if existing:
        raise HTTPException(status_code=400, detail="Имя пользователя уже занято")
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email уже используется")

    # Security: always assign EMPLOYEE role on registration.
    # Role changes should only be done by admins via a separate endpoint.
    role = UserRole.EMPLOYEE

    user = User(
        email=data.email,
        username=data.username,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        role=role,
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return _user_to_response(user)


# ============ REFRESH TOKEN ============
@router.post("/refresh")
async def refresh_token(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Отсутствует refresh token в куки")
        
    payload = decode_token(token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Недействительный refresh token")

    user_id = int(payload["sub"])
    user = await _get_user_by_id(db, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Пользователь не найден или отключён")

    token_data = {
        "sub": str(user_id),
        "username": user.username,
        "role": user.role.value if hasattr(user.role, 'value') else str(user.role),
        "full_name": user.full_name,
    }
    
    access_token = create_access_token(token_data)
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=30 * 60
    )
    
    return {"message": "Token refreshed"}

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}


# ============ GET PROFILE ============
@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    user_id = int(current_user["sub"])
    user = await _get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return _user_to_response(user)


# ============ UPDATE PROFILE ============
@router.patch("/me", response_model=UserResponse)
async def update_me(
    data: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = int(current_user["sub"])
    user = await _get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    if data.full_name is not None:
        user.full_name = data.full_name
    if data.email is not None:
        # Check email uniqueness
        r = await db.execute(select(User).where(User.email == data.email, User.id != user_id))
        if r.scalars().first():
            raise HTTPException(status_code=400, detail="Email уже используется другим пользователем")
        user.email = data.email
    if data.phone is not None:
        user.phone = data.phone
    if data.position is not None:
        user.position = data.position
    if data.department is not None:
        user.department = data.department
    if data.avatar_url is not None:
        user.avatar_url = data.avatar_url

    await db.commit()
    await db.refresh(user)
    return _user_to_response(user)


# ============ LIST USERS (admin only) ============
@router.get("/users", response_model=list[UserResponse])
async def list_users(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
):
    if current_user.get("role") not in ("admin", "director"):
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    result = await db.execute(select(User).offset(skip).limit(limit))
    users = result.scalars().all()
    return [_user_to_response(u) for u in users]
