"""Notification tasks for habit reminders."""
import datetime
import httpx
from app.celery_app import celery_app
from app.core.config import settings
from app.core.sync_database import get_sync_db_session
from app import crud


@celery_app.task(name="notifications.send_telegram_reminder")
def send_telegram_reminder(chat_id: str, text: str):
    """Send Telegram message to user."""
    if not settings.TELEGRAM_BOT_TOKEN:
        print("[WARN] TELEGRAM_BOT_TOKEN not configured - skipping notification")
        return

    url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
    try:
        response = httpx.post(url, json={"chat_id": chat_id, "text": text})
        response.raise_for_status()
        print(f"[TG] Sent to {chat_id}: {text}")
    except Exception as e:
        print(f"[ERROR] Telegram send failed: {e}")


@celery_app.task(bind=True)
def send_daily_reminders(self):
    """Send daily habit reminders to users."""
    try:
        with get_sync_db_session() as db:
            users = crud.get_users_with_due_reminders_sync(db)
            print(f"[INFO] Found {len(users)} users with due reminders")

            if not users:
                print("[INFO] No users with due reminders found")
                return

            # Group habits by user to avoid duplicate messages
            for user in users:
                if not user.telegram_chat_id:
                    print(f"[WARN] User {user.id} has no telegram_chat_id - skipping")
                    continue
                
                # Get user's habits that need reminders now
                now = datetime.datetime.now(datetime.UTC)
                # Convert to naive datetime for comparison with database values
                now_naive = now.replace(tzinfo=None)
                due_habits = [habit for habit in user.habits 
                             if habit.reminder_date and habit.reminder_date <= now_naive]
                
                if not due_habits:
                    print(f"[INFO] User {user.id} has no habits due today")
                    continue
                
                text = f"Привет! 🌱 Не забудь выполнить привычки сегодня."
                
                # Send single reminder per user
                send_telegram_reminder.delay(user.telegram_chat_id, text)
                print(f"[INFO] Sent reminder to user {user.id} for {len(due_habits)} habits")
                
    except Exception as exc:
        print(f"[ERROR] Daily reminders task failed: {exc}")
        raise self.retry(exc=exc, countdown=60, max_retries=3)

