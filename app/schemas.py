from datetime import date
from pydantic import BaseModel, EmailStr
from typing import Optional, List


# ---------- Пользователи ----------
class UserCreate(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True


# ---------- Токен ----------
class Token(BaseModel):
    access_token: str
    token_type: str


# ---------- Привычки ----------
class HabitBase(BaseModel):
    title: str
    description: Optional[str] = None


class HabitCreate(HabitBase):
    pass


class HabitOut(HabitBase):
    id: int
    class Config:
        from_attributes = True


# ---------- Записи выполнения ----------
class RecordBase(BaseModel):
    date: date
    completed: bool = False


class RecordOut(RecordBase):
    id: int
    class Config:
        from_attributes = True
