import { getGlobal } from '@/content/loader'

/** /discord → 303 to the Discord invite of content/settings/site.yaml; static. */
export const dynamic = 'force-static'

export async function GET() {
  const { discordUrl } = getGlobal('site-settings')
  return new Response(null, {
    status: discordUrl ? 303 : 404,
    headers: discordUrl ? { Location: discordUrl, 'Cache-Control': 'no-store' } : {},
  })
}
