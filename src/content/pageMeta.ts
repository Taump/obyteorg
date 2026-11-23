/**
 * <head> of public pages: title, description, canonical URL, Open Graph and Twitter tags (each
 * page's own description; a page may set its own share image).
 */
import type { Metadata } from 'next'

import type { Media, Page, SiteSetting } from '@/content/types'
import { absoluteUrl } from '@/shared/lib/siteUrl'

/** Default share images (stable URLs: other sites link to them). */
const DEFAULT_OG_IMAGE = '/user/themes/obyte/assets/phone-shadow.png'
const DEFAULT_TWITTER_IMAGE = '/user/themes/obyte/assets/phone-twitter.png'

/** "Smart Contracts | Obyte — …"; the home page has the site title only. */
const pageTitle = (page: Page, settings: SiteSetting) =>
  page.path === '/'
    ? settings.siteTitle
    : `${page.meta?.title || page.title} | ${settings.siteTitle}`

export const pageDescription = (page: Page, settings: SiteSetting) =>
  page.meta?.description || settings.defaultDescription

const mediaUrl = (m: Media | null | undefined) => (m?.url ? absoluteUrl(m.url) : null)

export function pageMetadata(page: Page, settings: SiteSetting): Metadata {
  const path = page.path ?? '/'
  const url = absoluteUrl(path)
  const title = pageTitle(page, settings)
  const description = pageDescription(page, settings)
  const ogDescription = page.meta?.ogDescription || description
  const image = mediaUrl(page.meta?.image) ?? mediaUrl(settings.defaultOgImage)
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title,
      description: ogDescription,
      url,
      images: [image ?? absoluteUrl(DEFAULT_OG_IMAGE)],
    },
    twitter: {
      card: 'summary_large_image',
      site: settings.twitterSite || undefined,
      title,
      description,
      images: [image ?? absoluteUrl(DEFAULT_TWITTER_IMAGE)],
    },
  }
}
