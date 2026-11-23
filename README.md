# obyte.org

The [obyte.org](https://obyte.org) website: **Next.js 16** (App Router) + **MDX/YAML content files**
in this repository, **Tailwind v4**. Every page is pre-rendered at build time (SSG) and served by
the Next.js server, which also optimizes the images (AVIF/WebP).

- Editing the content (pages, MDX components, lists, wallet releases, images): [`docs/content.md`](docs/content.md)
- Deployment (VPS + Docker + Cloudflare): [`deploy/README.md`](deploy/README.md)

## Requirements

Node.js 22.23+ (or 24.22+), pnpm via `corepack enable`; Docker for the container setups.

## Development

```sh
pnpm install
pnpm dev                 # http://localhost:3000 (renders on request; content changes on reload)
pnpm content:check       # validate content/ (file:line problems)
```

Environment: only `NEXT_PUBLIC_SERVER_URL` (public origin, inlined at build time — canonical URLs,
Open Graph, sitemap); defaults to `https://obyte.org`. See `.env.example`.

## Production build

```sh
pnpm build               # content:check + sitemap dates from git → next build (every page pre-rendered)
pnpm start:prod          # the standalone server on :3000
```

Or the Docker image: `docker build --build-arg NEXT_PUBLIC_SERVER_URL=https://obyte.org -t obyte-site .`
(see [`deploy/README.md`](deploy/README.md)).

## Releasing a new wallet version

The download links of the site (`/downloads/Obyte-win64.exe`, `/downloads/Obyte-test-arm64.dmg`,
the `Byteball-*` names …) redirect to the files of the GitHub release set in
`content/settings/releases.yaml`. To publish a new version:

1. Publish the release on GitHub first (`byteball/obyte-gui-wallet`, or
   `byteball/testnet-releases` for testnet) — the site only links to its files.
2. In `content/settings/releases.yaml`, under `mainnet` (or `testnet`), set `version` and the
   `url` of every platform file that changed (`{github}` = https://github.com/byteball):

   ```yaml
   mainnet:
     version: 5.0.3
     files:
       - platform: macIntel
         url: '{github}/obyte-gui-wallet/releases/download/v5.0.3/Obyte-5.0.3.dmg'
       - platform: macArm
         url: '{github}/obyte-gui-wallet/releases/download/v5.0.3/Obyte-5.0.3-arm64.dmg'
       - platform: win64
         url: '{github}/obyte-gui-wallet/releases/download/v5.0.3/Obyte.Setup.5.0.3.exe'
       - platform: linux
         url: '{github}/obyte-gui-wallet/releases/download/v5.0.3/Obyte-5.0.3.AppImage'
       # win32 stays on its last build (v3.4.1) unless a new one is published
   ```

   Don't touch `aliases`: every download name points to a network + platform, so all of them
   follow the new URLs. The version also goes into the structured data of the home page.

3. Commit (a PR is fine) and deploy (`deploy/deploy.sh`, see [`deploy/README.md`](deploy/README.md)).
4. Check that the links open the new files, e.g.
   `curl -sI https://obyte.org/downloads/Obyte-win64.exe | grep -i location`, and download one.

The mobile apps (App Store / Google Play) are linked from `apps` in the same file and normally
don't change between releases.

## How it works

```
content/            pages (.mdx), lists and section data (YAML/MD), settings, media alt texts
public/media/       images (originals)
src/
  app/              routes: pages, /downloads/* and /discord redirects, sitemap, robots, llms.txt
  content/          loader: parses + validates the files (mdx/parse.ts, mdx/registry.ts, schema.ts),
                    page data, meta tags, JSON-LD
  blocks/           page sections (Hero, Article, Download …)
  content-blocks/   blocks inside sections (FlexBlock, CardGrid …) + RichText (markdown → React)
  widgets/          Header, MobileNav, Footer, TextcoinBanner …
  shared/           ui, lib, styles (pages.css: styles of the inner pages), assets
scripts/            content check, sitemap dates, link check, standalone start
tests/              int (Vitest), e2e (Playwright)
```

- **No JavaScript in content.** MDX is parsed into a markdown tree and validated against the
  component registry (`src/content/mdx/registry.ts`); nothing is evaluated. Each component
  element becomes the data object its React component renders.
- **Imports flow downwards:** `app → content → blocks / content-blocks / widgets → shared`
  (`eslint-plugin-boundaries`, `pnpm lint`).
- **Styling:** Tailwind for the layout, the home page and the components; the inner pages'
  content blocks render plain class names styled by `src/shared/styles/pages.css`.
- **Redirects:** `/downloads/*` (303 to the wallet release of `releases.yaml`, exact Location,
  `no-store`), `/discord` (303), `/terms.html`, `/privacy.html`, `/testnet.html`, `/home` (308),
  `/coin_info.json` (stats.obyte.org's JSON), `/milan*` (303), `/sitemap` → `/sitemap.xml`.
- **SEO:** meta tags and canonical per page, JSON-LD (Organization/WebSite/SoftwareApplication on
  `/`, FAQPage on `/faq`, BreadcrumbList), `sitemap.xml` (lastmod from git), `robots.txt`, `llms.txt`.

## Checks

| Command                         | What it checks                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `pnpm content:check`            | all content: MDX dialect, attributes, links, images (SVG safety, size), menu links                     |
| `pnpm lint`                     | ESLint incl. the architecture layers                                                                   |
| `pnpm test:int`                 | Vitest: MDX dialect and validation, link tokens, URL allow-list, textcoin links                        |
| `pnpm test:e2e`                 | Playwright against the built site (or `E2E_BASE_URL`): menus, textcoin, downloads, redirects, SEO …    |
| `pnpm check:links --base <url>` | every link, resource and `#anchor` of every page (exit 1 on internal problems)                         |
| `pnpm perf`                     | Lighthouse CI, median of 3 (`PERF_PRESET=desktop`): desktop 100 ×4; mobile 100 except performance ≥ 90 |
