/**
 * Link check of the built site: every page from the sitemap, every link and resource on it
 * (<a href>, <img src/srcset>, <link href>, <script src>, CSS url()s, <object data>), and every
 * #fragment of an internal link must exist as an id on its page. Internal problems (a broken
 * page, link, resource or anchor) exit 1; external links are reported only (some sites refuse
 * bots — check those by hand).
 *
 *   pnpm build && pnpm start
 *   pnpm check:links                          # http://localhost:3000
 *   pnpm check:links --base https://staging.obyte.org [--no-external]
 */
import { parseArgs } from 'node:util'

import { JSDOM } from 'jsdom'

const { values: args } = parseArgs({
  options: {
    base: { type: 'string', default: 'http://localhost:3000' },
    'no-external': { type: 'boolean', default: false },
    concurrency: { type: 'string', default: '8' },
  },
})
const BASE = args.base!.replace(/\/$/, '')
const ORIGIN = new URL(BASE).origin
const UA = 'Mozilla/5.0 (compatible; obyte-link-check)'

type Result = { status: number; location?: string; error?: string }
const cache = new Map<string, Promise<Result>>()
/** url → pages it appears on */
const seenOn = new Map<string, Set<string>>()
/** internal page path → anchors linked to it → pages linking */
const anchorsTo = new Map<string, Map<string, Set<string>>>()
/** page path → ids on it */
const idsOn = new Map<string, Set<string>>()

async function fetchStatus(url: string): Promise<Result> {
  const attempt = async (method: 'HEAD' | 'GET') => {
    const res = await fetch(url, {
      method,
      redirect: 'manual',
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(20_000),
    })
    await res.body?.cancel()
    return { status: res.status, location: res.headers.get('location') ?? undefined }
  }
  try {
    const head = await attempt('HEAD')
    // many servers don't implement HEAD properly
    return head.status === 405 || head.status === 403 || head.status === 404
      ? await attempt('GET')
      : head
  } catch (e) {
    return { status: 0, error: (e as Error).message }
  }
}

const check = (url: string) => {
  if (!cache.has(url)) cache.set(url, fetchStatus(url))
  return cache.get(url)!
}

function collect(page: string, html: string) {
  const doc = new JSDOM(html, { url: BASE + page }).window.document
  const urls = new Set<string>()
  const add = (raw: string | null | undefined) => {
    if (!raw) return
    try {
      const u = new URL(raw, BASE + page)
      if (!/^https?:$/.test(u.protocol)) return
      if (u.origin === ORIGIN && u.hash.length > 1) {
        const target = u.pathname.replace(/\/$/, '') || '/'
        const id = decodeURIComponent(u.hash.slice(1))
        // #textcoin?… is the textcoin claim link (client-side), not an anchor
        if (!id.startsWith('textcoin')) {
          if (!anchorsTo.has(target)) anchorsTo.set(target, new Map())
          const m = anchorsTo.get(target)!
          if (!m.has(id)) m.set(id, new Set())
          m.get(id)!.add(page)
        }
      }
      u.hash = ''
      urls.add(u.toString())
    } catch {
      urls.add(`invalid:${raw}`)
    }
  }
  idsOn.set(page, new Set(Array.from(doc.querySelectorAll('[id]')).map((e) => e.id)))
  doc.querySelectorAll('a[href]').forEach((a) => add(a.getAttribute('href')))
  doc.querySelectorAll('link[href]').forEach((l) => add(l.getAttribute('href')))
  doc
    .querySelectorAll('script[src], img[src], iframe[src]')
    .forEach((e) => add(e.getAttribute('src')))
  doc.querySelectorAll('object[data]').forEach((e) => add(e.getAttribute('data')))
  doc.querySelectorAll('img[srcset]').forEach((e) =>
    e
      .getAttribute('srcset')!
      .split(',')
      .forEach((c) => add(c.trim().split(/\s+/)[0])),
  )
  doc.querySelectorAll('[style*="url("]').forEach((e) => {
    for (const m of e.getAttribute('style')!.matchAll(/url\((['"]?)([^'")]+)\1\)/g)) add(m[2])
  })
  for (const u of urls) {
    if (!seenOn.has(u)) seenOn.set(u, new Set())
    seenOn.get(u)!.add(page)
  }
  return urls
}

async function pool<T>(items: T[], n: number, fn: (item: T) => Promise<void>) {
  const queue = [...items]
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (queue.length) await fn(queue.shift()!)
    }),
  )
}

const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text()
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
console.log(`${pages.length} pages from the sitemap`)

const cssUrls = new Set<string>()
const problems: string[] = []
await pool(pages, Number(args.concurrency), async (page) => {
  const res = await fetch(BASE + page)
  if (res.status !== 200) problems.push(`INTERNAL page ${res.status} ${page} (in the sitemap)`)
  collect(page, await res.text())
})

// anchors: an internal #fragment must exist on its (sitemap) page
for (const [target, ids] of anchorsTo) {
  const on = idsOn.get(target)
  if (!on) continue // not a page of the sitemap: its own status is checked below
  for (const [id, from] of ids)
    if (!on.has(id))
      problems.push(
        `INTERNAL anchor ${target}#${id} missing  ← ${[...from].slice(0, 3).join(', ')}`,
      )
}

// url()s inside the stylesheets (fonts, backgrounds)
for (const css of [...seenOn.keys()].filter((u) => u.startsWith(ORIGIN) && u.endsWith('.css'))) {
  const text = await (await fetch(css)).text()
  for (const m of text.matchAll(/url\((['"]?)([^'")]+)\1\)/g)) {
    if (!m[2].startsWith('data:')) cssUrls.add(new URL(m[2], css).toString())
  }
}
for (const u of cssUrls) {
  if (!seenOn.has(u)) seenOn.set(u, new Set(['(css)']))
}

const all = [...seenOn.keys()]
const internal = all.filter((u) => u.startsWith(ORIGIN))
const external = args['no-external'] ? [] : all.filter((u) => !u.startsWith(ORIGIN))
const anchorCount = [...anchorsTo.values()].reduce((n, m) => n + m.size, 0)
console.log(
  `${internal.length} internal and ${external.length} external URLs, ${anchorCount} internal anchors`,
)

await pool([...internal, ...external], Number(args.concurrency), async (url) => {
  if (url.startsWith('invalid:')) {
    problems.push(`invalid URL ${url.slice(8)}`)
    return
  }
  const r = await check(url)
  const isInternal = url.startsWith(ORIGIN)
  const ok =
    (r.status >= 200 && r.status < 300) ||
    // redirects are fine: /downloads/*, /discord, external sites moving to https …
    (r.status >= 300 && r.status < 400 && !!r.location)
  if (!ok) {
    const where = [...seenOn.get(url)!].slice(0, 3).join(', ')
    problems.push(
      `${isInternal ? 'INTERNAL' : 'external'} ${r.status || r.error} ${url.replace(ORIGIN, '')}  ← ${where}`,
    )
  }
})

problems.sort()
for (const p of problems) console.log(`✗ ${p}`)
const internalProblems = problems.filter((p) => p.startsWith('INTERNAL') || p.startsWith('invalid'))
console.log(
  `\n${internalProblems.length} internal problems, ${problems.length - internalProblems.length} external`,
)
process.exit(internalProblems.length ? 1 : 0)
