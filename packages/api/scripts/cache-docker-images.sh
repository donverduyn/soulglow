#!/bin/bash
set -euo pipefail

COMPOSE_CMD="${DOCKER_COMPOSE_CMD:-docker compose}"

echo "🔍 Getting images from: $COMPOSE_CMD"

mkdir -p /tmp/docker-cache

# Extract image names from `docker compose config`
images=$($COMPOSE_CMD config | grep 'image:' | awk '{print $2}' | sort -u)

for img in $images; do
  echo "📦 Saving image: $img"
  if docker image inspect "$img" > /dev/null 2>&1; then
    sanitized=$(echo $img | tr '/:@' '_')
    docker save "$img" -o "/tmp/docker-cache/${sanitized}.tar"
  else
    echo "⚠️ Image $img not found locally, skipping"
  fi
done
