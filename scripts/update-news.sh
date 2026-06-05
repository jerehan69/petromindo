#!/usr/bin/env bash
set -e

SITE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PETRO_DIR="$(cd "$SITE_DIR/.." && pwd)"

echo "=== 1. Running scraper ==="
cd "$PETRO_DIR"
uv run python3 ft_bloomberg_scraper.py

echo ""
echo "=== 2. Building site with fresh data ==="
cd "$SITE_DIR"
npm run build

echo ""
echo "=== 3. Pushing to GitHub → deploys to tech.jemxx.dev ==="
git add -A
git commit -m "Update news feed $(date +'%Y-%m-%d %H:%M')"
git push origin main

echo ""
echo "✅ Done — site will be live on Cloudflare Pages in ~1-2 min"
