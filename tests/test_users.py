import asyncio
import random

import pytest
from httpx import AsyncClient
from httpx._transports.asgi import ASGITransport
from app.main import app

@pytest.mark.asyncio(loop_scope="session")
async def test_register_and_login():
    loop = asyncio.get_running_loop()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        email = "email" + str(random.randint(1, 1000))
        response = await client.post("/users/register", json={
            "email": email,
            "password": "password123"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == email

        # --- логин ---
        response = await client.post("/users/token", data={
            "username": email,
            "password": "password123"
        })
        assert response.status_code == 200
        token_data = response.json()
        assert "access_token" in token_data
        assert token_data["token_type"] == "bearer"
