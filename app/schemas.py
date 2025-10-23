from datetime import date
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List


# ---------- Пользователи ----------
class UserCreate(BaseModel):
    email: str
    password: str
    telegram_chat_id: Optional[str] = None


class UserOut(BaseModel):
    id: int
    email: str

    class ConfigDict:
        from_attributes = True


# ---------- Токен ----------
class Token(BaseModel):
    access_token: str
    token_type: str


# ---------- Привычки ----------
class HabitBase(BaseModel):
    title: str
    description: Optional[str] = None
    reminder_date: Optional[date] = None
    
    @field_validator('reminder_date', mode='before')
    @classmethod
    def validate_reminder_date(cls, v):
        if v == "" or v is None:
            return None
        return v
    
    @field_validator('description', mode='before')
    @classmethod
    def validate_description(cls, v):
        if v == "" or v is None:
            return None
        return v


class HabitCreate(HabitBase):
    pass


class HabitOut(HabitBase):
    id: int
    class ConfigDict:
        from_attributes = True


# ---------- Записи выполнения ----------
class RecordBase(BaseModel):
    date: date
    completed: bool = False


class RecordOut(RecordBase):
    id: int
    class ConfigDict:
        from_attributes = True
