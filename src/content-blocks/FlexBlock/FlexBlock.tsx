import type { FlexBlockBlock } from '@/content/types'
import { cn } from '@/shared/lib/cn'
import { MediaImage } from '@/shared/ui/MediaImage'

import { InlineRichText, RichText } from '../RichText'

/** Image + text row (`.flex-block` and its per-page kinds). */
export function FlexBlock({ block }: { block: FlexBlockBlock }) {
  const rowClass = cn(block.kind ?? 'flex-block', block.modifiers?.split(/\s+/))
  const imageClass = block.imageStyle ?? undefined
  // a row with only a picture: the <img> right in the row
  if (!block.content && block.image) {
    return (
      <div className={rowClass}>
        <MediaImage media={block.image} className={imageClass} natural />
      </div>
    )
  }
  // no .img-block at all when a row has no picture
  const image = (block.image || block.mobileImage) && (
    <div className={cn('img-block', block.imageModifiers)}>
      <MediaImage media={block.image} className={imageClass} natural />
      {block.mobileImage && <MediaImage media={block.mobileImage} className="mobile" natural />}
    </div>
  )
  const left = block.imagePosition !== 'right'
  return (
    <div className={rowClass}>
      {left && image}
      {/* the text column: .content-block in the prosaic contracts layout, else .info-block */}
      <div className={block.kind === 'content-wrap' ? 'content-block' : 'info-block'}>
        {block.plainText ? (
          <InlineRichText data={block.content} />
        ) : (
          <RichText data={block.content} />
        )}
      </div>
      {!left && image}
    </div>
  )
}
