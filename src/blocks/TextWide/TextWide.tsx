import { RichText } from '@/content-blocks/RichText'
import type { TextWideBlock } from '@/content/types'

import { TEXT_WIDE_SECTION_VARIANTS } from '@/content/variants'
import { cn } from '@/shared/lib/cn'

import { PageBackgroundPreload } from '@/shared/styles/PageBackgroundPreload'
import '@/shared/styles/pages.css'

import type { BlockData } from '../RenderBlocks'

/** Full-width inner page content: no section padding/container. */
export function TextWide({ block, data }: { block: TextWideBlock; data: BlockData }) {
  return (
    <>
      {/* hoisted into <head> by React */}
      <PageBackgroundPreload variant={block.variant} />
      <section
        className={cn(
          'page-content',
          block.variant && TEXT_WIDE_SECTION_VARIANTS.includes(block.variant) && 'section',
          block.variant,
        )}
      >
        <RichText data={block.body} lists={{ events: data.events, faq: data.faq }} />
      </section>
    </>
  )
}
