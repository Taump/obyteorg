import { getImageProps } from 'next/image'

import type { CardGridBlock } from '@/content/types'
import { cn } from '@/shared/lib/cn'
import { MediaImage } from '@/shared/ui/MediaImage'
import { SafeLink } from '@/shared/ui/SafeLink'

import { InlineRichText, RichText } from '../RichText'

type Card = NonNullable<CardGridBlock['cards']>[number]

/** /platform: background picture + title, the whole card is a link. */
function LinkCard({ card }: { card: Card }) {
  // a CSS background, so no srcset: the optimizer's AVIF/WebP at the natural width
  // (the originals are PNGs of up to 300 KB)
  const image = card.image
  const bg =
    image && image.width && image.height && image.mimeType !== 'image/svg+xml'
      ? getImageProps({ src: image.url, alt: '', width: image.width, height: image.height }).props
          .src
      : (image?.url ?? null)
  return (
    <>
      <div className="img-block">
        <div className="inner-wrap" style={bg ? { backgroundImage: `url('${bg}')` } : undefined} />
      </div>
      <div className="title-block">
        <div className="title">{card.title}</div>
      </div>
      <SafeLink href={card.link} className="all-link">
        <span className="sr-only">{card.title}</span>
      </SafeLink>
    </>
  )
}

/**
 * An item of a link list. Without a URL (e.g. "Plain old payments" on /developers) it is a span
 * with the look of its sibling links (pages.css) — an `<a>` without href is not crawlable.
 */
const ListLink = ({ link, label }: { link?: string | null; label: string }) =>
  link ? <SafeLink href={link}>{label}</SafeLink> : <span className="link-list-item">{label}</span>

/** /developers: icon + title + list of links. */
function LinkListCard({ card }: { card: Card }) {
  return (
    <div className="inner-wrap">
      <div className="img-block">
        <MediaImage media={card.image} natural />
      </div>
      <h2 className="title">{card.title}</h2>
      <div className="info-block">
        <div className="link-list">
          {card.links?.map((l) =>
            card.linkRows ? (
              <div key={l.id ?? l.label}>
                <ListLink link={l.link} label={l.label} />
                {l.description}
              </div>
            ) : (
              <ListLink key={l.id ?? l.label} link={l.link} label={l.label} />
            ),
          )}
        </div>
        {/* plain text (no <p>) in cards without a link list */}
        {card.links?.length ? (
          <RichText data={card.content} />
        ) : (
          <InlineRichText data={card.content} />
        )}
      </div>
    </div>
  )
}

/** Grid of cards (`.categories-list > .category-block`). */
export function CardGrid({ block }: { block: CardGridBlock }) {
  return (
    <div className="categories-list">
      {block.cards?.map((card) => (
        <div key={card.id} className={cn('category-block', card.modifier)}>
          {block.variant === 'linkCards' ? (
            <LinkCard card={card} />
          ) : block.variant === 'linkLists' ? (
            <LinkListCard card={card} />
          ) : (
            <>
              <h2 className="title">{card.title}</h2>
              <RichText data={card.content} />
            </>
          )}
        </div>
      ))}
    </div>
  )
}
