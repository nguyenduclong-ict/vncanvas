#!/bin/bash
# Sync D1 database between local and remote
# Uses separate schema and data exports to avoid foreign key ordering issues

set -e

# Parse arguments
DIRECTION=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --to-remote)
      DIRECTION="local-to-remote"
      shift
      ;;
    --to-local)
      DIRECTION="remote-to-local"
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Check if direction is specified
if [ -z "$DIRECTION" ]; then
  echo "Usage: ./scripts/db-sync.sh [--to-remote|--to-local]"
  echo ""
  echo "Options:"
  echo "  --to-remote   Sync local database to remote"
  echo "  --to-local    Sync remote database to local"
  exit 1
fi

if [ "$DIRECTION" == "local-to-remote" ]; then
  SOURCE="local"
  TARGET="remote"
else
  SOURCE="remote"
  TARGET="local"
fi

echo "🔄 Sync D1 Database"
echo ""
echo "   From: $SOURCE"
echo "   To:   $TARGET"
echo ""
echo "⚠️  WARNING: This will DROP ALL TABLES on $TARGET and replace with $SOURCE data."
read -p "Are you sure you want to continue? (y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "❌ Sync cancelled."
  exit 0
fi
echo ""

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TMP_DIR="./tmp"
SCHEMA_FILE="$TMP_DIR/sync_schema_$TIMESTAMP.sql"
DATA_FILE="$TMP_DIR/sync_data_$TIMESTAMP.sql"

mkdir -p "$TMP_DIR"

# Step 1: Export source database (schema only)
echo "📦 Exporting $SOURCE schema..."
if [ "$SOURCE" == "remote" ]; then
  npx wrangler d1 export DB --remote --no-data --output="$SCHEMA_FILE"
else
  npx wrangler d1 export DB --local --no-data --output="$SCHEMA_FILE"
fi

# Step 2: Export source database (data only)
echo "📦 Exporting $SOURCE data..."
if [ "$SOURCE" == "remote" ]; then
  npx wrangler d1 export DB --remote --no-schema --output="$DATA_FILE"
else
  npx wrangler d1 export DB --local --no-schema --output="$DATA_FILE"
fi

# Step 3: Drop tables on target
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

# Step 4: Import schema first (with PRAGMA foreign_keys=OFF)
echo "🚀 Importing schema to $TARGET..."
echo "PRAGMA foreign_keys=OFF;" | cat - "$SCHEMA_FILE" > "$SCHEMA_FILE.tmp"
mv "$SCHEMA_FILE.tmp" "$SCHEMA_FILE"

if [ "$TARGET" == "remote" ]; then
  npx wrangler d1 execute DB --remote --file="$SCHEMA_FILE" --yes
else
  npx wrangler d1 execute DB --local --file="$SCHEMA_FILE"
fi

# Step 5: Import data (with PRAGMA foreign_keys=OFF)
echo "🚀 Importing data to $TARGET..."
echo "PRAGMA foreign_keys=OFF;" | cat - "$DATA_FILE" > "$DATA_FILE.tmp"
mv "$DATA_FILE.tmp" "$DATA_FILE"

if [ "$TARGET" == "remote" ]; then
  npx wrangler d1 execute DB --remote --file="$DATA_FILE" --yes
else
  npx wrangler d1 execute DB --local --file="$DATA_FILE"
fi

# Step 6: Cleanup
echo "🗑️  Cleaning up temporary files..."
rm -f "$SCHEMA_FILE" "$DATA_FILE"

echo ""
echo "✅ Database synced successfully!"
echo "   $SOURCE → $TARGET"
