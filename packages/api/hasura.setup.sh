#!/bin/bash

set -e

# Default host
HOST="localhost"

# Parse CLI arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --host)
      HOST="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

# Allow environment variable override
if [[ -n "$HASURA_HOST" ]]; then
  HOST="$HASURA_HOST"
fi

ENDPOINT="http://$HOST:8080"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MIGRATIONS_DIR="$SCRIPT_DIR/migrations"

mkdir -p "$MIGRATIONS_DIR"

MIGRATION_STATUS=$(hasura migrate status --endpoint "$ENDPOINT" --database-name default)

if [[ "$MIGRATION_STATUS" == *"Not Present"* ]]; then
  echo "Applying pending migrations & metadata to $HOST..."
  hasura migrate apply --all-databases --endpoint "$ENDPOINT"
  hasura metadata apply --endpoint "$ENDPOINT"
  echo "Reloading Hasura metadata..."
  hasura metadata reload --endpoint "$ENDPOINT"
else
  echo "No pending migrations for $HOST."
fi  