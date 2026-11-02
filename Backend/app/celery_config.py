
import os
from celery import Celery


def make_celery(app):
    redis_url = os.getenv(
        "REDIS_URL",
        "redis://localhost:6379/0"
    )

    celery = Celery(
        app.import_name,
        broker=redis_url,
        backend=redis_url,
        include=["app.tasks.document_tasks"]
    )

    celery.conf.update(
        task_serializer="json",
        accept_content=["json"],
        result_serializer="json",
        timezone="Asia/Kolkata",
        enable_utc=True,
        task_track_started=True,
        result_expires=3600,
        worker_prefetch_multiplier=1,
        task_acks_late=True
    )

    class FlaskTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = FlaskTask

    return celery
