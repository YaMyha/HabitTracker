import uvicorn
from fastapi import FastAPI
from app.routes import users, habits

app = FastAPI(title="Async Habit Tracker API")

app.include_router(users.router)
app.include_router(habits.router)

@app.get("/")
async def root():
    return {"message": "Habit Tracker API running!"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
