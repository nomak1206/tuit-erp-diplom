from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
    get_current_user,
)
from app.schemas.schemas import LoginRequest, RegisterRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# In-memory demo users (replace with DB in production)
DEMO_USERS = {
    "admin": {
        "id": 1,
        "email": "admin@erp.local",
        "username": "admin",
        "hashed_password": hash_password("admin123"),
        "full_name": "Администратор Системы",
        "role": "admin",
        "avatar_url": None,
        "phone": "+998901234567",
        "position": "Системный администратор",
        "department": "IT",
        "is_active": True,
    },
    "manager": {
        "id": 2,
        "email": "manager@erp.local",
        "username": "manager",
        "hashed_password": hash_password("manager123"),
        "full_name": "Менеджер Продаж",
        "role": "manager",
        "avatar_url": None,
        "phone": "+998907654321",
        "position": "Руководитель отдела продаж",
        "department": "Продажи",
        "is_active": True,
    },
}

# Username-by-id index for fast lookup
_USERS_BY_ID = {str(u["id"]): u for u in DEMO_USERS.values()}


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    user = DEMO_USERS.get(data.username)
    if not user or not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token_data = {"sub": str(user["id"]), "username": user["username"], "role": user["role"], "full_name": user["full_name"]}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
    )


@router.post("/register", response_model=TokenResponse)
async def register(data: RegisterRequest):
    if data.username in DEMO_USERS:
        raise HTTPException(status_code=400, detail="Username already taken")

    new_id = len(DEMO_USERS) + 1
    new_user = {
        "id": new_id,
        "email": data.email,
        "username": data.username,
        "hashed_password": hash_password(data.password),
        "full_name": data.full_name,
        "role": data.role,
        "avatar_url": None,
        "phone": None,
        "position": None,
        "department": None,
        "is_active": True,
    }
    DEMO_USERS[data.username] = new_user
    _USERS_BY_ID[str(new_id)] = new_user

    token_data = {"sub": str(new_id), "username": data.username, "role": data.role, "full_name": data.full_name}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str):
    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    token_data = {"sub": payload["sub"], "username": payload["username"], "role": payload["role"], "full_name": payload["full_name"]}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Return current authenticated user based on JWT token."""
    user_id = current_user.get("sub")
    user = _USERS_BY_ID.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse(
        id=user["id"],
        email=user["email"],
        username=user["username"],
        full_name=user["full_name"],
        role=user["role"],
        avatar_url=user["avatar_url"],
        phone=user["phone"],
        position=user["position"],
        department=user["department"],
        is_active=user["is_active"],
    )
