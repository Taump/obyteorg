# Deploying obyte.org (VPS + Docker + Cloudflare)

One container: the Next.js standalone server with the content built in. Every page is
pre-rendered in the image; the server answers them, the redirects and the image optimizer
(`/_next/image`). Nothing to back up on the server: the content is this repository. The only
state is the optimizer's cache (`/srv/obyte/image-cache`, rebuilt on demand if lost).

```
/srv/obyte/
  app/              checkout of this repository
  image-cache/      next/image cache (volume)
```

## Deploy / update

```sh
cd /srv/obyte/app && git pull && deploy/deploy.sh
```

`deploy.sh`: sitemap dates from git (needs Node ≥ 22.6 on the host, otherwise lastmod is left
out) → `docker build` (validates the content and pre-renders every page; a broken content file
stops here and the running site stays as it was) → restarts the container.
`NEXT_PUBLIC_SERVER_URL` defaults to `https://obyte.org`.

A container platform that builds from the repository (Dokploy, Coolify …): use
[`docker-compose.prod.yml`](../docker-compose.prod.yml).

Without Docker: `pnpm install && pnpm build && pnpm start:prod` (behind systemd), with
`NEXT_PUBLIC_SERVER_URL` set before the build.

## Reverse proxy and Cloudflare

The container listens on `127.0.0.1:3000`. A proxy on the host terminates TLS — e.g. Caddy:
`obyte.org { reverse_proxy 127.0.0.1:3000 }`. Cloudflare SSL mode: **Full (strict)**.

Cache:

- `/_next/static/*`, `/fonts/*`: forever (versioned names, `immutable`).
- `/_next/image*`: the server sends the optimizer's cache headers; Cloudflare may follow them.
- `/media/*`, `/animation/*`, `/user/*`, `/Byteball.pdf`: a day + a week of stale-while-revalidate.
- HTML: pre-rendered; a deploy replaces it — purge Cloudflare's cache after a deploy if HTML is
  cached at the edge.
- `/downloads/*`, `/discord`: `no-store` (always the current release).
- `/coin_info.json`: the server answers it with stats.obyte.org's JSON (a rewrite).

## After a deploy

Check `https://obyte.org/`, `/faq`, `/downloads/Obyte-win64.exe`, `/coin_info.json` and
`/sitemap.xml`; after code changes also run the checks against the live site:

```sh
pnpm check:links --base https://obyte.org
E2E_BASE_URL=https://obyte.org pnpm test:e2e
PERF_BASE_URL=https://obyte.org pnpm perf
```
