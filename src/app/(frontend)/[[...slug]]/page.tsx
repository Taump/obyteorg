import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { getPageData } from '@/content/pageData'
import { pageMetadata } from '@/content/pageMeta'
import { getList, getPublishedPaths } from '@/content/loader'
import { structuredData } from '@/content/structuredData'
import { siteContext } from '@/shared/lib/siteContext'
import { JsonLd } from '@/shared/ui/JsonLd'

type Props = { params: Promise<{ slug?: string[] }> }

const toPath = (slug?: string[]) => `/${(slug ?? []).map(decodeURIComponent).join('/')}`

/** Every published page is pre-rendered at build time; any other URL is a 404. */
export const dynamicParams = false

export async function generateStaticParams() {
  return (await getPublishedPaths()).map((path) => ({ slug: path.split('/').filter(Boolean) }))
}

async function load({ params }: Props) {
  const { slug } = await params
  return getPageData(toPath(slug))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const pd = await load(props)
  return pd ? pageMetadata(pd.page, pd.settings) : {}
}

export default async function Page(props: Props) {
  const pd = await load(props)
  if (!pd) notFound()
  const { settings, blocks, data } = pd
  // site settings needed deep inside rendered rich text (e-mail links, explorer links)
  Object.assign(siteContext(), {
    contactEmail: settings.contactEmail,
    jobsEmail: settings.jobsEmail,
    explorerUrl: settings.explorerUrl ?? '',
  })
  const jsonLd = structuredData(pd, { socialLinks: await getList('social-links') })
  return (
    <>
      {jsonLd.map((d, i) => (
        <JsonLd key={i} data={d} />
      ))}
      <RenderBlocks blocks={blocks} data={data} />
    </>
  )
}
