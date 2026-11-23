/**
 * Read side of the content files (server only, build time: every page is pre-rendered).
 * getPageByPath, getPublishedPages, getGlobal, getList read content/. Invalid content throws
 * ContentError (file:line + problem), so a
 * broken file fails `next build` and `pnpm content:check`.
 */
import fs from 'node:fs'
import path from 'node:path'

import type { Root } from 'mdast'
import { cache } from 'react'
import { parse as parseYaml } from 'yaml'
import type { z } from 'zod'

import { ContentError, parseMarkdown, parsePage, splitFrontMatter } from './mdx/parse'
import { CONTENT_DIR, PROJECT_ROOT } from './paths'
import {
  listSchemas,
  MARKDOWN_LISTS,
  pageFrontMatter,
  settingsSchemas,
  type ListName,
  type SettingsName,
} from './schema'
import type {
  CoinTracker,
  Event,
  Exchange,
  Faq,
  Footer,
  Header,
  Layout,
  Page,
  Release,
  SiteSetting,
  SocialLink,
  TeamMember,
  TimelineEvent,
} from './types'

const PAGES_DIR = path.join(CONTENT_DIR, 'pages')
const rel = (file: string) => path.relative(PROJECT_ROOT, file)

/** "YYYY-MM" → noon UTC on the 1st of the month (an unambiguous date in every time zone). */
const monthDate = (ym: string) => `${ym}-01T12:00:00.000Z`

function zodIssues(file: string, error: z.ZodError) {
  return new ContentError(
    error.issues.map((i) => ({ file, message: `${i.path.join('.') || '(root)'}: ${i.message}` })),
  )
}

function parseWith<S extends z.ZodType>(schema: S, value: unknown, file: string): z.output<S> {
  const r = schema.safeParse(value)
  if (!r.success) throw zodIssues(file, r.error)
  return r.data
}

const readYaml = (file: string): unknown => {
  try {
    return parseYaml(fs.readFileSync(file, 'utf8'))
  } catch (e) {
    throw new ContentError([{ file: rel(file), message: (e as Error).message }])
  }
}

const dates = cache((): Record<string, string> => {
  const file = path.join(CONTENT_DIR, '.generated', 'dates.json')
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {}
})

// ------------------------------------------------------------------ page index

type PageFile = { path: string; file: string }

/** content/pages: `index.mdx` is its folder's URL, `name.mdx` is `<folder>/name`. */
const pageFiles = cache((): PageFile[] => {
  const out: PageFile[] = []
  const issues: { file: string; message: string }[] = []
  const walk = (dir: string, url: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full, `${url}/${entry.name}`)
      else if (entry.name.endsWith('.mdx')) {
        const name = entry.name.slice(0, -4)
        if (!/^[a-z0-9-]+$/.test(name))
          issues.push({ file: rel(full), message: 'file names are lowercase-with-dashes' })
        out.push({ path: name === 'index' ? url || '/' : `${url}/${name}`, file: full })
      } else if (!entry.name.startsWith('.'))
        issues.push({ file: rel(full), message: 'only .mdx files belong in content/pages' })
    }
  }
  walk(PAGES_DIR, '')
  const seen = new Map<string, string>()
  for (const p of out) {
    const other = seen.get(p.path)
    if (other) issues.push({ file: rel(p.file), message: `same URL ${p.path} as ${rel(other)}` })
    seen.set(p.path, p.file)
  }
  if (issues.length) throw new ContentError(issues)
  return out.sort((a, b) => a.path.localeCompare(b.path))
})

type ParsedPage = Omit<Page, 'breadcrumbs'> & { published: boolean }

const loadPage = cache((file: string, urlPath: string): ParsedPage => {
  const source = fs.readFileSync(file, 'utf8')
  const { data, tree } = parsePage(source, file)
  const fm = parseWith(pageFrontMatter, data, rel(file))
  const layout = (tree.children as { data?: { block?: unknown } }[]).map(
    (n) => n.data?.block,
  ) as Layout
  return {
    path: urlPath,
    file: rel(file),
    title: fm.title,
    layout,
    menuTitle: fm.menuTitle ?? null,
    sitemapPriority: fm.sitemapPriority ?? null,
    meta: {
      title: fm.metaTitle ?? null,
      description: fm.description,
      ogDescription: fm.ogDescription ?? null,
      image: fm.ogImage ?? null,
    },
    updatedAt: dates()[rel(file)] ?? null,
    published: fm.published,
  }
})

/** All pages (drafts too), parsed and validated; reports the problems of every page at once. */
export const getAllPages = cache((): ParsedPage[] => {
  const issues: ContentError['issues'] = []
  const pages: ParsedPage[] = []
  for (const p of pageFiles()) {
    try {
      pages.push(loadPage(p.file, p.path))
    } catch (e) {
      if (!(e instanceof ContentError)) throw e
      issues.push(...e.issues)
    }
  }
  if (issues.length) throw new ContentError(issues)
  return pages
})

type PageSummary = Pick<Page, 'path' | 'title' | 'updatedAt' | 'sitemapPriority' | 'meta'>

/** Published pages (static params, sitemap, llms.txt, markdown twins), ordered by URL. */
export const getPublishedPages = cache((): PageSummary[] =>
  getAllPages().filter((p) => p.published),
)

export const getPublishedPaths = cache((): string[] => getPublishedPages().map((p) => p.path))

/** A published page by URL path, with breadcrumbs (ancestors that exist, this page last). */
export const getPageByPath = cache((urlPath: string): Page | null => {
  const pages = getAllPages()
  const page = pages.find((p) => p.path === urlPath && p.published)
  if (!page) return null
  const segments = urlPath.split('/').filter(Boolean)
  const breadcrumbs = segments
    .map((_, i) => '/' + segments.slice(0, i + 1).join('/'))
    .map((url) => pages.find((p) => p.path === url && p.published))
    .filter((p): p is ParsedPage => Boolean(p))
    .map((p) => ({ url: p.path, label: p.menuTitle || p.title }))
  const { published: _, ...rest } = page
  return { ...rest, breadcrumbs }
})

// ------------------------------------------------------------------ settings

type Globals = { header: Header; footer: Footer; releases: Release; site: SiteSetting }
const GLOBAL_FILES: Record<string, SettingsName> = {
  header: 'header',
  footer: 'footer',
  releases: 'releases',
  'site-settings': 'site',
}
type GlobalSlug = 'header' | 'footer' | 'releases' | 'site-settings'
type GlobalOf<S extends GlobalSlug> = S extends 'site-settings'
  ? SiteSetting
  : Globals[S & keyof Globals]

/** content/settings/<name>.yaml ('site-settings' → site.yaml). */
export const getGlobal = cache(<S extends GlobalSlug>(slug: S): GlobalOf<S> => {
  const name = GLOBAL_FILES[slug]
  const file = path.join(CONTENT_DIR, 'settings', `${name}.yaml`)
  if (!fs.existsSync(file)) throw new ContentError([{ file: rel(file), message: 'missing file' }])
  return { id: name, ...parseWith(settingsSchemas[name], readYaml(file), rel(file)) } as GlobalOf<S>
})

// ------------------------------------------------------------------ lists

type Lists = {
  'team-members': TeamMember
  exchanges: Exchange
  'coin-trackers': CoinTracker
  'social-links': SocialLink
  'timeline-events': TimelineEvent
  events: Event
  faq: Faq
}
const LIST_FILES: Record<keyof Lists, ListName> = {
  'team-members': 'team',
  exchanges: 'exchanges',
  'coin-trackers': 'coin-trackers',
  'social-links': 'social-links',
  'timeline-events': 'timeline',
  events: 'events',
  faq: 'faq',
}

function readList(name: ListName): (Record<string, unknown> & { id: string })[] {
  const schema = listSchemas[name] as z.ZodType<Record<string, unknown>>
  const bodyField = MARKDOWN_LISTS[name]
  if (bodyField) {
    const dir = path.join(CONTENT_DIR, 'data', name)
    if (!fs.existsSync(dir)) return []
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .sort()
      .map((f) => {
        const file = path.join(dir, f)
        const { data, body } = splitFrontMatter(fs.readFileSync(file, 'utf8'), rel(file))
        const tree: Root | null = body.trim() ? parseMarkdown(body, rel(file)) : null
        return {
          id: f.slice(0, -3),
          ...parseWith(schema, { ...data, [bodyField]: tree }, rel(file)),
        }
      })
  }
  const file = path.join(CONTENT_DIR, 'data', `${name}.yaml`)
  if (!fs.existsSync(file)) return []
  const items = readYaml(file)
  if (!Array.isArray(items))
    throw new ContentError([{ file: rel(file), message: 'expected a YAML list' }])
  return items.map((item, i) => ({
    id: `${name}-${i + 1}`,
    ...parseWith(schema, item, `${rel(file)} [${i + 1}]`),
  }))
}

/** Items of a list shown on the site, in their order (events: newest first). */
export const getList = cache(<S extends keyof Lists>(slug: S): Lists[S][] => {
  const name = LIST_FILES[slug]
  let items = readList(name).filter((i) => i.showOnSite !== false)
  if (name === 'timeline' || name === 'events')
    items = items.map((i) => ({ ...i, date: monthDate(i.date as string) }))
  if (name === 'timeline')
    items = [...items].sort((a, b) => String(a.date).localeCompare(String(b.date)))
  if (name === 'events')
    // newest first; same month: `order`, then file name
    items = [...items].sort(
      (a, b) =>
        String(b.date).localeCompare(String(a.date)) ||
        Number(a.order ?? 0) - Number(b.order ?? 0) ||
        a.id.localeCompare(b.id),
    )
  return items as unknown as Lists[S][]
})
