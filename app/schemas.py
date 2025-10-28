from datetime import date, datetime
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List


class UserCreate(BaseModel):
    email: str
    password: str
    telegram_chat_id: Optional[str] = None


class UserOut(BaseModel):
    id: int
    email: str

    class ConfigDict:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class HabitBase(BaseModel):
    title: str
    description: Optional[str] = None
    reminder_date: Optional[datetime] = None
    
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


class RecordBase(BaseModel):
    habit_id: int
    date: datetime


class RecordCreate(RecordBase):
    pass


class RecordOut(RecordBase):
    id: int
    habit_id: int
    date: datetime
    class ConfigDict:
        from_attributes = True
