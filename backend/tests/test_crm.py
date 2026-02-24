import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_and_convert_lead(async_client: AsyncClient):
    # Setup - sign in as manager
    login_resp = await async_client.post(
        "/api/auth/login",
        json={"username": "manager", "password": "manager123"}
    )
    assert login_resp.status_code == 200
    crm_cookies = dict(login_resp.cookies)
    assert login_resp.status_code == 200

    # 1. Create a Lead
    lead_data = {
        "title": "Test Lead Conversion",
        "contact_name": "John Test",
        "phone": "+998900000000",
        "status": "new",
        "source": "website"
    }
    
    create_resp = await async_client.post("/api/crm/leads", json=lead_data, cookies=crm_cookies)
    assert create_resp.status_code == 200
    lead = create_resp.json()
    lead_id = lead["id"]
    assert lead["title"] == "Test Lead Conversion"

    # 2. Add an activity to the lead to test relations
    act_data = {
        "lead_id": lead_id,
        "type": "call",
        "description": "Initial call to discuss implementation details.",
        "due_date": "2026-03-01T10:00:00Z"
    }
    
    act_resp = await async_client.post(f"/api/crm/leads/{lead_id}/activities", json=act_data, cookies=crm_cookies)
    assert act_resp.status_code == 200
    
    # 3. Convert Lead to Deal
    convert_resp = await async_client.post(f"/api/crm/leads/{lead_id}/convert", cookies=crm_cookies)
    assert convert_resp.status_code == 200
    deal = convert_resp.json()
    
    assert deal["title"] == "Test Lead Conversion"
    assert deal["stage"] == "new"
    
    # 4. Attempt to fetch the lead again, it should have status="converted"
    fetch_resp = await async_client.get(f"/api/crm/leads/{lead_id}", cookies=crm_cookies)
    assert fetch_resp.status_code == 200
    assert fetch_resp.json()["status"] == "converted"
    
    # 5. Advance the deal stage
    deal_id = deal["id"]
    update_d_resp = await async_client.put(f"/api/crm/deals/{deal_id}", json={"stage": "proposal", "title": deal["title"]}, cookies=crm_cookies)
    assert update_d_resp.status_code == 200
    assert update_d_resp.json()["stage"] == "proposal"

@pytest.mark.asyncio
async def test_contact_validation(async_client: AsyncClient):
    login_resp = await async_client.post(
        "/api/auth/login",
        json={"username": "manager", "password": "manager123"}
    )
    assert login_resp.status_code == 200
    crm_cookies = dict(login_resp.cookies)
    
    # Try invalid email
    contact_data = {
        "first_name": "Invalid",
        "last_name": "Contact",
        "email": "not_an_email",
        "contact_type": "individual"
    }
    
    resp = await async_client.post("/api/crm/contacts", json=contact_data, cookies=crm_cookies)
    # The Pydantic model throws 422 for invalid email strings
    assert resp.status_code == 422
