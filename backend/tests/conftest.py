import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"

from app.database import get_db, async_session

@pytest.fixture(scope="session")
async def async_client():
    # Override get_db to prevent InterfaceError from shared connections
    async def override_get_db():
        async with async_session() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()
                
    app.dependency_overrides[get_db] = override_get_db
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
        
    app.dependency_overrides.clear()
