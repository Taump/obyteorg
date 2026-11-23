import { RichText } from '@/content-blocks/RichText'
import type { ExchangesBlock } from '@/content/types'
import { cn } from '@/shared/lib/cn'
import { containerClass, sectionClass } from '@/shared/ui/layout'
import { MediaImage } from '@/shared/ui/MediaImage'
import { sectionTitleClass } from '@/shared/ui/sectionTitle'

import type { BlockData } from '../RenderBlocks'

const textBlockClass = 'mx-auto mb-62 max-w-[670px] max-sm:[&_p]:mb-24 max-sm:[&_p]:text-[16px]'

/** "GBYTE Exchanges" (`.section.exchanges-wrap`); logos: content/data/exchanges.yaml, coin-trackers.yaml. */
export function Exchanges({ block, data }: { block: ExchangesBlock; data: BlockData }) {
  return (
    <section className={cn(sectionClass, 'pb-54 pt-125 max-sm:py-80')}>
      <div className={cn(containerClass, 'relative z-[1]')}>
        <div className={cn(textBlockClass, 'text-center')}>
          <h1 className={cn(sectionTitleClass, 'm-0 mb-12 max-sm:mb-24')}>{block.title}</h1>
        </div>
        {block.intro && <div className={textBlockClass}>{block.intro}</div>}
        <div className="-ml-32 flex flex-wrap max-sm:-ml-12">
          {data.exchanges.map((e) => (
            <a
              key={e.id}
              href={e.link}
              target="_blank"
              rel="noopener"
              className="group mb-32 ml-32 flex h-98 w-[calc(25%-32px)] items-center justify-center rounded-[10px] bg-white shadow-[0_6px_20px_rgba(229,229,234,0.24)] max-sm:mb-12 max-sm:ml-12 max-sm:w-[calc(50%-12px)] max-xs:w-full"
            >
              <MediaImage
                media={e.logo}
                alt={e.name}
                sizes="300px"
                className="block h-auto max-h-[70px] w-auto max-w-[90%] grayscale group-hover:grayscale-0"
              />
            </a>
          ))}
        </div>
        <div className={textBlockClass}>
          <RichText data={block.body} />
        </div>
        <div className="flex flex-wrap justify-center text-center">
          {data.coinTrackers.map((c) => (
            <a
              key={c.id}
              href={c.link}
              target="_blank"
              rel="noopener"
              className="group mx-8 mb-8 size-48 shrink-0"
            >
              <MediaImage
                media={c.logo}
                alt={c.name}
                className="block rounded-full group-hover:hidden"
              />
              <MediaImage
                media={c.logoHover}
                alt={c.name}
                className="hidden rounded-full group-hover:block"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
