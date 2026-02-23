import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_warehouse_movements(async_client: AsyncClient):
    login_resp = await async_client.post(
        "/api/auth/login",
        json={"username": "manager", "password": "manager123"}
    )
    assert login_resp.status_code == 200
    
    finance_cookies = dict(login_resp.cookies)
    
    # Missing fields - should trigger 422 because product_id, warehouse_id, quantity, date are missing
    movement_data = {
        "type": "in",
    }
    
    resp = await async_client.post(
        "/api/warehouse/movements", 
        json=movement_data,
        cookies=finance_cookies
    )
    # Fastapi Pydantic requires items array
    assert resp.status_code in [400, 422]

@pytest.mark.asyncio
async def test_accounting_invoice_validation(async_client: AsyncClient):
    login_resp = await async_client.post(
        "/api/auth/login",
        json={"username": "manager", "password": "manager123"}
    )
    assert login_resp.status_code == 200
    
    invoice_data = {
        "number": "INV-TEST-001",
        "contact_name": "Test Client",
        "date": "2026-03-01",
        "due_date": "2026-03-15",
        "status": "draft",
        "subtotal": -100, # Invalid amount/logic or missing fields might trigger 422
        "tax": 0,
        "total": -100
    }
    
    resp = await async_client.post(
        "/api/accounting/invoices", 
        json=invoice_data,
        cookies=finance_cookies
    )
    assert resp.status_code == 422
