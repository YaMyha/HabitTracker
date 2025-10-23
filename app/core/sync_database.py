"""
Synchronous database utilities for Celery tasks.
This module provides sync database connections for Celery workers
separate from the async FastAPI database connections.
"""
from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings


class SyncDatabaseManager:
    """Manages synchronous database connections for Celery tasks."""
    
    def __init__(self):
        self._engine = None
        self._session_factory = None
    
    def get_session(self) -> Session:
        """Get a new synchronous database session for Celery tasks."""
        if self._engine is None:
            self._engine = create_engine(
                settings.SYNC_DATABASE_URL, 
                echo=False,
                pool_pre_ping=True,  # Verify connections before use
                pool_recycle=3600,   # Recycle connections every hour
            )
            self._session_factory = sessionmaker(
                self._engine, 
                expire_on_commit=False
            )
        
        return self._session_factory()
    
    def close(self):
        """Close the database engine."""
        if self._engine:
            self._engine.dispose()
            self._engine = None
            self._session_factory = None


# Global instance for Celery tasks
sync_db_manager = SyncDatabaseManager()


@contextmanager
def get_sync_db_session():
    """Context manager for synchronous database sessions in Celery tasks."""
    session = sync_db_manager.get_session()
    try:
        yield session
    finally:
        session.close()


def cleanup_sync_db():
    """Cleanup function to be called when Celery worker shuts down."""
    sync_db_manager.close()
