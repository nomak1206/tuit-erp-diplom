import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_payroll_calculation(async_client: AsyncClient):
    login_resp = await async_client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "admin123"}
    )
    assert login_resp.status_code == 200
    
    # Manually pass cookies
    hr_cookies = dict(login_resp.cookies)
    
    # Payload for calculation matches PayrollBase model expectation structure
    # Wait, the calculate endpoint expects PayrollCalculateRequest, let's check hr.py
    calc_data = {
        "period_start": "2026-03-01",
        "period_end": "2026-03-31",
    }
    
    resp = await async_client.post(
        "/api/hr/payroll/calculate-all", 
        json=calc_data,
        cookies=hr_cookies
    )
    if resp.status_code != 200:
        raise Exception(f"DEBUG OUTPUT PAYROLL: {resp.text}")
    assert resp.status_code == 200
    res = resp.json()
    
    assert "totals" in res
    assert "entries" in res

@pytest.mark.asyncio
async def test_vacation_creation(async_client: AsyncClient):
    login_resp = await async_client.post(
        "/api/auth/login",
        json={"username": "manager", "password": "manager123"}
    )
    assert login_resp.status_code == 200
    
    hr_cookies = dict(login_resp.cookies)
    
    # Try invalid dates end before start
    vac_data = {
        "employee_id": 1,
        "leave_type": "vacation",
        "start_date": "2026-05-10",
        "end_date": "2026-05-01",
        "reason": "Rest"
    }
    
    resp = await async_client.post(
        "/api/hr/leaves", 
        json=vac_data,
        cookies=hr_cookies
    )
    if resp.status_code != 400:
        raise Exception(f"DEBUG OUTPUT LEAVES: {resp.text}")
    # The API should reject end_date before start_date with 400
    assert resp.status_code == 400
