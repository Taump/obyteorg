import { InlineRichText, RichText } from '@/content-blocks/RichText'
import type { DownloadBlock } from '@/content/types'
import rings from '@/shared/assets/home/rings.png'
import { cn } from '@/shared/lib/cn'
import { bgVars } from '@/shared/lib/cssVars'
import { containerClass, sectionClass } from '@/shared/ui/layout'
import { MediaImage } from '@/shared/ui/MediaImage'
import { sectionTitleClass } from '@/shared/ui/sectionTitle'

import type { BlockData } from '../RenderBlocks'

const bg = bgVars({ rings })

/** Wallet downloads (`.section.downloads-wrap`). */
export function Download({ block, data }: { block: DownloadBlock; data: BlockData }) {
  const apps = data.releases?.apps
  const links = apps?.[block.network === 'testnet' ? 'testnet' : 'mainnet']
  const stores = [
    { id: 'appStore', link: links?.appStore, badge: apps?.appStoreBadge },
    { id: 'googlePlay', link: links?.googlePlay, badge: apps?.googlePlayBadge },
  ].filter((s) => s.link && s.badge)
  return (
    <section
      style={bg}
      className={cn(
        sectionClass,
        // `padding: 172px 0 70px` (no side padding on desktop)
        'bg-(image:--rings) bg-position-[88px_12px] bg-no-repeat px-0 pb-70 pt-172',
        'max-sm:bg-position-[88px_top] max-sm:px-[1rem] max-sm:py-80',
        // testnet: pulled up under the testnet header, no rings
        block.network === 'testnet' &&
          '-mt-125 bg-none p-0 text-[rgba(0,0,0,0.87)] max-sm:bg-none max-sm:p-0',
      )}
    >
      <div className={containerClass}>
        <div className="flex justify-between">
          <div className="-ml-110 mr-90 shrink-0 max-sm:hidden">
            <MediaImage
              media={block.bigImage}
              alt="downloads"
              sizes="496px"
              className="h-auto max-w-[496px]"
            />
          </div>
          <div>
            <div>
              <h1 className={cn(sectionTitleClass, 'mb-32 mt-92 max-sm:m-0 max-sm:mb-26')}>
                <InlineRichText data={block.title} />
              </h1>
            </div>
            <div className="hidden max-w-[80%] max-sm:mx-auto max-sm:mb-32 max-sm:block max-sm:text-center">
              <div className="relative inline-block before:absolute before:inset-x-4 before:bottom-px before:top-0 before:overflow-hidden before:rounded-[6em] before:shadow-[0_4px_42px_5px_rgba(0,0,0,0.25)] before:content-[''] max-xs:before:rounded-[3em]">
                <MediaImage
                  media={block.smallImage}
                  alt="downloads"
                  sizes="80vw"
                  className="mx-auto block h-auto max-w-full"
                />
              </div>
            </div>
            <div className="mb-28 flex max-sm:mb-15 max-sm:flex-col max-sm:flex-wrap max-sm:items-center">
              {stores.map((s) => (
                <a
                  key={s.id}
                  href={s.link!}
                  target="_blank"
                  rel="noopener"
                  className="mr-16 last:mr-0 max-sm:mb-15 max-sm:mr-0 max-sm:shrink-0"
                >
                  <MediaImage
                    media={s.badge}
                    alt={
                      s.id === 'appStore' ? 'Download on the App Store' : 'Get it on Google Play'
                    }
                    className="block max-w-full max-sm:w-210"
                  />
                </a>
              ))}
            </div>
            <div className="mb-40 flex flex-col font-bold max-sm:mb-27 max-sm:items-center max-sm:text-center max-sm:text-[20px] max-sm:leading-[28px]">
              {block.downloadLinks?.map((l) => (
                <a key={l.id} href={l.link} target="_blank" rel="noopener" className="max-sm:mb-15">
                  {l.label}
                </a>
              ))}
            </div>
            <div className="max-sm:text-center">
              <RichText data={block.body} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
