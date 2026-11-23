import { RichText } from '@/content-blocks/RichText'
import type { TeamBlock } from '@/content/types'
import { cn } from '@/shared/lib/cn'
import { containerClass } from '@/shared/ui/layout'
import { GithubIcon, LinkedinIcon } from '@/shared/ui/icons'
import { MediaImage } from '@/shared/ui/MediaImage'
import { sectionTitleClass } from '@/shared/ui/sectionTitle'

import type { BlockData } from '../RenderBlocks'
import { ShowAll } from './ShowAll'

const ICONS = { github: GithubIcon, linkedin: LinkedinIcon }

/** Team grid (`.section.team-wrap`); people: content/data/team.yaml. */
export function Team({ block, data }: { block: TeamBlock; data: BlockData }) {
  const members = data.teamMembers
  const visible = block.visibleCount ?? 4
  return (
    <section
      className={cn(
        'relative bg-white pb-106 pt-100 max-sm:py-60',
        // big faint circle bleeding into the next section
        "after:absolute after:-bottom-[70%] after:-right-[35%] after:z-0 after:size-[1138px] after:rounded-full after:border-4 after:border-blue after:bg-[radial-gradient(100%_100%_at_53.92%_0%,#ffffff_0%,#4a90e2_100%)] after:opacity-[0.04] after:content-['']",
        'max-sm:after:-bottom-[23%] max-sm:after:-right-[216%]',
      )}
    >
      <div className={containerClass}>
        <div className="mx-auto mb-62 max-w-[670px] text-center max-sm:[&_p]:text-[16px]">
          <h1 className={cn(sectionTitleClass, 'm-0 mb-12 max-sm:mb-24')}>{block.title}</h1>
          <RichText data={block.body} />
        </div>
        <ShowAll
          total={members.length}
          visible={visible}
          showAllLabel={block.showAllLabel ?? 'Show all'}
          showLessLabel={block.showLessLabel ?? 'Show less'}
        >
          {members.map((m, i) => (
            <div
              key={m.id}
              // hidden past `visibleCount` while collapsed (see ShowAll)
              data-extra={i >= visible || undefined}
              className="group in-data-collapsed:data-extra:hidden relative mb-48 ml-32 flex w-[calc(25%-32px)] flex-col items-center text-text max-sm:ml-0 max-sm:w-1/2 max-xs:w-auto"
            >
              <MediaImage
                media={m.photo}
                alt={m.name}
                sizes="192px"
                className="mb-32 block size-192 rounded-full object-cover grayscale max-sm:mb-15"
              />
              <div className="text-center">
                <div className="mb-3 text-[20px]">{m.name}</div>
                <div className="text-[12px]">{m.role}</div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-all duration-300 ease-[ease] group-hover:opacity-100">
                {m.links?.map((l) => {
                  const Icon = l.icon === 'link' ? null : ICONS[l.icon]
                  return (
                    <a
                      key={l.id}
                      href={l.url}
                      target="_blank"
                      rel="noopener"
                      aria-label={m.name}
                      className="mx-2 flex size-32 items-center justify-center rounded-full bg-white leading-[16px] text-[#333] group-hover:animate-zoom-in"
                    >
                      {Icon ? (
                        <Icon className="size-[1em]" />
                      ) : (
                        <MediaImage media={l.customIcon} alt="" className="size-[1em]" />
                      )}
                    </a>
                  )
                })}
              </div>
            </div>
          ))}
        </ShowAll>
      </div>
    </section>
  )
}
