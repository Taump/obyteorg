import type { BigChangesBlock } from '@/content/types'
import torch from '@/shared/assets/home/torch.webp'
import { cn } from '@/shared/lib/cn'
import { bgVars } from '@/shared/lib/cssVars'
import { containerClass, sectionClass } from '@/shared/ui/layout'
import { Quote } from '@/widgets/Quote/Quote'

const bg = bgVars({ torch })

/** Home "…big changes lie ahead" with the torch. */
export function BigChanges({ block }: { block: BigChangesBlock }) {
  return (
    <section className={cn(sectionClass, 'bg-[#d7e0ed] pb-80 pt-100 max-[881px]:pt-32')}>
      <div
        style={bg}
        className={cn(
          containerClass,
          'relative',
          'after:absolute after:-bottom-120 after:right-[15%] after:z-[1] after:h-[490px] after:w-[700px] after:max-w-[700px] after:content-[""]',
          'after:bg-(image:--torch) after:bg-contain after:bg-right-bottom after:bg-no-repeat',
          'max-[881px]:after:static max-[881px]:after:-mb-80 max-[881px]:after:mt-40 max-[881px]:after:block max-[881px]:after:h-400 max-[881px]:after:w-full',
        )}
      >
        <div className="max-w-[550px]">
          <div>{block.text}</div>
          <div className="mb-40 mt-50 max-[881px]:mt-32">
            <Quote quote={block.quote} />
          </div>
        </div>
      </div>
    </section>
  )
}
