import { RichText } from '@/content-blocks/RichText'
import type { HeroBlock } from '@/content/types'
import { cn } from '@/shared/lib/cn'
import { MediaImage } from '@/shared/ui/MediaImage'

type QuoteData = HeroBlock['mainQuote']

/**
 * Quote: white (or gray) card with a
 * rounded top-left/bottom-right corner, an optional large portrait on the left and an optional
 * small avatar next to the author.
 */
export function Quote({ quote, gray = false }: { quote: QuoteData; gray?: boolean }) {
  const { avatar, smallAvatar } = quote
  return (
    <div
      className={cn(
        'z-10 flex w-full max-w-full shrink-0 overflow-hidden rounded-tl-[30px] rounded-br-[30px] bg-white text-black shadow-[0_14px_44px_0_rgba(0,0,0,0.04)]',
        'max-[641px]:max-w-[360px] max-[641px]:flex-col',
        gray && 'border border-white/0 bg-[#f0f0f0]',
      )}
    >
      {avatar && (
        <div className="w-[200px] shrink-0 max-[641px]:w-full">
          <MediaImage
            media={avatar}
            alt={quote.author}
            sizes="(max-width: 640px) 360px, 200px"
            className="block size-full object-cover max-[641px]:max-h-[250px]"
          />
        </div>
      )}
      <div className="p-32 max-[641px]:p-24">
        <blockquote className="m-0 border-0 p-0 text-[16px]/[21px] font-light italic [&_p]:mb-[0.5em]">
          <RichText data={quote.text} />
        </blockquote>
        <div className={cn(smallAvatar && 'mt-16 flex items-center')}>
          {smallAvatar && (
            <div className="mr-16 size-37 shrink-0">
              <MediaImage media={smallAvatar} alt={quote.author} className="size-full" />
            </div>
          )}
          <div>
            <div className={cn('text-[12px]/[16px] font-bold', !smallAvatar && 'mt-15')}>
              {quote.author}
            </div>
            {quote.source && <div className="text-[12px]/[16px]">{quote.source}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
