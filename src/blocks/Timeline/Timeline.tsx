import { RichText } from '@/content-blocks/RichText'
import type { TimelineBlock } from '@/content/types'
import { formatMonth } from './format'
import { cn } from '@/shared/lib/cn'
import { containerClass, sectionClass } from '@/shared/ui/layout'
import { sectionTitleClass } from '@/shared/ui/sectionTitle'

import type { BlockData } from '../RenderBlocks'
import { Slider } from './Slider'

const fade = (to: 'right' | 'left') =>
  to === 'right'
    ? 'bg-[linear-gradient(to_right,#f7f7f7_0%,#f7f7f7_50%,rgba(247,247,247,0)_100%)] max-sm:bg-[linear-gradient(to_right,#f7f7f7_0%,rgba(247,247,247,0)_100%)]'
    : 'bg-[linear-gradient(to_left,#f7f7f7_0%,#f7f7f7_50%,rgba(247,247,247,0)_100%)] max-sm:bg-[linear-gradient(to_left,#f7f7f7_0%,rgba(247,247,247,0)_100%)]'

/** Home timeline (`.section.timeline-wrap`); points: content/data/timeline.yaml. */
export function Timeline({ block, data }: { block: TimelineBlock; data: BlockData }) {
  const gradClass =
    'pointer-events-none relative z-[2] grow max-sm:absolute max-sm:h-full max-sm:w-80'
  return (
    <section className={cn(sectionClass, 'overflow-hidden pt-90')}>
      <div className={containerClass}>
        <div className="mb-7 max-w-[670px] text-[16px] text-text max-sm:mb-32">
          <h1 className={cn(sectionTitleClass, 'm-0 font-sans max-sm:mb-24 max-sm:leading-[32px]')}>
            {block.title}
          </h1>
          <RichText data={block.body} />
        </div>
      </div>
      <div className="flex">
        <div className={cn(gradClass, '-ml-[1.4rem] max-sm:left-0')}>
          <div className={cn('absolute left-0 right-38 h-full max-sm:right-0', fade('right'))} />
        </div>
        <div className={containerClass}>
          <Slider
            points={data.timelineEvents.map((e) => ({
              id: String(e.id),
              date: formatMonth(e.date),
              title: e.title,
            }))}
          />
        </div>
        <div className={cn(gradClass, '-mr-[1.4rem] max-sm:right-0')}>
          <div className={cn('absolute inset-x-0 h-full', fade('left'))} />
        </div>
      </div>
    </section>
  )
}
