#!/usr/bin/env bash
set -euo pipefail

SOURCE="../wallet-api/openapi/openapi.yaml"
TARGET="contracts/wallet-api.openapi.yaml"

if [ -f "$SOURCE" ]; then
  echo "Syncing OpenAPI contract from $SOURCE to $TARGET..."
  cp "$SOURCE" "$TARGET"
  echo "Contract synced successfully."
else
  echo "Source contract $SOURCE not found. Keeping current $TARGET."
fi
