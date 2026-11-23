/**
 * The MDX vocabulary of the site: every component an MDX page may use, how its attributes,
 * children and child elements become the `block` object its React component renders, and the
 * schema that validates it. Nothing else is allowed in MDX (see parse.ts).
 *
 *   <Article variant="faq-wrap">markdown…</Article>          section of a page (top level)
 *   <FlexBlock kind="flex-block" image="/media/x.png">…</FlexBlock>   content block
 *   <CardGrid variant="linkCards"><Card title="…" link="…" image="…" /></CardGrid>
 *   <Hero data="home/hero" />          fields from content/data/home/hero.yaml
 *   <Email kind="contact" />           inline
 */
import { z } from 'zod'

import { ARTICLE_VARIANTS, TEXT_WIDE_VARIANTS } from '../variants'
import { flag, link, media, num, richText, video } from './fields'

export type ElementSpec = {
  /** blockType of the produced object (the key of the React component) */
  type: string
  /** page section (top level of a page file) vs content block (inside a section) */
  level: 'section' | 'block' | 'inline' | 'child'
  /** validates the assembled object (attributes + data file + children + child elements) */
  schema: z.ZodType
  /** field receiving the markdown children (everything but child elements) */
  children?: string
  /** child element name → field it fills (array, or a single value) */
  elements?: Record<string, { field: string; many: boolean; spec: ElementSpec }>
  /** `data="dir/name"` merges content/data/dir/name.yaml into the attributes */
  data?: boolean
}

const quote = z.object({
  text: richText(),
  author: z.string(),
  source: z.string().nullish(),
  avatar: media().nullish(),
  smallAvatar: media().nullish(),
})

const anchor = {
  anchorId: z
    .string()
    .regex(/^[\w-]+$/)
    .nullish(),
}

const BOX_STYLES = [
  'list-block d-flex',
  'flex-list',
  'text-block',
  'content-small',
  'd-flex',
  'container grid-xl > top-block',
  'top-block > container grid-xl',
  'event-block',
  'p.bullet',
  'p.bullet-padding',
  'p.med-width',
  'p.max-width',
  'p.w-550',
  'p.w-670',
  'p.w-745',
  'p.text-center',
  'h2.section-heading text-center',
  'small',
] as const

// ---------------------------------------------------------------- child elements

const textSpec: ElementSpec = {
  type: 'text',
  level: 'child',
  children: 'text',
  schema: z.object({
    style: z.enum(['block', 'blockInline', 'paragraph', 'plain', 'small', 'subParagraph']),
    text: richText(),
  }),
}
const leadSpec: ElementSpec = {
  type: 'lead',
  level: 'child',
  children: 'value',
  schema: z.object({ value: richText() }).transform((o) => o.value),
}
const cardLinkSpec: ElementSpec = {
  type: 'cardLink',
  level: 'child',
  schema: z.object({
    label: z.string(),
    link: link().nullish(),
    description: z.string().nullish(),
  }),
}
const cardSpec: ElementSpec = {
  type: 'card',
  level: 'child',
  children: 'content',
  elements: { CardLink: { field: 'links', many: true, spec: cardLinkSpec } },
  schema: z.object({
    title: z.string(),
    image: media().nullish(),
    link: link().nullish(),
    links: z.array(cardLinkSpec.schema).nullish(),
    linkRows: flag().nullish(),
    content: richText().nullish(),
    modifier: z.string().nullish(),
  }),
}
const columnSpec: ElementSpec = {
  type: 'column',
  level: 'child',
  children: 'content',
  schema: z.object({ width: num(), content: richText().nullish(), video: video().optional() }),
}
const mediaItemSpec: ElementSpec = {
  type: 'mediaItem',
  level: 'child',
  children: 'content',
  schema: z.object({
    image: media().nullish(),
    title: z.string().nullish(),
    link: link().nullish(),
    content: richText().nullish(),
  }),
}
const eventItemSpec: ElementSpec = {
  type: 'eventItem',
  level: 'child',
  children: 'content',
  schema: z.object({
    date: z.string().nullish(),
    title: z.string(),
    content: richText().nullish(),
    // images="/media/a.jpg /media/b.jpg"
    images: z
      .preprocess(
        (v) => (typeof v === 'string' ? v.split(/\s+/).filter(Boolean) : v),
        z.array(media()),
      )
      .transform((list) => list.map((image) => ({ image })))
      .nullish(),
    video: video().optional(),
  }),
}

// ---------------------------------------------------------------- content blocks

const box = (type: 'box' | 'innerBox'): ElementSpec => ({
  type,
  level: 'block',
  children: 'content',
  schema: z.object({ style: z.enum(BOX_STYLES), content: richText() }),
})

export const BLOCKS: Record<string, ElementSpec> = {
  PageIntro: {
    type: 'pageIntro',
    level: 'block',
    elements: {
      Lead: { field: 'lead', many: false, spec: leadSpec },
      Text: { field: 'texts', many: true, spec: textSpec },
    },
    schema: z.object({
      title: z.string(),
      lead: richText().nullish(),
      leadStyle: z.enum(['subBlock', 'subTitle', 'subBlockText']).default('subBlock'),
      texts: z.array(textSpec.schema).nullish(),
    }),
  },
  FlexBlock: {
    type: 'flexBlock',
    level: 'block',
    children: 'content',
    schema: z.object({
      image: media().nullish(),
      mobileImage: media().nullish(),
      imagePosition: z.enum(['left', 'right']).nullish(),
      kind: z
        .enum(['flex-block', 'flex-text', 'd-flex', 'content-wrap', 'google-block d-inline-flex'])
        .default('flex-block'),
      modifiers: z.string().nullish(),
      imageStyle: z.enum(['info-img', 'content-img', 'img1', 'img2', 'mobile']).nullish(),
      imageModifiers: z.string().nullish(),
      content: richText().nullish(),
      plainText: flag().nullish(),
    }),
  },
  DevCallout: {
    type: 'devCallout',
    level: 'block',
    children: 'content',
    schema: z.object({
      image: media().nullish(),
      category: z.string().nullish(),
      title: z.string(),
      content: richText().nullish(),
      white: flag().nullish(),
    }),
  },
  CardGrid: {
    type: 'cardGrid',
    level: 'block',
    elements: { Card: { field: 'cards', many: true, spec: cardSpec } },
    schema: z.object({
      variant: z.enum(['linkCards', 'linkLists', 'text']),
      cards: z.array(cardSpec.schema).nullish(),
    }),
  },
  WhiteBox: {
    type: 'whiteBox',
    level: 'block',
    children: 'content',
    schema: z.object({
      label: z.string().nullish(),
      content: richText(),
      plainText: flag().nullish(),
    }),
  },
  Box: box('box'),
  InnerBox: box('innerBox'),
  DistributionTable: {
    type: 'distributionTable',
    level: 'block',
    data: true,
    schema: z.object({
      intro: richText().nullish(),
      headings: z.object({
        method: z.string(),
        years: z.string(),
        amount: z.string(),
        history: z.string(),
      }),
      rows: z
        .array(
          z.object({
            method: richText(),
            years: z.string(),
            amount: z.string(),
            addresses: z.string(),
          }),
        )
        .nullish(),
    }),
  },
  Spacer: {
    type: 'spacer',
    level: 'block',
    schema: z.object({ lines: num().default(2), paragraph: flag().nullish() }),
  },
  FaqFeed: { type: 'faqFeed', level: 'block', schema: z.object({ limit: num().nullish() }) },
  EventsFeed: { type: 'eventsFeed', level: 'block', schema: z.object({ limit: num().nullish() }) },
  EventList: {
    type: 'eventList',
    level: 'block',
    elements: { Event: { field: 'items', many: true, spec: eventItemSpec } },
    schema: z.object({
      variant: z.enum(['events', 'grants']).nullish(),
      items: z.array(eventItemSpec.schema).nullish(),
    }),
  },
  MediaList: {
    type: 'mediaList',
    level: 'block',
    elements: { Item: { field: 'items', many: true, spec: mediaItemSpec } },
    schema: z.object({
      variant: z.enum(['resources', 'attestors', 'blackbytes']),
      items: z.array(mediaItemSpec.schema).nullish(),
    }),
  },
  Columns: {
    type: 'columns',
    level: 'block',
    elements: { Column: { field: 'columns', many: true, spec: columnSpec } },
    schema: z.object({ columns: z.array(columnSpec.schema).nullish() }),
  },
  VideoEmbed: {
    type: 'videoEmbed',
    level: 'block',
    schema: z
      .object({ video: video(), title: z.string().nullish() })
      .transform(({ video, title }) => ({ ...video, title })),
  },
  /** <Image src="/media/x.png" variant="info-img" /> — a content image with a style class */
  Image: {
    type: 'image',
    level: 'block',
    schema: z
      .object({
        src: z.string(),
        alt: z.string().optional(),
        variant: z.enum(['info-img', 'content-img', 'img1', 'img2', 'mobile']).nullish(),
      })
      .transform((o, ctx) => {
        const m = media().safeParse({ src: o.src, alt: o.alt })
        if (!m.success) {
          for (const i of m.error.issues) ctx.addIssue({ code: 'custom', message: i.message })
          return z.NEVER
        }
        return { media: m.data, variant: o.variant ?? null }
      }),
  },
}

export const INLINE: Record<string, ElementSpec> = {
  Email: {
    type: 'emailLink',
    level: 'inline',
    schema: z
      .object({ kind: z.enum(['contact', 'jobs']) })
      .transform(({ kind }) => ({ address: kind })),
  },
}

// ---------------------------------------------------------------- page sections

const section = (
  type: string,
  fields: z.ZodRawShape,
  opts: Partial<Pick<ElementSpec, 'children' | 'data'>> = {},
): ElementSpec => ({
  type,
  level: 'section',
  ...opts,
  schema: z.object({ ...anchor, ...fields }),
})

export const SECTIONS: Record<string, ElementSpec> = {
  Article: section(
    'article',
    { variant: z.enum(ARTICLE_VARIANTS), body: richText().nullish() },
    { children: 'body' },
  ),
  TextWide: section(
    'textWide',
    {
      variant: z.enum(TEXT_WIDE_VARIANTS),
      body: richText().nullish(),
    },
    { children: 'body' },
  ),
  Download: section(
    'download',
    {
      network: z.enum(['mainnet', 'testnet']),
      title: richText(),
      bigImage: media(),
      smallImage: media(),
      downloadLinks: z.array(z.object({ label: z.string(), link: link() })).nullish(),
      body: richText().nullish(),
    },
    { children: 'body', data: true },
  ),
  Hero: section(
    'hero',
    {
      title: richText(),
      subtitle: z.string().nullish(),
      description: z.string().nullish(),
      mainQuote: quote,
      information: z.array(z.object({ title: z.string(), text: z.string() })).nullish(),
      sideQuote: quote,
      comparisons: z
        .array(
          z.object({
            image: media(),
            title: z.string(),
            description: z.string().nullish(),
            active: flag().nullish(),
          }),
        )
        .nullish(),
    },
    { data: true },
  ),
  Technology: section(
    'technology',
    {
      title: richText(),
      quote,
      body: richText().nullish(),
      fallbackImage: media().nullish(),
      scenes: z
        .array(
          z.object({
            scene: z.enum(['scene1', 'scene2', 'scene3']),
            title: z.string(),
            text: z.string(),
          }),
        )
        .nullish(),
    },
    { children: 'body', data: true },
  ),
  Independent: section(
    'independent',
    { title: z.string(), description: z.string().nullish(), quote },
    { data: true },
  ),
  BigChanges: section('bigChanges', { text: z.string(), quote }, { data: true }),
  Timeline: section(
    'timeline',
    { title: z.string(), body: richText().nullish() },
    { children: 'body', data: true },
  ),
  Team: section(
    'team',
    {
      title: z.string(),
      body: richText().nullish(),
      visibleCount: num().nullish(),
      showAllLabel: z.string().nullish(),
      showLessLabel: z.string().nullish(),
    },
    { children: 'body', data: true },
  ),
  Exchanges: section(
    'exchanges',
    { title: z.string(), intro: z.string().nullish(), body: richText().nullish() },
    { children: 'body', data: true },
  ),
}

/** Lowercase HTML allowed in MDX text (inline formatting markdown can't express), with its attributes. */
export const HTML_TAGS: Record<string, string[]> = {
  a: ['href', 'target', 'rel', 'title'],
  sub: [],
  sup: [],
  br: [],
  u: [],
  s: [],
  small: [],
}
