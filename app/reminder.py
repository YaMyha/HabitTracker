from app.celery_app import celery_app

@celery_app.task(name="app.reminder.send_daily_reminders")
def send_daily_reminders():
    print("🔔 Sending daily reminders to users...")
