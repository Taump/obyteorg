#!/bin/sh
# Production without Docker: serves the standalone build made by `pnpm build`.
#   pnpm build && pnpm start:prod
set -eu
cd "$(dirname "$0")/.."
[ -f .next/standalone/server.js ] || { echo 'No build found: run pnpm build first' >&2; exit 1; }
export NODE_ENV=production PORT="${PORT:-3000}"
exec node .next/standalone/server.js
