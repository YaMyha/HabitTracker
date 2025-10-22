from celery import Celery
from celery.signals import worker_shutting_down

celery_app = Celery(
    "habittracker",
    broker="redis://redis:6379/0",
    backend="redis://redis:6379/0"
)

celery_app.conf.update(
    timezone="Europe/Moscow",
    enable_utc=True,
    # Prevent task overlap to avoid database connection conflicts
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    # Add task timeout to prevent hanging connections
    task_soft_time_limit=300,  # 5 minutes
    task_time_limit=600,       # 10 minutes
    # Ensure tasks don't overlap
    task_reject_on_worker_lost=True,
    # Run tasks synchronously in the calling process
    task_always_eager=True,
    task_eager_propagates=True,
)

celery_app.autodiscover_tasks(["app.tasks.notifications"])

celery_app.conf.beat_schedule = {
    "send-reminders-every-15-minutes": {
        "task": "app.tasks.notifications.send_daily_reminders",
        "schedule": 15.0,
    },
}


@worker_shutting_down.connect
def cleanup_worker(sender=None, **kwargs):
    """Cleanup database connections when worker shuts down."""
    try:
        from app.core.sync_database import cleanup_sync_db
        cleanup_sync_db()
        print("[INFO] Celery worker database cleanup completed")
    except Exception as e:
        print(f"[WARN] Error during worker cleanup: {e}")