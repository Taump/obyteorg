import { InlineRichText } from '@/content-blocks/RichText'
import type { HeroBlock } from '@/content/types'
import heroBgMin from '@/shared/assets/home/hero-bg-min.webp'
import heroBg from '@/shared/assets/home/hero-bg.webp'
import { cn } from '@/shared/lib/cn'
import { bgVars } from '@/shared/lib/cssVars'
import { containerClass, sectionClass } from '@/shared/ui/layout'
import { MediaImage } from '@/shared/ui/MediaImage'
import { Quote } from '@/widgets/Quote/Quote'

const bg = bgVars({ bg: heroBg, 'bg-min': heroBgMin })

/**
 * Home hero: the background image at its natural size; ≤880px the smaller image is centred at
 * the top.
 */
export function Hero({ block }: { block: HeroBlock }) {
  return (
    <>
      {/* the background is the largest element of the home page: load it with the HTML
          (a rendered <link>, hoisted into <head> — see PageBackgroundPreload) */}
      <link
        rel="preload"
        as="image"
        href={heroBg.src}
        fetchPriority="high"
        media="(width >= 881px)"
      />
      <link
        rel="preload"
        as="image"
        href={heroBgMin.src}
        fetchPriority="high"
        media="(width < 881px)"
      />
      <section
        style={bg}
        className={cn(
          sectionClass,
          'z-[2] box-border overflow-hidden pb-64 pt-100 font-sans text-white',
          'bg-(image:--bg) bg-top-right bg-no-repeat min-[1440px]:bg-top',
          'max-[881px]:bg-(image:--bg-min) max-[881px]:bg-top',
        )}
      >
        <div className={containerClass}>
          <div>
            <div>
              <h1 className="mb-8 mt-0 font-sans text-[60px]/[55px] font-semibold text-white max-[881px]:text-[40px]/[44px]">
                <InlineRichText data={block.title} />
              </h1>
              {block.subtitle && (
                <h2 className="mb-40 mt-8 font-sans text-[36px]/[49px] font-light text-white max-[881px]:text-[26px]/[35px]">
                  {block.subtitle}
                </h2>
              )}
              {block.description && (
                <h3 className="mb-64 mt-40 max-w-[690px] font-sans text-[24px]/[32px] font-normal text-white max-[881px]:text-[20px]/[28px]">
                  {block.description}
                </h3>
              )}
            </div>
            <div className="max-w-[830px]">
              <Quote quote={block.mainQuote} />
            </div>
          </div>

          <div>
            <div className="flex w-full justify-between pb-40 pt-65 text-black max-[881px]:flex-col max-[881px]:text-[16px]">
              <div className="mr-70 max-w-[750px] max-[881px]:mr-0">
                {block.information?.map((info) => (
                  <p key={info.id}>
                    <b>{info.title}</b> {info.text}
                  </p>
                ))}
              </div>
              <div className="w-full max-w-[300px] shrink-0">
                <Quote quote={block.sideQuote} />
              </div>
            </div>

            <div className="flex justify-between pb-55 max-[881px]:flex-col">
              {block.comparisons?.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex w-[calc(33.3%-16px)] flex-col justify-end rounded-[20px] border border-[#b6d5f9] bg-[#eff6ff] p-24 text-[16px] text-black',
                    'max-[881px]:mb-24 max-[881px]:w-full',
                    item.active && 'border-3 bg-[#e2efff]',
                  )}
                >
                  <div className="max-[881px]:flex max-[881px]:h-325 max-[881px]:items-end max-[881px]:justify-center">
                    <MediaImage media={item.image} alt={item.title} className="mx-auto block" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold">{item.title}</div>
                    {item.description && <div className="font-light">{item.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
