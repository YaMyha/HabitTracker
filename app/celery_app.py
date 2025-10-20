from celery import Celery

celery_app = Celery(
    "habittracker",
    broker="redis://redis:6379/0",
    backend="redis://redis:6379/0"
)

celery_app.conf.update(
    timezone="Europe/Moscow",
    enable_utc=True
)

celery_app.autodiscover_tasks(["app.reminder"])

celery_app.conf.beat_schedule = {
    "send-reminders-every-10-minutes": {
        "task": "app.reminder.send_daily_reminders",
        "schedule": 10.0,
    },
}