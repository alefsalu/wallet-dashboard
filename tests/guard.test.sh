#!/usr/bin/env bash
set -euo pipefail

# Verify guard script rejects forbidden paths when staged
mkdir -p _PESSOAL keys
touch _PESSOAL/leak.md keys/private.pem .env
git add -f _PESSOAL/leak.md keys/private.pem .env 2>/dev/null || true
if ./scripts/guard.sh; then
  echo "Expected guard.sh to fail on forbidden files" && exit 1
fi
git rm -f --cached _PESSOAL/leak.md keys/private.pem .env 2>/dev/null || true
rm -rf _PESSOAL keys .env
./scripts/guard.sh
echo "Guard test PASS"
