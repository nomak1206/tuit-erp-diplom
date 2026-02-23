import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_auth_flow(async_client: AsyncClient):
    # Test User Login
    response = await async_client.post(
        "/api/auth/login",
        data={"username": "admin", "password": "admin123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 200
    
    # Check that cookies are set
    cookies = response.cookies
    assert "access_token" in cookies
    assert "refresh_token" in cookies
    
    # The login should have returned user data
    data = response.json()
    assert data["email"] == "admin@erp.local"
    assert data["role"] == "admin"
    
    # Check /api/auth/me using the cookies automatically forwarded by async_client
    me_resp = await async_client.get("/api/auth/me")
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["email"] == "admin@erp.local"

@pytest.mark.asyncio
async def test_auth_logout(async_client: AsyncClient):
    # First login to set cookie
    await async_client.post(
        "/api/auth/login",
        data={"username": "admin", "password": "admin123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    # Test logout clears cookies
    logout_resp = await async_client.post("/api/auth/logout")
    assert logout_resp.status_code == 200
    assert logout_resp.json()["message"] == "Logged out successfully"
    
    # Verify we can no longer access /me
    me_resp = await async_client.get("/api/auth/me")
    assert me_resp.status_code == 401
