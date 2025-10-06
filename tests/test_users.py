import pytest
from httpx import AsyncClient
from httpx._transports.asgi import ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_register_and_login():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/users/register", json={
            "email": "test@example.com",
            "password": "password123"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"

        # --- логин ---
        response = await client.post("/users/token", data={
            "username": "test@example.com",
            "password": "password123"
        })
        assert response.status_code == 200
        token_data = response.json()
        assert "access_token" in token_data
        assert token_data["token_type"] == "bearer"
