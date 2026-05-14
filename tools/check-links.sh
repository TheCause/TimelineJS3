#!/usr/bin/env bash
# check-links.sh — audit hrefs in the user-facing pages (landing + view)
# against a running base URL. Exit 1 on any non-2xx response.
#
# Usage:
#   tools/check-links.sh                           # default: http://localhost:8765/dist
#   tools/check-links.sh https://yourdomain.com    # against a deployed instance
#
# The script does not start a server; build & serve dist/ beforehand:
#   npm run build && npx http-server -p 8765 -c-1

set -uo pipefail

BASE="${1:-http://localhost:8765/dist}"
TIMEOUT=8
UA="Mozilla/5.0 (compatible; tljs-link-check/1.0)"

# User-facing pages deployed at dist root.
FILES=(
    "src/template/landing.html"
    "src/template/view.html"
)

# Use a temp file for counting (avoids subshell variable scoping bug).
FAIL_FILE=$(mktemp)
trap 'rm -f "$FAIL_FILE"' EXIT

probe() {
    local raw="$1"
    local label="$2"

    case "$raw" in
        ''|'#'|'#'*|mailto:*|data:*|tel:*|javascript:*) return 0 ;;
    esac

    local url
    if [[ "$raw" =~ ^https?:// ]]; then
        url="$raw"
    elif [[ "$raw" =~ ^/ ]]; then
        # Root-relative: resolve against BASE's origin (scheme://host[:port]),
        # whether or not BASE itself carries a path component.
        local scheme="${BASE%%://*}"
        local origin="${BASE#*://}"
        origin="${origin%%/*}"
        url="${scheme}://${origin}${raw}"
    else
        url="${BASE%/}/$raw"
    fi

    local code
    code=$(curl -s -o /dev/null -L --max-time "$TIMEOUT" \
        -A "$UA" -w "%{http_code}" "$url" 2>/dev/null || echo "ERR")

    if [[ "$code" =~ ^2[0-9][0-9]$ ]]; then
        printf "  \033[32mOK\033[0m   %-4s  %s\n" "$code" "$raw"
    else
        printf "  \033[31mFAIL\033[0m %-4s  %s  →  %s\n" "$code" "$raw" "$url"
        echo "1" >> "$FAIL_FILE"
    fi
}

echo "=== Link audit against base: $BASE ==="

for f in "${FILES[@]}"; do
    [[ -f "$f" ]] || continue
    echo ""
    echo "→ $f"
    # Match only <a href=...> — exclude <link rel="preconnect"> and similar.
    grep -oE '<a [^>]*href=("[^"]+"|'\''[^'\'']+'\'')[^>]*>' "$f" \
        | grep -oE 'href=("[^"]+"|'\''[^'\'']+'\'')' \
        | sed -E 's/^href=("|'\'')//; s/("|'\'')$//' \
        | sort -u \
        | while IFS= read -r href; do
            probe "$href" "$f"
        done
done

fail=$(wc -l < "$FAIL_FILE" | tr -d ' ')
echo ""
if [[ "$fail" -gt 0 ]]; then
    echo -e "\033[31m✗ $fail broken link(s)\033[0m"
    exit 1
else
    echo -e "\033[32m✓ all links OK\033[0m"
fi
