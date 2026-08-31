from celery import Celery
import os


def make_celery(app=None):
    broker = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/1')
    backend = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/1')

    celery = Celery('medicore', broker=broker, backend=backend)
    celery.conf.update(
        task_serializer='json',
        accept_content=['json'],
        result_serializer='json',
        timezone='UTC',
        enable_utc=True,
        beat_schedule={
            'appointment-reminders': {
                'task': 'tasks.send_appointment_reminders',
                'schedule': 3600.0,
            },
            'daily-reminders': {
                'task': 'tasks.send_daily_reminders',
                'schedule': 86400.0,
            },
            'monthly-report': {
                'task': 'tasks.generate_monthly_report',
                'schedule': 2592000.0,
            },
        },
    )

    if app is not None:
        class ContextTask(celery.Task):
            def __call__(self, *args, **kwargs):
                with app.app_context():
                    return self.run(*args, **kwargs)
        celery.Task = ContextTask

    return celery


celery_app = make_celery()
