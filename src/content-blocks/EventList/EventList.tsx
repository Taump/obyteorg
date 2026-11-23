import type { EventListBlock } from '@/content/types'
import { MediaImage } from '@/shared/ui/MediaImage'
import { hasVideo, VideoBox, type Video } from '@/shared/ui/VideoBox'

import { RichText } from '../RichText'

export type EventItem = NonNullable<EventListBlock['items']>[number]

/**
 * Photos/video of an event: photos in rows of two
 * (`.d-flex`), an odd last photo on its own, one photo + video side by side, a lone video in an
 * `.iframe-block` (360px high).
 */
function EventMedia({
  images,
  video,
}: {
  images: NonNullable<EventItem['images']>
  video?: Video | null
}) {
  if (images.length === 1 && hasVideo(video)) {
    return (
      <div className="d-flex">
        <MediaImage media={images[0].image} natural />
        <VideoBox video={video} className="iframe-wrap [&>*]:h-full [&>*]:min-h-[280px]" />
      </div>
    )
  }
  const rows: (typeof images)[] = []
  for (let i = 0; i < images.length; i += 2) rows.push(images.slice(i, i + 2))
  return (
    <>
      {rows.map((row) =>
        row.length === 2 ? (
          <div key={row[0].id} className="d-flex">
            {row.map((x) => (
              <MediaImage key={x.id} media={x.image} natural />
            ))}
          </div>
        ) : (
          <MediaImage key={row[0].id} media={row[0].image} natural />
        ),
      )}
      <VideoBox
        video={video}
        className="iframe-block [&>*]:inline-block [&>*]:h-[360px] [&>*]:align-baseline"
      />
    </>
  )
}

/** `.fancy-list > .element-block` (events and grants). */
export function EventCards({
  items,
  variant,
}: {
  items: EventItem[]
  variant: EventListBlock['variant']
}) {
  return (
    <div className="fancy-list">
      {items.map((i) => (
        <div key={i.id} className="element-block">
          {i.date && <div className="date">{i.date}</div>}
          {variant === 'grants' ? <h2>{i.title}</h2> : <div className="title">{i.title}</div>}
          <RichText data={i.content} />
          <EventMedia images={i.images ?? []} video={i.video} />
        </div>
      ))}
    </div>
  )
}

export function EventList({ block }: { block: EventListBlock }) {
  return <EventCards items={block.items ?? []} variant={block.variant} />
}
