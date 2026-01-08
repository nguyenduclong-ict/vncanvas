#!/bin/bash
# Restore D1 database from backup (supports separate schema + data)

set -e

# Parse arguments
TARGET="local"
BACKUP_FILE=""
RESTORE_SCHEMA=true
RESTORE_DATA=true

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
    --schema-only)
      RESTORE_SCHEMA=true
      RESTORE_DATA=false
      shift
      ;;
    --data-only)
      RESTORE_SCHEMA=false
      RESTORE_DATA=true
      shift
      ;;
    *)
      BACKUP_FILE="$1"
      shift
      ;;
  esac
done

# Check if backup file is provided
if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./scripts/db-restore.sh [--local|--remote] [--schema-only|--data-only] <backup_file>"
  echo ""
  echo "Examples:"
  echo "  ./scripts/db-restore.sh ./tmp/backups/local_backup_20260106.tar.gz"
  echo "  ./scripts/db-restore.sh --remote ./tmp/backups/local_backup_20260106.tar.gz"
  echo "  ./scripts/db-restore.sh --schema-only ./tmp/backups/local_backup.tar.gz"
  echo "  ./scripts/db-restore.sh ./tmp/backups/local_backup.zip"
  exit 1
fi

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "🔄 Restore Database"
echo ""
echo "   Backup file: $BACKUP_FILE"
echo "   Target: $TARGET"
echo "   Mode: Schema=$RESTORE_SCHEMA, Data=$RESTORE_DATA"
echo ""

if [ "$RESTORE_SCHEMA" = true ]; then
  echo "⚠️  WARNING: This will DROP ALL TABLES on $TARGET and replace with backup schema."
else
  echo "⚠️  WARNING: This will IMPORT DATA on $TARGET (Tables will NOT be dropped)."
fi
read -p "Are you sure you want to continue? (y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "❌ Restore cancelled."
  exit 0
fi
echo ""

TMP_DIR="./tmp"
RESTORE_DIR="$TMP_DIR/restore_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$RESTORE_DIR"

# Extract backup
echo "📦 Extracting backup..."
if [[ "$BACKUP_FILE" == *.tar.gz ]]; then
  tar -xzf "$BACKUP_FILE" -C "$RESTORE_DIR"
  SCHEMA_FILE=$(find "$RESTORE_DIR" -name "*_schema.sql" | head -1)
  DATA_FILE=$(find "$RESTORE_DIR" -name "*_data.sql" | head -1)
elif [[ "$BACKUP_FILE" == *.zip ]]; then
  unzip -q "$BACKUP_FILE" -d "$RESTORE_DIR"
  SCHEMA_FILE=$(find "$RESTORE_DIR" -name "*_schema.sql" | head -1)
  DATA_FILE=$(find "$RESTORE_DIR" -name "*_data.sql" | head -1)
elif [[ "$BACKUP_FILE" == *.gz ]]; then
  # Legacy single-file backup
  gunzip -c "$BACKUP_FILE" > "$RESTORE_DIR/backup.sql"
  SCHEMA_FILE="$RESTORE_DIR/backup.sql"
  DATA_FILE=""
else
  # Uncompressed SQL file
  cp "$BACKUP_FILE" "$RESTORE_DIR/backup.sql"
  SCHEMA_FILE="$RESTORE_DIR/backup.sql"
  DATA_FILE=""
fi

# Drop tables on target (Only if restoring schema)
if [ "$RESTORE_SCHEMA" = true ]; then
  echo "🗑️  Dropping $TARGET tables..."
  if [ "$TARGET" == "remote" ]; then
    TABLES=$(npx wrangler d1 execute DB --remote --json --command="SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';" 2>/dev/null | jq -r '.[0].results[].name' 2>/dev/null || echo "")
    
    if [ -n "$TABLES" ]; then
      for TABLE in $TABLES; do
        echo "   Dropping table: $TABLE"
        npx wrangler d1 execute DB --remote --command="DROP TABLE IF EXISTS \"$TABLE\";" --yes 2>/dev/null || true
      done
    fi
  else
    # For local, delete the database folder
    rm -rf .wrangler/state/v3/d1/miniflare-D1DatabaseObject
  fi
else
  echo "⏩ Skipping table drop (Data only restore)..."
fi

# Import schema first
if [ "$RESTORE_SCHEMA" = true ]; then
  echo "🚀 Importing schema to $TARGET..."
  echo "PRAGMA foreign_keys=OFF;" | cat - "$SCHEMA_FILE" > "$SCHEMA_FILE.tmp"
  mv "$SCHEMA_FILE.tmp" "$SCHEMA_FILE"
  
  if [ "$TARGET" == "remote" ]; then
    npx wrangler d1 execute DB --remote --file="$SCHEMA_FILE" --yes
  else
    npx wrangler d1 execute DB --local --file="$SCHEMA_FILE"
  fi
else
  echo "⏩ Skipping schema import..."
fi

# Import data if separate file exists
if [ "$RESTORE_DATA" = true ]; then
  if [ -n "$DATA_FILE" ] && [ -f "$DATA_FILE" ]; then
    echo "🚀 Importing data to $TARGET..."
    echo "PRAGMA foreign_keys=OFF;" | cat - "$DATA_FILE" > "$DATA_FILE.tmp"
    mv "$DATA_FILE.tmp" "$DATA_FILE"
    
    if [ "$TARGET" == "remote" ]; then
      npx wrangler d1 execute DB --remote --file="$DATA_FILE" --yes
    else
      npx wrangler d1 execute DB --local --file="$DATA_FILE"
    fi
  else
    echo "⚠️  No data file found in backup."
  fi
else
  echo "⏩ Skipping data import..."
fi

# Cleanup
echo "🗑️  Cleaning up temporary files..."
rm -rf "$RESTORE_DIR"

echo ""
echo "✅ Database restored successfully to $TARGET!"
