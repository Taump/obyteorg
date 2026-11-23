import type { ReactNode } from 'react'

import type { BoxBlock, InnerBoxBlock } from '@/content/types'

import { InlineRichText, RichText } from '../RichText'

/** Text in a page-specific wrapper, or as a styled paragraph / heading (see BOX_STYLES). */
export function Box({ block }: { block: BoxBlock | InnerBoxBlock }) {
  // `p.bullet` / `h2.section-heading text-center`: the text itself is that element
  const m = /^(p|h2|small)(?:\.(.+))?$/.exec(block.style)
  if (m) {
    const Tag = m[1] as 'p' | 'h2' | 'small'
    return (
      <Tag className={m[2] || undefined}>
        <InlineRichText data={block.content} />
      </Tag>
    )
  }
  // `a b > c`: nested wrappers <div class="a b"><div class="c">…</div></div>
  return block.style
    .split(' > ')
    .reduceRight<ReactNode>(
      (inner, cls) => <div className={cls}>{inner}</div>,
      <RichText data={block.content} />,
    )
}
