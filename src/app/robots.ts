import type { MetadataRoute } from 'next'

import { absoluteUrl } from '@/shared/lib/siteUrl'

/** Everything is public; AI crawlers are explicitly welcome (see also /llms.txt). */
const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: AI_BOTS, allow: '/' },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
