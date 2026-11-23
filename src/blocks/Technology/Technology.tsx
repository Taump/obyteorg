import { InlineRichText, RichText } from '@/content-blocks/RichText'
import type { TechnologyBlock } from '@/content/types'
import { containerClass, sectionClass } from '@/shared/ui/layout'
import { MediaImage } from '@/shared/ui/MediaImage'
import { Quote } from '@/widgets/Quote/Quote'

import { Scenes } from './Scenes'

/** Home "We use technology…" section. */
export function Technology({ block }: { block: TechnologyBlock }) {
  return (
    <section className={`${sectionClass} bg-white pb-92`}>
      <div className={containerClass}>
        <div className="flex justify-between max-lg:flex-col">
          <div className="pb-50 pt-90">
            <div>
              <h2 className="font-sans text-[36px] font-light text-link max-[641px]:mb-32 max-[641px]:text-[24px]/[32px] max-[641px]:font-normal">
                <InlineRichText data={block.title} />
              </h2>
            </div>
            <div className="mb-40 mt-30 w-[280px]">
              <Quote quote={block.quote} gray />
            </div>
            <div className="max-w-[540px] font-sans text-[16px]/[28px] font-normal">
              <RichText data={block.body} />
            </div>
          </div>
          <Scenes
            scenes={block.scenes ?? []}
            // shown by the browser only if the SVG can't be displayed (<object> fallback)
            fallback={
              <MediaImage
                media={block.fallbackImage}
                alt="dag image"
                className="size-full object-contain"
              />
            }
          />
        </div>
      </div>
    </section>
  )
}
