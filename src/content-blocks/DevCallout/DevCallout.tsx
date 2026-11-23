import type { DevCalloutBlock } from '@/content/types'
import { cn } from '@/shared/lib/cn'
import { MediaImage } from '@/shared/ui/MediaImage'

import { RichText } from '../RichText'

/** "Developers" callout with illustration (`.dev-blog`). */
export function DevCallout({ block }: { block: DevCalloutBlock }) {
  return (
    <div className={cn('dev-blog', block.white && 'white')}>
      <div className="dev-img-block">
        <MediaImage media={block.image} natural />
      </div>
      <div className="info-block">
        {block.category && <div className="cat">{block.category}</div>}
        <div className="title">{block.title}</div>
        <RichText data={block.content} />
      </div>
    </div>
  )
}
