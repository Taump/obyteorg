import { notFound } from 'next/navigation'

import { getGlobal } from '@/content/loader'
import { resolveLinks } from '@/content/pageData'

/**
 * /downloads/<name> → 303 to the current build of the wallet. The name picks a network +
 * platform in content/settings/releases.yaml, so publishing a release only changes the
 * per-platform URL. Built at build time: exact Location (the request's query is not carried
 * over), no-store; an unknown name is a 404.
 */
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return (getGlobal('releases').aliases ?? []).map((a) => ({ file: a.filename }))
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
  // `{github}/…` → the address of site.yaml
  const releases = resolveLinks(getGlobal('releases'), getGlobal('site-settings'))
  const alias = releases.aliases?.find((a) => a.filename === file)
  const url =
    alias && releases[alias.network]?.files?.find((f) => f.platform === alias.platform)?.url
  if (!url) notFound()
  return new Response(null, {
    status: 303,
    headers: { Location: url, 'Cache-Control': 'no-store' },
  })
}
