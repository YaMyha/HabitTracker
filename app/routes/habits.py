from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app import crud, schemas
from app.routes.users import get_current_user

router = APIRouter(prefix="/habits", tags=["Habits"])

@router.post("/", response_model=schemas.HabitOut)
async def create_habit(
    habit: schemas.HabitCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await crud.create_habit(db, current_user.id, habit)

@router.get("/", response_model=list[schemas.HabitOut])
async def get_habits(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await crud.get_habits(db, current_user.id)

@router.delete("/{habit_id}")
async def delete_habit(
    habit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    deleted = await crud.delete_habit(db, habit_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Habit not found")
    return {"ok": True}
