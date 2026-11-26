#!/usr/bin/env bash
set -euo pipefail
grep -q "CI" README.md
grep -qF '```mermaid' README.md
grep -q "docker compose up" README.md
[ "$(ls -1 docs/adr/*.md | wc -l)" -ge 4 ]
grep -q "Alef Salu" LICENSE
echo "Docs validation PASS"
