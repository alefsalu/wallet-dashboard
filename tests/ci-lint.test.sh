#!/usr/bin/env bash
set -euo pipefail
# Check ci.yml defines guard, lint, test, e2e, security, and build-image jobs
grep -q "guard:" .github/workflows/ci.yml
grep -q "lint:" .github/workflows/ci.yml
grep -q "test:" .github/workflows/ci.yml
grep -q "e2e:" .github/workflows/ci.yml
grep -q "security:" .github/workflows/ci.yml
grep -q "build-image:" .github/workflows/ci.yml
# Verify coverage threshold check in test job
grep -q "coverage" .github/workflows/ci.yml
# Check dependabot
grep -q "package-ecosystem: \"npm\"" .github/dependabot.yml
grep -q "package-ecosystem: \"github-actions\"" .github/dependabot.yml
grep -q "package-ecosystem: \"docker\"" .github/dependabot.yml
echo "CI config test PASS"
