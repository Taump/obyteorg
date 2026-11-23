/**
 * JSON-LD of public pages: FAQPage where the FAQ list is shown (from content/data/faq),
 * Organization / WebSite / SoftwareApplication on the
 * home page, BreadcrumbList on nested pages.
 */
import { absoluteUrl } from '@/shared/lib/siteUrl'

import type { PageData } from './pageData'
import { plainText } from './plainText'
import { pageDescription } from './pageMeta'

type JsonLd = Record<string, unknown>

const PLATFORM_NAMES = {
  win64: 'Windows',
  win32: 'Windows',
  macIntel: 'macOS',
  macArm: 'macOS',
  linux: 'Linux',
} as const

export function structuredData(pd: PageData, extra: { socialLinks: { link: string }[] }): JsonLd[] {
  const { page, settings, data } = pd
  const path = page.path ?? '/'
  const out: JsonLd[] = []

  if (path === '/') {
    const org = {
      '@type': 'Organization',
      '@id': absoluteUrl('/#organization'),
      name: 'Obyte',
      url: absoluteUrl('/'),
      logo: absoluteUrl('/icon2.png'),
      sameAs: [
        settings.githubUrl,
        settings.discordUrl,
        settings.telegramUrl,
        ...extra.socialLinks.map((s) => s.link),
      ].filter((u, i, all): u is string => !!u && /^https:/.test(u) && all.indexOf(u) === i),
    }
    const mainnet = data.releases?.mainnet
    const systems = [
      ...new Set((mainnet?.files ?? []).map((f) => PLATFORM_NAMES[f.platform])),
      ...(data.releases?.apps?.mainnet?.googlePlay ? ['Android'] : []),
      ...(data.releases?.apps?.mainnet?.appStore ? ['iOS'] : []),
    ]
    out.push(
      { '@context': 'https://schema.org', ...org },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: settings.siteTitle,
        url: absoluteUrl('/'),
        publisher: { '@id': org['@id'] },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Obyte wallet',
        applicationCategory: 'FinanceApplication',
        operatingSystem: systems.join(', ') || undefined,
        softwareVersion: mainnet?.version || undefined,
        downloadUrl: absoluteUrl('/#download'),
        description: pageDescription(page, settings),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        publisher: { '@id': org['@id'] },
      },
    )
  }

  if (data.faq.length) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: data.faq.map((q) => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: { '@type': 'Answer', text: plainText(q.answer, settings) },
      })),
    })
  }

  if (path !== '/') {
    // nested-docs breadcrumbs: the page and its ancestors; the home page is not a parent
    const crumbs = [{ label: 'Home', url: '/' }, ...(page.breadcrumbs ?? [])]
    out.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.label,
        item: absoluteUrl(c.url ?? '/'),
      })),
    })
  }
  return out
}
