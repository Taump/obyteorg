import type { MediaListBlock } from '@/content/types'
import { MediaImage } from '@/shared/ui/MediaImage'
import { SafeLink } from '@/shared/ui/SafeLink'

import { RichText } from '../RichText'

/** List / item classes of each variant. */
const CLASSES = {
  resources: { list: 'resources-list', item: 'resource-block' },
  attestors: { list: 'attestors-list', item: 'attestor-block' },
  blackbytes: { list: 'blackbytes-details', item: 'blackbytes-block' },
} as const

/** Image + text list (`.resources-list`, `.attestors-list`, `.blackbytes-details`). */
export function MediaList({ block }: { block: MediaListBlock }) {
  const variant = block.variant ?? 'resources'
  const classes = CLASSES[variant]
  return (
    <div className={classes.list}>
      {block.items?.map((item) => {
        const title = item.title && <SafeLink href={item.link}>{item.title}</SafeLink>
        if (variant === 'blackbytes') {
          return (
            <div key={item.id} className={classes.item}>
              {title && <h3>{title}</h3>}
              <RichText data={item.content} />
            </div>
          )
        }
        return (
          <div key={item.id} className={classes.item}>
            <div className="img-block">
              <MediaImage media={item.image} natural />
            </div>
            <div className="info-block">
              {title &&
                (variant === 'attestors' ? (
                  <h2 className="title">{title}</h2>
                ) : (
                  <div className="title">{title}</div>
                ))}
              <RichText data={item.content} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
