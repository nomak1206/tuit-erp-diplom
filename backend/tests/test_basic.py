import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_docs_endpoint(async_client: AsyncClient):
    response = await async_client.get("/docs")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_metrics_endpoint(async_client: AsyncClient):
    response = await async_client.get("/metrics")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_unauthorized_access(async_client: AsyncClient):
    # Trying to access protected route without cookie/token
    response = await async_client.get("/api/auth/me")
    assert response.status_code in [401, 403]
