import { llmsTxt } from '@/content/llms'

/** https://llmstxt.org index for AI agents (static, rebuilt when pages change). */
export const dynamic = 'force-static'

export async function GET() {
  return new Response(await llmsTxt(), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      // for AI agents, not search results
      'X-Robots-Tag': 'noindex',
    },
  })
}
