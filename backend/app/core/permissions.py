from functools import wraps
from fastapi import HTTPException, status


def require_role(*allowed_roles):
    """RBAC decorator — checks user role against allowed roles."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, current_user: dict = None, **kwargs):
            if current_user is None:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
            user_role = current_user.get("role", "")
            if user_role not in [r.value if hasattr(r, 'value') else r for r in allowed_roles]:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator
