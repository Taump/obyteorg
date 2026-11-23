import type { ComponentType } from 'react'

import type {
  CoinTracker,
  Event,
  Faq,
  Exchange,
  Page,
  Release,
  TeamMember,
  TimelineEvent,
} from '@/content/types'

import { Article } from './Article/Article'
import { BigChanges } from './BigChanges/BigChanges'
import { Download } from './Download/Download'
import { Exchanges } from './Exchanges/Exchanges'
import { Hero } from './Hero/Hero'
import { Independent } from './Independent/Independent'
import { Team } from './Team/Team'
import { Technology } from './Technology/Technology'
import { TextWide } from './TextWide/TextWide'
import { Timeline } from './Timeline/Timeline'

type LayoutBlock = Page['layout'][number]

/** Collection data blocks render besides their own fields (loaded by the route). */
export type BlockData = {
  teamMembers: TeamMember[]
  exchanges: Exchange[]
  coinTrackers: CoinTracker[]
  timelineEvents: TimelineEvent[]
  events: Event[]
  faq: Faq[]
  /** wallet releases (store links of the Download block) */
  releases: Release | null
}
type BlockOf<T extends LayoutBlock['blockType']> = Extract<LayoutBlock, { blockType: T }>

type BlockProps<K extends LayoutBlock['blockType']> = { block: BlockOf<K>; data: BlockData }

const COMPONENTS: { [K in LayoutBlock['blockType']]: ComponentType<BlockProps<K>> } = {
  hero: Hero,
  technology: Technology,
  independent: Independent,
  bigChanges: BigChanges,
  timeline: Timeline,
  download: Download,
  team: Team,
  exchanges: Exchanges,
  article: Article,
  textWide: TextWide,
}

export function RenderBlocks({ blocks, data }: { blocks: Page['layout']; data: BlockData }) {
  return blocks.map((block, i) => {
    const Component = COMPONENTS[block.blockType] as ComponentType<{
      block: LayoutBlock
      data: BlockData
    }>
    return (
      // an empty anchor <div id> before the section (`/#download`, `#team`…)
      <div key={block.id ?? i} className="contents">
        {/* scroll-margin: keep the (shrunk, fixed) header from covering the section start */}
        {block.anchorId && (
          <div id={block.anchorId} className="scroll-mt-[3rem] max-md:scroll-mt-56" />
        )}
        <Component block={block} data={data} />
      </div>
    )
  })
}
