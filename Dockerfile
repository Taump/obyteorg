# Production image: the Next.js standalone server with the site's content built in.
#
#   node scripts/content-dates.ts   # (via deploy/deploy.sh) sitemap dates from git — .git is not
#                                   # sent to the build; without the file lastmod is left out
#   docker build --build-arg NEXT_PUBLIC_SERVER_URL=https://obyte.org -t obyte-site .
#
# Every page is pre-rendered at build time from content/ (validated first: a broken content file
# fails the build). At runtime the server answers the pre-rendered pages and optimizes the images
# of public/media; its only state is the image optimizer's cache (a volume, see compose files).

FROM node:22.23.5-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable

# ── dependencies ──
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
  pnpm install --frozen-lockfile

# ── build ──
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# inlined into the pages: canonical URLs, Open Graph, sitemap, robots
ARG NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}
RUN test -n "$NEXT_PUBLIC_SERVER_URL" || (echo 'NEXT_PUBLIC_SERVER_URL build arg is required' && exit 1); \
  pnpm run build

# ── runtime ──
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
  NEXT_TELEMETRY_DISABLED=1 \
  PORT=3000 \
  HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 -G nodejs nextjs
# the image optimizer's cache: a volume, so a restart doesn't re-encode every image
RUN mkdir -p /app/.next/cache/images && chown -R nextjs:nodejs /app/.next
VOLUME ["/app/.next/cache/images"]

# the server + public/ + .next/static (completed by scripts/postbuild.mjs)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:3000/robots.txt || exit 1
CMD ["node", "server.js"]
