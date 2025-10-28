import datetime
from sqlalchemy import or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload, Session

from app import schemas
from app.models import User, Habit, Record
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------- Users ----------
async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

MAX_BCRYPT_LENGTH = 72

async def create_user(db, user):
    password_bytes = user.password.encode("utf-8")[:MAX_BCRYPT_LENGTH]
    hashed = pwd_context.hash(password_bytes)

    db_user = User(email=user.email, password_hash=hashed, telegram_chat_id=user.telegram_chat_id)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)


# ---------- Habits ----------
async def create_habit(db: AsyncSession, user_id: int, habit: schemas.HabitCreate):
    db_habit = Habit(user_id=user_id, **habit.model_dump())
    db.add(db_habit)
    await db.commit()
    await db.refresh(db_habit)
    return db_habit

async def get_habits(db: AsyncSession, user_id: int):
    result = await db.execute(select(Habit).where(Habit.user_id == user_id))
    return result.scalars().all()

async def delete_habit(db: AsyncSession, habit_id: int, user_id: int):
    result = await db.execute(select(Habit).where(Habit.id == habit_id, Habit.user_id == user_id))
    habit = result.scalars().first()
    if habit:
        await db.delete(habit)
        await db.commit()
    return habit

# ---------- Records ----------
async def create_record(db: AsyncSession, record: schemas.RecordCreate):
    db_record = Record(**record.model_dump())
    db.add(db_record)
    await db.commit()
    await db.refresh(db_record)
    return db_record

async def get_records(db: AsyncSession, habit_id: int):
    result = await db.execute(select(Record).where(Record.habit_id == habit_id))
    return result.scalars().all()

async def delete_record(db: AsyncSession, habit_id: int, record_id: int):
    result = await db.execute(select(Record).where(Record.id == record_id, Record.habit_id == habit_id))
    record = result.scalars().first()
    if record:
        await db.delete(record)
        await db.commit()
    return record


# ---------- Sync versions for Celery tasks ----------
def get_users_with_due_reminders_sync(db: Session):
    """Synchronous version for Celery tasks."""
    now = datetime.datetime.now(datetime.UTC)
    # Convert to naive datetime for database comparison
    now_naive = now.replace(tzinfo=None)

    stmt = (
        select(User)
        .join(Habit, Habit.user_id == User.id)
        .options(selectinload(User.habits))
        .where(
            Habit.reminder_date.is_not(None),
            Habit.reminder_date <= now_naive
        )
        .distinct()
    )

    result = db.execute(stmt)
    users = result.scalars().all()
    return users