#!/usr/bin/env bash
# deploy.sh — build, audit, and mirror dist/ to a static host.
#
# Usage:
#   tools/deploy.sh                # deploys to REMOTE_DIR from .deployrc
#   tools/deploy.sh '~/other-dir/' # overrides the remote dir
#
# Host and default remote dir are read from .deployrc (gitignored) so no
# credentials live in version control. Copy .deployrc.example to .deployrc
# and fill it in. The site is fully static: this builds dist/ locally,
# audits links against a local server, then rsyncs. No server-side build.

set -euo pipefail

RC_FILE=".deployrc"
if [[ ! -f "$RC_FILE" ]]; then
    echo "✗ Missing $RC_FILE — copy .deployrc.example to .deployrc and fill it in." >&2
    exit 1
fi
# shellcheck source=/dev/null
source "$RC_FILE"

: "${REMOTE_HOST:?REMOTE_HOST not set in .deployrc}"
REMOTE_DIR="${1:-${REMOTE_DIR:?REMOTE_DIR not set in .deployrc and no argument given}}"
SERVE_PORT="${SERVE_PORT:-8765}"

echo "=== Deploy to $REMOTE_HOST:$REMOTE_DIR ==="

echo ""
echo "→ Build (npm run dist)…"
npm run dist

echo ""
echo "→ Link audit (local)…"
# Local server for the link audit: Python stdlib rather than `npx http-server`.
# `npx` fetches a package outside the lockfile, with no integrity check — it was
# the only step of this deploy doing so.
python3 -m http.server --directory dist "$SERVE_PORT" > /dev/null 2>&1 &
SERVE_PID=$!
trap 'kill "$SERVE_PID" 2>/dev/null || true' EXIT
# Give the server a moment to come up.
for _ in $(seq 1 10); do
    curl -s -o /dev/null "http://localhost:$SERVE_PORT/view.html" && break
    sleep 0.5
done
tools/check-links.sh "http://localhost:$SERVE_PORT"
kill "$SERVE_PID" 2>/dev/null || true
trap - EXIT

echo ""
echo "→ rsync dist/ → $REMOTE_HOST:$REMOTE_DIR"
rsync -avz --delete --exclude='.well-known' --exclude='cgi-bin' --exclude='data' \
    dist/ "$REMOTE_HOST:$REMOTE_DIR"

echo ""
echo "✓ Deployed."
