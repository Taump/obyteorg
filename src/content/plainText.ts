/**
 * Plain text of rich text (structured data, e.g. FAQ answers in JSON-LD): blocks separated by a
 * blank line, list items and line breaks by a newline, <Email> as the address.
 */
import type { Nodes, Root } from 'mdast'

import type { SiteSetting } from './types'

const BLOCKS = new Set([
  'paragraph',
  'heading',
  'blockquote',
  'list',
  'code',
  'table',
  'mdxJsxFlowElement',
])

export function plainText(
  data: Root | null | undefined,
  settings: Pick<SiteSetting, 'contactEmail' | 'jobsEmail'>,
) {
  const text = (n: Nodes): string => {
    const block = (n.data as { block?: { blockType?: string; address?: string } } | undefined)
      ?.block
    if (block?.blockType === 'emailLink')
      return block.address === 'jobs' ? settings.jobsEmail : settings.contactEmail
    if (n.type === 'break') return '\n'
    if ('value' in n && typeof n.value === 'string') return n.value
    if (!('children' in n)) return ''
    const kids = n.children as Nodes[]
    if (n.type === 'list') return kids.map(text).join('\n')
    if (
      n.type === 'root' ||
      n.type === 'listItem' ||
      n.type === 'blockquote' ||
      n.type === 'mdxJsxFlowElement'
    )
      return kids
        .map((k) => text(k).trim())
        .filter(Boolean)
        .join(BLOCKS.has(kids[0]?.type) ? '\n\n' : '')
    return kids.map(text).join('')
  }
  return data ? text(data).trim() : ''
}
