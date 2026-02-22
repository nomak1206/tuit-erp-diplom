import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_check(async_client: AsyncClient):
    # This assumes there is a health check, metrics, or docs endpoint.
    # We will test the metrics endpoint since we know it exists from the logs.
    response = await async_client.get("/metrics")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_docs_endpoint(async_client: AsyncClient):
    response = await async_client.get("/docs")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_unauthorized_access(async_client: AsyncClient):
    # Trying to access a protected route without a token
    response = await async_client.get("/api/auth/me")
    assert response.status_code in [401, 403]
