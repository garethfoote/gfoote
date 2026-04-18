#!/usr/bin/env bash

set -euo pipefail

cd /workspace

bundle config set path "${BUNDLE_PATH:-/usr/local/bundle}" >/dev/null

echo "Installing Ruby gems..."
bundle install

echo "Installing Node packages..."
npm install

echo "Preparing initial build..."
npm run build
npm run build:content

cleanup() {
  if [[ -n "${ASSET_PID:-}" ]]; then
    kill "$ASSET_PID" >/dev/null 2>&1 || true
  fi
  if [[ -n "${CONTENT_PID:-}" ]]; then
    kill "$CONTENT_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

echo "Starting asset watcher..."
npm run dev -- --legacy-watch &
ASSET_PID=$!

echo "Starting content watcher..."
npm run dev:content -- --legacy-watch &
CONTENT_PID=$!

echo "Starting Jekyll at http://localhost:4000 ..."
bundle exec jekyll serve \
  --source .obsidian-build \
  --destination .obsidian-build/_site \
  --host 0.0.0.0 \
  --force_polling \
  --livereload \
  --livereload-port 35729
