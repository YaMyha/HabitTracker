from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------- Пользователи ----------
async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(models.User).where(models.User.email == email))
    return result.scalars().first()

MAX_BCRYPT_LENGTH = 72

async def create_user(db, user):
    password_bytes = user.password.encode("utf-8")[:MAX_BCRYPT_LENGTH]
    hashed = pwd_context.hash(password_bytes)

    db_user = models.User(email=user.email, password_hash=hashed)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)


# ---------- Привычки ----------
async def create_habit(db: AsyncSession, user_id: int, habit: schemas.HabitCreate):
    db_habit = models.Habit(user_id=user_id, **habit.model_dump())
    db.add(db_habit)
    await db.commit()
    await db.refresh(db_habit)
    return db_habit

async def get_habits(db: AsyncSession, user_id: int):
    result = await db.execute(select(models.Habit).where(models.Habit.user_id == user_id))
    return result.scalars().all()

async def delete_habit(db: AsyncSession, habit_id: int, user_id: int):
    result = await db.execute(select(models.Habit).where(models.Habit.id == habit_id, models.Habit.user_id == user_id))
    habit = result.scalars().first()
    if habit:
        await db.delete(habit)
        await db.commit()
    return habit
