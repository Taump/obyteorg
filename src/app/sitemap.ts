import type { MetadataRoute } from 'next'

import { getPublishedPages } from '@/content/loader'
import { absoluteUrl } from '@/shared/lib/siteUrl'

/**
 * /sitemap.xml: every published page. lastmod = last content change (content/.generated/dates.json,
 * from git before the build); left out when unknown.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return (await getPublishedPages()).map((p) => ({
    url: absoluteUrl(p.path),
    ...(p.updatedAt ? { lastModified: p.updatedAt } : {}),
    priority: p.sitemapPriority ?? 0.8,
  }))
}
