import asyncio
import random

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio(loop_scope="session")
async def test_create_habit():
    loop = asyncio.get_running_loop()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        email = "email" + str(random.randint(1, 1000))
        response = await client.post("/users/register", json={
            "email": email,
            "password": "password123"
        })
        # авторизация (берём токен от предыдущего теста)
        login_resp = await client.post("/users/token", data={
            "username": email,
            "password": "password123"
        })
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # создаём привычку
        response = await client.post("/habits/", json={
            "title": "Test habit",
            "description": "Test description"
        }, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Test habit"
