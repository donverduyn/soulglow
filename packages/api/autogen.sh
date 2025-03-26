#!/bin/sh
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MIGRATIONS_DIR="$SCRIPT_DIR/migrations"
CODEGEN_CONFIG_CLIENT="$SCRIPT_DIR/../../codegen.client.yml"

# Ensure migrations directory exists
mkdir -p "$MIGRATIONS_DIR"

echo "👀 Watching for new migrations in $MIGRATIONS_DIR..."
while inotifywait -e create -r "$MIGRATIONS_DIR"; do
  echo "🚀 New migration detected! Rerunning GraphQL codegen..."
  hasura metadata reload --endpoint http://hasura:8080 --admin-secret admin_secret
  hasura metadata export --endpoint http://hasura:8080 --admin-secret admin_secret
  
  yarn codegen:api
  graphql-codegen --config "$CODEGEN_CONFIG_CLIENT"
  # graphql-codegen --config "$CODEGEN_CONFIG_CLIENT" --no-watch
  
  hasura metadata apply --endpoint http://hasura:8080 --admin-secret admin_secret
done
