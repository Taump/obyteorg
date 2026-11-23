/**
 * Last content change of every page, from git, before `next build` (the build may run where .git
 * is absent — Docker): content/.generated/dates.json { "content/pages/faq.mdx": ISO date }.
 *
 * A page's date = the newest commit touching the page file or what it shows: its `data="…"`
 * YAML files, the FAQ / events lists (FaqFeed, EventsFeed), releases (Download), team, timeline,
 * exchanges. Files without history (uncommitted, or no git) give no date — the sitemap then
 * leaves lastmod out rather than guessing.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const PAGES = path.join(ROOT, 'content/pages')
const OUT = path.join(ROOT, 'content/.generated/dates.json')

/** what a component shows besides its own attributes */
const COMPONENT_FILES: Record<string, string[]> = {
  FaqFeed: ['content/data/faq'],
  EventsFeed: ['content/data/events'],
  Download: ['content/settings/releases.yaml'],
  Team: ['content/data/team.yaml'],
  Timeline: ['content/data/timeline.yaml'],
  Exchanges: ['content/data/exchanges.yaml', 'content/data/coin-trackers.yaml'],
}

function lastCommit(paths: string[]): string | null {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', ...paths], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    return out || null
  } catch {
    return null // no git / no history
  }
}

// no repository here (e.g. inside the Docker build): keep the file made before the build
try {
  execFileSync('git', ['rev-parse', '--git-dir'], { cwd: ROOT, stdio: 'ignore' })
} catch {
  console.log(
    `content dates: no git here — ${fs.existsSync(OUT) ? 'keeping' : 'no'} ${path.relative(ROOT, OUT)}`,
  )
  process.exit(0)
}

const files: string[] = []
const walk = (dir: string) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true }))
    if (e.isDirectory()) walk(path.join(dir, e.name))
    else if (e.name.endsWith('.mdx')) files.push(path.join(dir, e.name))
}
walk(PAGES)

const dates: Record<string, string> = {}
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8')
  const deps = new Set([path.relative(ROOT, file)])
  for (const m of src.matchAll(/\bdata="([\w/-]+)"/g)) deps.add(`content/data/${m[1]}.yaml`)
  for (const [name, paths] of Object.entries(COMPONENT_FILES))
    if (new RegExp(`<${name}\\b`).test(src)) paths.forEach((p) => deps.add(p))
  const date = lastCommit([...deps].filter((p) => fs.existsSync(path.join(ROOT, p))))
  if (date) dates[path.relative(ROOT, file)] = date
}

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify(dates, null, 2) + '\n')
console.log(`✓ content dates: ${Object.keys(dates).length}/${files.length} pages dated from git`)
