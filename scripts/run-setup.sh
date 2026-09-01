#!/usr/bin/env bash
# Run after deploy: applies DB migrations + storage buckets on production
set -euo pipefail
URL="${1:-https://need-it-eight.vercel.app}"
SECRET="${SETUP_SECRET:-makeit-setup-2026}"
echo "Running setup on $URL ..."
curl -s -X POST "$URL/api/setup" \
  -H "x-setup-secret: $SECRET" \
  -H "Content-Type: application/json" | python3 -m json.tool
