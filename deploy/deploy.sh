#!/bin/sh
# Build and (re)start the site on the VPS, from a checkout of this repository:
#   git pull && deploy/deploy.sh
# The content is in the repository: the image is built from the checked-out commit (content is
# validated and every page pre-rendered during the build; a broken content file stops here and
# the running site stays as it was).
set -eu
cd "$(dirname "$0")/.."
URL=${NEXT_PUBLIC_SERVER_URL:-https://obyte.org}
mkdir -p /srv/obyte/image-cache
chown 1001:1001 /srv/obyte/image-cache 2>/dev/null || true

# sitemap lastmod from git (.git is not sent to the Docker build); needs Node ≥ 22.6 on the host,
# without it the sitemap simply has no lastmod
if command -v node >/dev/null; then
  node --experimental-strip-types --no-warnings scripts/content-dates.ts
else
  echo 'node not found: sitemap lastmod left out'
fi

docker build --build-arg NEXT_PUBLIC_SERVER_URL="$URL" -t obyte-site:latest .
docker compose -f deploy/docker-compose.yml up -d
docker image prune -f >/dev/null
echo "deployed $(git rev-parse --short HEAD): $(docker compose -f deploy/docker-compose.yml ps --format '{{.Status}}')"
