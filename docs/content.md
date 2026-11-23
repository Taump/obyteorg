# Editing the content

All content is in the repository: change a file, open a PR, merge — the deploy builds the site
from it. `pnpm content:check` (also the first step of `pnpm build`) validates everything and
reports problems as `file:line  message`; a broken file never reaches the live site.

```
content/
  pages/          one .mdx per page; the folder tree is the URL tree
  data/           lists (YAML / one .md per item) and the YAML data of some sections
  settings/       site.yaml, header.yaml, footer.yaml, releases.yaml
  media.yaml      alt texts of the images in public/media
public/media/     images (originals; the server converts them to AVIF/WebP and resizes)
```

## Pages

`content/pages/platform/iot/index.mdx` → `/platform/iot` (a page with sub-pages is a folder with
`index.mdx`); `content/pages/faq.mdx` → `/faq`; `content/pages/index.mdx` → `/`.

```mdx
---
title: Oracles # page title (<title> is "Oracles | <site title>")
description: Reference oracles… # meta description; the site default when left out
menuTitle: Oracles # breadcrumbs (optional)
sitemapPriority: 0.8 # optional
ogImage: /media/…png # share image (optional)
published: false # draft: not built, not in the sitemap (optional)
---

<Article variant="oracles-wrap">

Markdown text, [links](/platform/smart-contracts), **bold**, lists, tables, code blocks…

</Article>
```

A page is a sequence of **sections** (top level). Everything else goes inside a section. Adding a
page to the menu is a separate step: `content/settings/header.yaml` (`pnpm content:check` verifies
that menu links lead to published pages).

### The MDX dialect

MDX here is markup only — no JavaScript:

- no `import` / `export`, no `{expressions}` (write `\{` for a literal brace in text; code blocks
  are verbatim);
- components only from the list below, with **literal string attributes** (`lines="2"`, flags
  like `white`); lists and nested objects go into child elements or YAML;
- HTML only for inline formatting markdown can't express: `<a href target>`, `<sub>`, `<sup>`,
  `<br />`, `<u>`, `<s>`, `<small>`;
- images: `![alt](/media/x.png)`, or `<Image src="/media/x.png" variant="info-img" />` with a
  style class;
- e-mail addresses of site.yaml: `<Email kind="contact" />`, `<Email kind="jobs" />`;
- site addresses in links: `{github}`, `{explorer}`, `{testnetExplorer}`, `{discord}`, `{telegram}`
  (e.g. `[core]({github}/ocore)`) — replaced with site.yaml values; only in links.

### Sections (top level of a page)

| Component                                                 | Attributes                                                                   | Content                |
| --------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| `<Article variant>`                                       | `variant` = page style (`faq-wrap`, `oracles-wrap` …), `anchor`              | markdown + blocks      |
| `<TextWide variant>`                                      | `iot-wrap`, `poc-wrap`, `developers-wide`, `obyte-foundation-wide`; `anchor` | markdown + blocks      |
| `<Download network data>`                                 | `mainnet`/`testnet`, `data="testnet/download"` (title, images, links)        | markdown               |
| `<Hero>`, `<Technology>`, `<Independent>`, `<BigChanges>` | `data="home/…"`                                                              | (Technology: markdown) |
| `<Timeline title>`, `<Team title>`, `<Exchanges title>`   | lists come from `content/data`                                               | markdown               |

`anchor="download"` gives the section an id for links like `/#download`.

### Blocks (inside sections)

| Component                                                | Attributes                                                                                            | Content / children                                                                                   |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `<PageIntro title leadStyle>`                            | `leadStyle`: `subBlock`, `subTitle`, `subBlockText`                                                   | `<Lead>…</Lead>`, `<Text style="block\|blockInline\|paragraph\|plain\|small\|subParagraph">…</Text>` |
| `<FlexBlock>`                                            | `image`, `mobileImage`, `imagePosition="left\|right"`, `kind`, `modifiers`, `imageStyle`, `plainText` | markdown                                                                                             |
| `<DevCallout title>`                                     | `image`, `category`, `white`                                                                          | markdown                                                                                             |
| `<CardGrid variant="linkCards\|linkLists\|text">`        |                                                                                                       | `<Card title image link modifier linkRows>` (markdown, `<CardLink label link description />`)        |
| `<WhiteBox>`                                             | `label`, `plainText`                                                                                  | markdown                                                                                             |
| `<Box style>`, `<InnerBox style>`                        | wrapper style (`text-block`, `p.bullet` …)                                                            | markdown                                                                                             |
| `<Columns>`                                              |                                                                                                       | `<Column width="7" video="youtube:ID">` markdown                                                     |
| `<MediaList variant="resources\|attestors\|blackbytes">` |                                                                                                       | `<Item image title link>` markdown                                                                   |
| `<EventList variant>`                                    |                                                                                                       | `<Event date title images video>` markdown                                                           |
| `<DistributionTable data>`                               | YAML: intro, headings, rows                                                                           |                                                                                                      |
| `<VideoEmbed video="youtube:ID" title>`                  |                                                                                                       |                                                                                                      |
| `<Spacer lines="2" paragraph />`                         | empty lines between parts of a page                                                                   |                                                                                                      |
| `<FaqFeed />`, `<EventsFeed />`                          | show `content/data/faq`, `content/data/events`                                                        |                                                                                                      |

The full schema (allowed values of every attribute): `src/content/mdx/registry.ts`.

## Lists

| File                                                                       | Item                                                                                            |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `data/faq/NN-slug.md`                                                      | front matter `question`; body = the answer (markdown). Order = file name.                       |
| `data/events/YYYY-MM-slug.md`                                              | `date: 2020-04`, `title`, `images: [/media/…]`, `video: youtube:ID`, `order` (same month); body |
| `data/timeline.yaml`                                                       | `- date: 2016-09` / `title` (sorted by date)                                                    |
| `data/team.yaml`                                                           | `name`, `role`, `photo`, `links: [{ icon: github\|linkedin\|link, url }]`                       |
| `data/exchanges.yaml`, `data/coin-trackers.yaml`, `data/social-links.yaml` | `name`, `link`, logo/icon images                                                                |

`showOnSite: false` hides an item without deleting it.

## A new wallet release

`content/settings/releases.yaml`: set `version` and the file URLs of the network:

```yaml
mainnet:
  version: 5.0.3
  files:
    - platform: win64
      url: "{github}/obyte-gui-wallet/releases/download/v5.0.3/Obyte.Setup.5.0.3.exe"
    …
```

The `/downloads/<name>` links (`aliases`, including the `Byteball-*` names) follow
automatically; the version also goes into the structured data of the home page.

## Images

Put the original into `public/media/…` (≤ 2560 px; no resizing or WebP needed) and its alt text
into `content/media.yaml` (or `alt="…"` where it is used). SVGs must not contain scripts, event
handlers or external links — `pnpm content:check` rejects them.
