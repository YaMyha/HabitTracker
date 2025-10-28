from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app import crud, schemas
from app.routes.users import get_current_user

router = APIRouter(prefix="/records", tags=["Records"])

@router.post("/", response_model=schemas.RecordOut)
async def create_record(
    record: schemas.RecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await crud.create_record(db, record)

@router.get("/", response_model=list[schemas.RecordOut])
async def get_records(
    habit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await crud.get_records(db, habit_id)

@router.delete("/{record_id}")
async def delete_record(
    habit_id: int,
    record_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    deleted = await crud.delete_record(db, habit_id, record_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"ok": True}
