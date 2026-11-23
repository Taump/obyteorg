/**
 * Content block components by blockType (see content/mdx/registry.ts): each renders plain markup
 * with class names (flex-block, dev-blog, categories-list …) styled by src/shared/styles/pages.css.
 */
import type { ComponentType } from 'react'

import { Box } from './Box/Box'
import { CardGrid } from './CardGrid/CardGrid'
import { Columns } from './Columns/Columns'
import { DevCallout } from './DevCallout/DevCallout'
import { DistributionTable } from './DistributionTable/DistributionTable'
import { EventList } from './EventList/EventList'
import { EventsFeed } from './EventsFeed/EventsFeed'
import { FaqFeed } from './FaqFeed/FaqFeed'
import { FlexBlock } from './FlexBlock/FlexBlock'
import { MediaList } from './MediaList/MediaList'
import { PageIntro } from './PageIntro/PageIntro'
import { Spacer } from './Spacer/Spacer'
import type { ContentLists } from './types'
import { VideoEmbed } from './VideoEmbed/VideoEmbed'
import { WhiteBox } from './WhiteBox/WhiteBox'

type BlockComponent = ComponentType<{ block: never; lists: ContentLists }>

export const BLOCK_COMPONENTS: Record<string, BlockComponent> = {
  pageIntro: PageIntro,
  flexBlock: FlexBlock,
  devCallout: DevCallout,
  cardGrid: CardGrid,
  whiteBox: WhiteBox,
  box: Box,
  innerBox: Box,
  distributionTable: DistributionTable,
  spacer: Spacer,
  faqFeed: FaqFeed,
  eventList: EventList,
  eventsFeed: EventsFeed,
  mediaList: MediaList,
  columns: Columns,
  videoEmbed: VideoEmbed,
} as Record<string, BlockComponent>
