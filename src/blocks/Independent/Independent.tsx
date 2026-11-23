import type { IndependentBlock } from '@/content/types'
import windmill from '@/shared/assets/home/windmill.webp'
import { cn } from '@/shared/lib/cn'
import { bgVars } from '@/shared/lib/cssVars'
import { containerClass, sectionClass } from '@/shared/ui/layout'
import { Quote } from '@/widgets/Quote/Quote'

const bg = bgVars({ bg: windmill })

/**
 * Home "An independent individual…" (`.section.independent`): the windmill photo on the left,
 * faded into the beige background by a gradient pseudo-element. On phones the ≤768px values win
 * over the ≤400/≤480 ones (margin, background-size), except their `top`.
 */
export function Independent({ block }: { block: IndependentBlock }) {
  return (
    <div className="bg-[#e5ded6]">
      <div className="min-[2000px]:mx-auto min-[2000px]:max-w-[1280px] min-[2000px]:bg-[#e4ded5]">
        <section
          style={bg}
          className={cn(
            sectionClass,
            'z-[1] overflow-hidden bg-(image:--bg) bg-size-[auto_100%] bg-top-left bg-no-repeat min-[2000px]:bg-[#e5dfd6]',
            'max-sm:bg-contain max-sm:pt-[35%] min-[768px]:max-[991px]:bg-contain min-[768px]:max-[991px]:pt-400',
            // fade
            'before:absolute before:right-0 before:top-0 before:z-[-1] before:h-full before:w-1/2 before:bg-size-[100%_100%] before:bg-no-repeat before:content-[""]',
            'before:bg-[linear-gradient(-90deg,#e5ded6_91.47%,rgba(233,230,225,0)_100%)] min-[1580px]:before:w-[65%] min-[2000px]:before:w-1/2',
            'max-sm:before:-mt-35 max-sm:before:top-[35%] max-sm:before:w-full max-sm:before:bg-[linear-gradient(0deg,#e5ded6_91.47%,rgba(233,230,225,0)_100%)]',
            'min-[768px]:max-[991px]:before:top-[20%] min-[768px]:max-[991px]:before:w-full min-[768px]:max-[991px]:before:bg-[linear-gradient(0deg,#e5ded6_71.47%,rgba(233,230,225,0)_100%)]',
            'max-[400px]:before:top-[20%] min-[400px]:max-[481px]:before:top-[25%]',
          )}
        >
          <div className={containerClass}>
            <div className="flex justify-end max-sm:justify-start">
              <div
                className={cn(
                  'w-1/2 pb-140 pt-95 max-sm:w-full max-sm:pb-48',
                  'min-[768px]:max-[991px]:w-full min-[768px]:max-[991px]:pb-48 min-[768px]:max-[991px]:pt-0',
                  'min-[400px]:max-[481px]:mt-20 min-[400px]:max-[481px]:pt-20',
                )}
              >
                <div>
                  <h2 className="mb-35 font-sans text-[36px] font-light text-[#434738] max-sm:text-[24px]/[32px]">
                    {block.title}
                  </h2>
                </div>
                {block.description && (
                  <div className="mb-35 max-w-[540px] font-sans text-[16px]/[28px] font-normal">
                    {block.description}
                  </div>
                )}
                <div className="max-w-[550px]">
                  <Quote quote={block.quote} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
