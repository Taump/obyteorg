/**
 * Validates all content with the site's own loader (the same code `next build` runs):
 * every page (front matter, MDX vocabulary, attributes, media, links), settings and lists, plus
 * cross-checks: internal menu links lead to published pages, anchors are unique per page.
 *
 *   pnpm content:check                     # content/ of this project
 *
 * Exits 1 with "file:line  problem" lines.
 */
import fs from 'node:fs'
import path from 'node:path'

import { imageSize } from 'image-size'
import DOMPurify from 'isomorphic-dompurify'

import { ContentError, type ContentIssue } from '../src/content/mdx/parse'
import { getAllPages, getGlobal, getList } from '../src/content/loader'
import { CONTENT_DIR, PUBLIC_DIR } from '../src/content/paths'

const issues: ContentIssue[] = []
const run = (fn: () => unknown) => {
  try {
    return fn()
  } catch (e) {
    if (e instanceof ContentError) issues.push(...e.issues)
    else issues.push({ file: '(loader)', message: (e as Error).stack ?? String(e) })
    return undefined
  }
}

const pages = (run(getAllPages) as ReturnType<typeof getAllPages> | undefined) ?? []
for (const name of ['site-settings', 'header', 'footer', 'releases'] as const)
  run(() => getGlobal(name))
for (const name of [
  'team-members',
  'exchanges',
  'coin-trackers',
  'social-links',
  'timeline-events',
  'events',
  'faq',
] as const)
  run(() => getList(name))

// anchors unique per page
for (const p of pages) {
  const seen = new Set<string>()
  for (const b of p.layout as { anchorId?: string | null }[])
    if (b.anchorId) {
      if (seen.has(b.anchorId))
        issues.push({ file: p.file, message: `duplicate anchor "${b.anchorId}"` })
      seen.add(b.anchorId)
    }
}

// internal links of the menu/footer lead to published pages (only meaningful when pages loaded)
const published = new Set(pages.filter((p) => p.published).map((p) => p.path))
const header = run(() => getGlobal('header')) as ReturnType<typeof getGlobal<'header'>> | undefined
const footer = run(() => getGlobal('footer')) as ReturnType<typeof getGlobal<'footer'>> | undefined
const internal = (link: string) => link.startsWith('/') && !link.startsWith('//')
const checkLink = (file: string, link: string) => {
  if (!pages.length) return
  const p = link.split(/[?#]/)[0].replace(/\/$/, '') || '/'
  if (internal(link) && !published.has(p) && !/\.\w+$/.test(p) && !p.startsWith('/downloads/'))
    issues.push({ file, message: `link to ${link}: no published page` })
}
for (const item of header?.navItems ?? []) {
  checkLink('content/settings/header.yaml', item.link)
  for (const c of item.children ?? []) checkLink('content/settings/header.yaml', c.link)
}
for (const col of footer?.columns ?? [])
  for (const l of col.links ?? []) checkLink('content/settings/footer.yaml', l.link)

// ---------------------------------------------------------------- public/media
const MAX_SIDE = 2560
/** what an SVG must not contain (DOMPurify would remove it): scripts, embedded documents, handlers */
const DANGEROUS_TAGS = /^(script|foreignobject|iframe|object|embed|audio|video|handler|listener)$/i
const mediaRoot = path.join(PUBLIC_DIR, 'media')
const mediaFiles = fs.existsSync(mediaRoot)
  ? fs
      .readdirSync(mediaRoot, { recursive: true })
      .map(String)
      .filter((f) => /\.\w+$/.test(f))
  : []
const notes: string[] = []
for (const f of mediaFiles) {
  const file = `public/media/${f}`
  const abs = path.join(mediaRoot, f)
  if (f.endsWith('.svg')) {
    DOMPurify.sanitize(fs.readFileSync(abs, 'utf8'), {
      USE_PROFILES: { svg: true, svgFilters: true },
    })
    for (const r of DOMPurify.removed as { element?: Element; attribute?: Attr }[]) {
      const tag = r.element?.nodeName
      const attr = r.attribute
      if (tag && DANGEROUS_TAGS.test(tag))
        issues.push({ file, message: `SVG contains <${tag.toLowerCase()}>` })
      else if (attr && /^on/i.test(attr.name))
        issues.push({ file, message: `SVG has an event handler ${attr.name}` })
      else if (attr && /href$/i.test(attr.name) && !attr.value.startsWith('#'))
        issues.push({ file, message: `SVG links to ${attr.value.slice(0, 60)}` })
    }
  } else {
    try {
      const { width = 0, height = 0 } = imageSize(fs.readFileSync(abs))
      if (width > MAX_SIDE || height > MAX_SIDE)
        issues.push({
          file,
          message: `${width}×${height}: larger than ${MAX_SIDE}px (resize the original)`,
        })
    } catch {
      issues.push({ file, message: 'not a readable image' })
    }
  }
}
// files nothing refers to (a warning: maybe a leftover, maybe linked from outside)
const texts = [CONTENT_DIR, path.join(process.cwd(), 'src')]
  .flatMap((dir) => fs.readdirSync(dir, { recursive: true }).map((f) => path.join(dir, String(f))))
  .filter((f) => /\.(mdx|md|yaml|tsx?|css)$/.test(f) && fs.statSync(f).isFile())
  .map((f) => fs.readFileSync(f, 'utf8'))
  .join('\n')
const unused = mediaFiles.filter((f) => !texts.includes(`/media/${f}`))
if (unused.length)
  notes.push(
    `${unused.length} file(s) in public/media are not referenced: ${unused.slice(0, 5).join(', ')}${unused.length > 5 ? ' …' : ''}`,
  )

for (const n of notes) console.warn(`⚠ ${n}`)
if (issues.length) {
  console.error(
    issues.map((i) => `${i.file}${i.line ? `:${i.line}` : ''}  ${i.message}`).join('\n'),
  )
  console.error(`\n✗ ${issues.length} content problem(s)`)
  process.exit(1)
}
console.log(
  `✓ content: ${pages.length} pages (${published.size} published), settings, lists and ${mediaFiles.length} media files valid`,
)
