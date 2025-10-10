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
