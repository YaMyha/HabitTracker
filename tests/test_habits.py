import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_create_habit():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # авторизация (берём токен от предыдущего теста)
        login_resp = await client.post("/users/token", data={
            "username": "test@example.com",
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
