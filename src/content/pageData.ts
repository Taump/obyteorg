/**
 * Everything a public page renders from: the page, its sections with `{github}`-style link
 * tokens resolved, the list data its sections show, and the site settings. Shared by the HTML
 * page, its metadata, its markdown twin and the llms.txt indexes.
 */
import { cache } from 'react'

import type { BlockData } from '@/blocks/RenderBlocks'
import { resolveSiteLink, type SiteLinks } from '@/shared/lib/siteLinks'

import { getGlobal, getList, getPageByPath } from './loader'
import type { Layout } from './types'

/** Object keys that hold a link target (block fields, YAML data). */
const LINK_KEYS = new Set(['link', 'url', 'href'])

/**
 * Copy of `value` with tokens resolved in link fields only: `link`/`url`/`href` keys, markdown
 * links and `<a href>`. Text and code (e.g. `{ var… }` examples on /developers) stay verbatim.
 */
export function resolveLinks<T>(value: T, links: SiteLinks): T {
  if (Array.isArray(value)) return value.map((v) => resolveLinks(v, links)) as T
  if (!value || typeof value !== 'object') return value
  const node = value as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(node)) {
    if (k === 'position') out[k] = v
    else if (LINK_KEYS.has(k) && typeof v === 'string') out[k] = resolveSiteLink(v, links)
    else if (k === 'attributes' && node.name === 'a' && Array.isArray(v))
      out[k] = v.map((a: { name?: string; value?: unknown }) =>
        a.name === 'href' && typeof a.value === 'string'
          ? { ...a, value: resolveSiteLink(a.value, links) }
          : a,
      )
    else out[k] = resolveLinks(v, links)
  }
  return out as T
}

/** List data some sections show — loaded only when the page has such a section/block. */
function blockData(layout: Layout): BlockData {
  const has = (type: string) => layout.some((b) => b.blockType === type)
  // content blocks nested in the rich text of a section
  const json = JSON.stringify(layout)
  const hasContent = (type: string) => json.includes(`"blockType":"${type}"`)
  return {
    teamMembers: has('team') ? getList('team-members') : [],
    exchanges: has('exchanges') ? getList('exchanges') : [],
    coinTrackers: has('exchanges') ? getList('coin-trackers') : [],
    timelineEvents: has('timeline') ? getList('timeline-events') : [],
    events: hasContent('eventsFeed') ? getList('events') : [],
    faq: hasContent('faqFeed') ? getList('faq') : [],
    releases: has('download') ? getGlobal('releases') : null,
  }
}

export const getPageData = cache((path: string) => {
  const page = getPageByPath(path)
  if (!page) return null
  const settings = getGlobal('site-settings')
  return {
    page,
    settings,
    blocks: resolveLinks(page.layout, settings),
    data: resolveLinks(blockData(page.layout), settings),
  }
})

export type PageData = NonNullable<ReturnType<typeof getPageData>>
