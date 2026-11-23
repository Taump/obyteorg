/**
 * Renders rich text: the validated markdown tree of an MDX element (or of a YAML markdown field).
 * Components inside carry their block object (`data.block`, see content/mdx/parse.ts) and render
 * through their block components; links go through SafeLink; `#####` is the small block title
 * `<div class="title">`.
 */
import type { Element, ElementContent, Root as HastRoot } from 'hast'
import { toJsxRuntime, type Components } from 'hast-util-to-jsx-runtime'
import type { Root } from 'mdast'
import type { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx-jsx'
import { toHast, type State } from 'mdast-util-to-hast'
import type { ComponentType, ReactNode } from 'react'
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'

import type { RichTextData } from '@/content/types'
import { siteContext } from '@/shared/lib/siteContext'
import { MediaImage } from '@/shared/ui/MediaImage'
import { SafeLink } from '@/shared/ui/SafeLink'

import { BLOCK_COMPONENTS } from './converters'
import type { ContentLists } from './types'

const BLOCK_TAG = 'x-block'

/** MDX elements → hast: components become a placeholder carrying the block; HTML stays HTML. */
const jsxHandler = (
  state: State,
  node: MdxJsxFlowElement | MdxJsxTextElement,
): ElementContent | undefined => {
  const block = (node.data as { block?: unknown } | undefined)?.block
  if (block)
    return {
      type: 'element',
      tagName: BLOCK_TAG,
      properties: {},
      children: [],
      data: { block },
    } as unknown as Element
  if (!node.name) return undefined
  const properties: Record<string, string | boolean> = {}
  for (const a of node.attributes)
    if (a.type === 'mdxJsxAttribute' && (typeof a.value === 'string' || a.value === null))
      properties[a.name] = a.value ?? true
  return { type: 'element', tagName: node.name, properties, children: state.all(node) }
}

/** Newlines toHast puts between elements: dropped (they matter for inline-blocks). */
function dropLayoutWhitespace(node: { type: string; tagName?: string; children?: unknown[] }) {
  if (!node.children || node.tagName === 'pre') return
  node.children = (node.children as { type: string; value?: string }[]).filter(
    (c) => !(c.type === 'text' && /^\n\s*$/.test(c.value ?? '')),
  )
  for (const c of node.children) dropLayoutWhitespace(c as typeof node)
}

/** `![…](/media/x.png)` alone in a paragraph: rendered as a bare <img> (no <p>). */
function unwrapImages(node: { children?: unknown[] }) {
  if (!node.children) return
  node.children = (node.children as Element[]).map((c) => {
    const kids = c.type === 'element' && c.tagName === 'p' ? c.children : null
    const only = kids?.length === 1 ? (kids[0] as Element) : null
    const block = (only?.data as { block?: { blockType?: string } } | undefined)?.block
    return only && only.tagName === BLOCK_TAG && block?.blockType === 'image' ? only : c
  })
  for (const c of node.children as { children?: unknown[] }[]) unwrapImages(c)
}

function toTree(data: Root): HastRoot {
  const tree = toHast(data, {
    handlers: { mdxJsxFlowElement: jsxHandler, mdxJsxTextElement: jsxHandler } as never,
    // literal HTML is not part of the dialect (parse.ts rejects it); never pass raw strings through
    allowDangerousHtml: false,
  }) as HastRoot
  dropLayoutWhitespace(tree)
  unwrapImages(tree)
  return tree
}

type BlockProps = { block: { blockType: string }; lists: ContentLists }

function makeComponents(lists: ContentLists, inline: boolean): Components {
  return {
    [BLOCK_TAG]: ({ node }: { node?: Element }) => {
      const block = (node?.data as { block?: { blockType: string } } | undefined)?.block
      if (!block) return null
      if (block.blockType === 'emailLink') {
        const { contactEmail, jobsEmail } = siteContext()
        const email = (block as { address?: string }).address === 'jobs' ? jobsEmail : contactEmail
        return email ? <a href={`mailto:${email}`}>{email}</a> : null
      }
      if (block.blockType === 'image') {
        const { media, variant } = block as unknown as { media: never; variant?: string | null }
        // no utility classes: pages.css sizes content images
        return <MediaImage media={media} className={variant ?? undefined} natural />
      }
      const Component = BLOCK_COMPONENTS[block.blockType] as ComponentType<BlockProps> | undefined
      return Component ? <Component block={block} lists={lists} /> : null
    },
    // a link without href (a styled <a> that leads nowhere): keep the element
    a: ({ href, target, children }: { href?: string; target?: string; children?: ReactNode }) =>
      href === undefined ? (
        <a>{children}</a>
      ) : (
        <SafeLink href={href} newTab={target === '_blank'}>
          {children}
        </SafeLink>
      ),
    h5: ({ children }: { children?: ReactNode }) => <div className="title">{children}</div>,
    ...(inline ? { p: ({ children }: { children?: ReactNode }) => <>{children}</> } : {}),
  } as Components
}

const noLists: ContentLists = {}
const blockComponents = makeComponents(noLists, false)
const inlineComponents = makeComponents(noLists, true)

function render(data: RichTextData, components: Components) {
  return toJsxRuntime(toTree(data), { Fragment, jsx, jsxs, components, passNode: true })
}

export function RichText({
  data,
  lists,
}: {
  data: RichTextData | null | undefined
  /** collection data for blocks like the events feed (top-level page content only) */
  lists?: ContentLists
}) {
  if (!data) return null
  // no wrapper element: the text sits right in the block's container
  return render(data, lists ? makeComponents(lists, false) : blockComponents)
}

/** Rich text of an inline field (titles, quotes inside headings): no <p> wrapper. */
export function InlineRichText({ data }: { data: RichTextData | null | undefined }) {
  if (!data) return null
  return render(data, inlineComponents)
}
