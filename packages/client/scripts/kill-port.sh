#!/usr/bin/env bash
set -e

PORT=${KILL_PORT}
PROTOCOL=${KILL_PROTOCOL:-tcp}

if [ -z "$PORT" ]; then
  echo "[kill-port] ❌ KILL_PORT is not set"
  exit 1
fi

echo "[kill-port] Attempting to free port $PORT/$PROTOCOL..."

#
