import { RichText } from '@/content-blocks/RichText'
import type { ArticleBlock } from '@/content/types'

import { PageBackgroundPreload } from '@/shared/styles/PageBackgroundPreload'
import '@/shared/styles/pages.css'

import type { BlockData } from '../RenderBlocks'

/**
 * Inner page article. Plain class names on purpose: the page-specific styles are in
 * shared/styles/pages.css (components layer), and Tailwind utilities on these wrappers would
 * override them (the utilities layer wins over components).
 */
export function Article({ block, data }: { block: ArticleBlock; data: BlockData }) {
  return (
    <>
      {/* hoisted into <head> by React */}
      <PageBackgroundPreload variant={block.variant} />
      <section className={`page-content section ${block.variant}`}>
        <section className="container grid-xl">
          <div className="content-block">
            <RichText data={block.body} lists={{ events: data.events, faq: data.faq }} />
          </div>
        </section>
      </section>
    </>
  )
}
