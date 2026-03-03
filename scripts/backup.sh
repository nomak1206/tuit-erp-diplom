#!/bin/bash
# PostgreSQL backup script — run via cron or Celery Beat
# Usage: ./backup.sh (set PGPASSWORD env var or use .pgpass)
set -euo pipefail

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="${POSTGRES_DB:-erp_db}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_HOST="${POSTGRES_HOST:-db}"
DB_PORT="${POSTGRES_PORT:-5432}"

mkdir -p "$BACKUP_DIR"

# Create compressed backup
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  --format=c --compress=9 \
  --file="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.dump"

# Remove backups older than 30 days
find "$BACKUP_DIR" -name "*.dump" -mtime +30 -delete

echo "[$(date)] Backup completed: ${DB_NAME}_${TIMESTAMP}.dump"
