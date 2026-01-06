#!/bin/bash
# Backup D1 database (separate schema + data for proper restore)

set -e

# Parse arguments
TARGET="local"

while [[ $# -gt 0 ]]; do
  case $1 in
    --remote)
      TARGET="remote"
      shift
      ;;
    --local)
      TARGET="local"
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TMP_DIR="./tmp"
BACKUP_DIR="$TMP_DIR/backups"
BACKUP_NAME="${TARGET}_backup_$TIMESTAMP"
SCHEMA_FILE="$BACKUP_DIR/${BACKUP_NAME}_schema.sql"
DATA_FILE="$BACKUP_DIR/${BACKUP_NAME}_data.sql"

echo "💾 Backup D1 Database"
echo ""
echo "   Source: $TARGET"
echo ""

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Export schema only
echo "📦 Exporting $TARGET schema..."
if [ "$TARGET" == "remote" ]; then
  npx wrangler d1 export DB --remote --no-data --output="$SCHEMA_FILE"
else
  npx wrangler d1 export DB --local --no-data --output="$SCHEMA_FILE"
fi

# Export data only
echo "📦 Exporting $TARGET data..."
if [ "$TARGET" == "remote" ]; then
  npx wrangler d1 export DB --remote --no-schema --output="$DATA_FILE"
else
  npx wrangler d1 export DB --local --no-schema --output="$DATA_FILE"
fi

# Compress both files into a single archive
echo "🗜️  Compressing backup..."
tar -czf "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" -C "$BACKUP_DIR" "${BACKUP_NAME}_schema.sql" "${BACKUP_NAME}_data.sql"

# Remove uncompressed files
rm -f "$SCHEMA_FILE" "$DATA_FILE"

FINAL_FILE="$BACKUP_DIR/${BACKUP_NAME}.tar.gz"
FILE_SIZE=$(du -h "$FINAL_FILE" | cut -f1)

echo ""
echo "✅ Backup completed successfully!"
echo ""
echo "📁 Location: $FINAL_FILE"
echo "📊 Size: $FILE_SIZE"
echo ""
echo "To restore from this backup:"
echo "  ./scripts/db-restore.sh $FINAL_FILE              # restore to local"
echo "  ./scripts/db-restore.sh --remote $FINAL_FILE     # restore to remote"
