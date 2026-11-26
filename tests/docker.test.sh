#!/usr/bin/env bash
set -euo pipefail
# Verify Dockerfile has multi-stage build, unprivileged user and healthcheck
grep -q "FROM node:24" Dockerfile
grep -q "nginxinc/nginx-unprivileged:alpine" Dockerfile
grep -q "HEALTHCHECK" Dockerfile
# Verify nginx configuration has required security headers
grep -q "X-Content-Type-Options \"nosniff\"" nginx/default.conf
grep -q "X-Frame-Options \"DENY\"" nginx/default.conf
grep -q "Content-Security-Policy" nginx/default.conf
echo "Docker config test PASS"
