#!/usr/bin/env bash

set -euo pipefail

export PATH="/usr/local/bin:/usr/bin:/bin:${PATH:-}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WINDOWS_REPO="${WINDOWS_REPO:-/mnt/c/Users/micro/Documents/New project/gfoote}"

if [[ ! -d "$WINDOWS_REPO" ]]; then
  echo "Windows repo not found at: $WINDOWS_REPO" >&2
  echo "Set WINDOWS_REPO to the mounted Windows path before running this script." >&2
  exit 1
fi

if [[ "$REPO_ROOT" == "$WINDOWS_REPO" ]]; then
  echo "Run this script from the WSL copy, not the mounted Windows folder." >&2
  exit 1
fi

echo "Syncing from Windows repo..."
rsync -av \
  --delete \
  --exclude '.git' \
  --exclude '.bundle' \
  --exclude '.bundle-wsl' \
  --exclude '.obsidian-build' \
  --exclude '_site' \
  --exclude 'node_modules' \
  --exclude 'vendor' \
  "$WINDOWS_REPO/" "$REPO_ROOT/"

cd "$REPO_ROOT"

echo "Installing dependencies..."
bundle config set --local path vendor/bundle >/dev/null
/usr/local/bin/bundle install
npm install

echo "Preparing build..."
npm run build
npm run build:content

cleanup() {
  if [[ -n "${NPM_PID:-}" ]]; then
    kill "$NPM_PID" >/dev/null 2>&1 || true
  fi
  if [[ -n "${CONTENT_PID:-}" ]]; then
    kill "$CONTENT_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

echo "Starting asset watcher..."
npm run dev &
NPM_PID=$!

echo "Starting content watcher..."
npm run dev:content &
CONTENT_PID=$!

echo "Starting Jekyll at http://127.0.0.1:4000 ..."
/usr/local/bin/bundle exec jekyll serve \
  --source .obsidian-build \
  --destination .obsidian-build/_site \
  --host 127.0.0.1 \
  --livereload
