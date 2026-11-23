/** /llms.txt (https://llmstxt.org): what Obyte is + every page with its description. */
import { absoluteUrl } from '@/shared/lib/siteUrl'

import { getGlobal, getPublishedPages } from './loader'

export async function llmsTxt(): Promise<string> {
  const [settings, pages] = await Promise.all([getGlobal('site-settings'), getPublishedPages()])
  const links = [
    ['White paper', absoluteUrl('/Byteball.pdf')],
    ['GitHub', settings.githubUrl],
    ['DAG explorer', settings.explorerUrl],
    ['Discord', settings.discordUrl],
    ['Telegram', settings.telegramUrl],
  ].filter((l): l is [string, string] => !!l[1])
  return [
    '# Obyte',
    `> ${(settings.llmsIntro || settings.defaultDescription).replace(/\s*\n\s*/g, ' ')}`,
    '## Pages',
    pages
      .map((p) => {
        const description = p.meta?.description ? `: ${p.meta.description}` : ''
        return `- [${p.path === '/' ? 'Home' : p.title}](${absoluteUrl(p.path)})${description}`
      })
      .join('\n'),
    '## Optional',
    links.map(([label, url]) => `- [${label}](${url})`).join('\n'),
    '',
  ].join('\n\n')
}
