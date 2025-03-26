#!/usr/bin/env bash
set -euo pipefail

echo "[codegen] Updating..."
yarn ws api hasura:metadata:apply 2>&1
echo "[codegen] ✅ Done."
