/**
 * Site-wide addresses of content/settings/site.yaml. A link in the content may start with a token
 * instead (`{explorer}/address/…`, `{github}/ocore`, `{discord}`); the page data and the layout
 * replace tokens with the configured addresses before rendering (content/pageData.ts).
 */
const SITE_LINK_TOKENS = {
  github: 'githubUrl',
  explorer: 'explorerUrl',
  testnetExplorer: 'testnetExplorerUrl',
  discord: 'discordUrl',
  telegram: 'telegramUrl',
} as const

export type SiteLinks = Partial<
  Record<(typeof SITE_LINK_TOKENS)[keyof typeof SITE_LINK_TOKENS], string | null>
>

const TOKEN = /^\{(\w+)\}(.*)$/s

/** `{github}/ocore` → `https://github.com/byteball/ocore`; other URLs (and unknown tokens) as they are. */
export function resolveSiteLink(url: string, links: SiteLinks): string {
  const m = TOKEN.exec(url)
  const key = m && SITE_LINK_TOKENS[m[1] as keyof typeof SITE_LINK_TOKENS]
  const base = key && links[key]
  return base ? base.replace(/\/+$/, '') + m![2] : url
}
