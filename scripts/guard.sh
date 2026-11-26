#!/usr/bin/env bash
set -euo pipefail

FORBIDDEN_PATTERN='^(_PESSOAL/|\.superpowers/|keys/)|\.pem$|(^|/)\.env$'

MATCHES=$(git ls-files | grep -E "$FORBIDDEN_PATTERN" || true)

if [ -n "$MATCHES" ]; then
  echo "SECURITY GUARD FAILURE: The following forbidden files are tracked in git:"
  echo "$MATCHES"
  exit 1
fi

echo "Guard check passed: No forbidden files tracked in git."
exit 0
