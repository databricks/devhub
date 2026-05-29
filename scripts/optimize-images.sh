#!/usr/bin/env bash
# Lossless PNG recompression for preview images.
#
# Re-runs are safe (idempotent): once a PNG is at the smallest size oxipng can
# produce at -o max, subsequent runs leave it unchanged.
#
# Run locally: npm run optimize:images

set -euo pipefail

if ! command -v oxipng >/dev/null 2>&1; then
  echo "optimize:images — oxipng not found on PATH." >&2
  echo "Install with: brew install oxipng" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

oxipng -o max --strip safe --preserve \
  "$ROOT/static/img/examples/"*.png \
  "$ROOT/static/img/guides/"*.png
