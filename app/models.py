from sqlalchemy import Column, Integer, String, ForeignKey, Date, Boolean
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    telegram_chat_id = Column(String, nullable=True)
    habits = relationship("Habit", back_populates="user")

class Habit(Base):
    __tablename__ = "habits"
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    reminder_date = Column(Date, nullable=False)
    user = relationship("User", back_populates="habits")
    records = relationship("Record", back_populates="habit")

class Record(Base):
    __tablename__ = "records"
    id = Column(Integer, primary_key=True)
    habit_id = Column(Integer, ForeignKey("habits.id"))
    date = Column(Date)
    completed = Column(Boolean, default=False)
    habit = relationship("Habit", back_populates="records")
