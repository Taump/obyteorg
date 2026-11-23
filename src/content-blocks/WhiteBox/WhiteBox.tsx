import type { WhiteBoxBlock } from '@/content/types'

import { InlineRichText, RichText } from '../RichText'

/** White card (`.white-block`) with an optional category label. */
export function WhiteBox({ block }: { block: WhiteBoxBlock }) {
  return (
    <div className="white-block">
      {block.label && <div className="category">{block.label}</div>}
      {block.plainText ? (
        <InlineRichText data={block.content} />
      ) : (
        <RichText data={block.content} />
      )}
    </div>
  )
}
