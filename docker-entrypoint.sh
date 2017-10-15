#!/bin/sh
set -e
# Script for the docker endpoint, waits for the db, and executes whatever command.

case "$1" in
    "app")
        uwsgi /etc/uwsgi/uwsgi.ini
        ;;
    "worker")
        celery worker -c 8 -A uchan:celery --logfile=/opt/app/data/log/worker-%n.log --loglevel=INFO
        ;;
    "upgrade")
        alembic upgrade head
        ;;
    "setup")
        python3 setup.py
        ;;
    "shell")
        /bin/sh
        ;;
    "assets")
        ./assets.sh
        ;;
    *)
        exit 1
        ;;
esac
