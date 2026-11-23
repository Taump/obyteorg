/**
 * Schemas of the content files other than page bodies:
 *
 *   content/pages/**.mdx            front matter → pageFrontMatter
 *   content/settings/<name>.yaml    site, header, footer, releases
 *   content/data/<list>.yaml        team, timeline, exchanges, coin-trackers, social-links (arrays)
 *   content/data/faq/*.md           front matter: question; body: answer
 *   content/data/events/*.md        front matter: date (YYYY-MM), title, images, video; body
 *
 * Lists keep the order of the file (YAML) or of the file names (faq/NN-*.md); `showOnSite: false`
 * hides an item. Media fields are /media/… paths, link fields are checked against the URL
 * allow-list; rich text fields are markdown.
 */
import { z } from 'zod'

import { flag, link, media, richText, video } from './mdx/fields'

export const pageFrontMatter = z
  .object({
    title: z.string().min(1),
    /** meta description; the site default (site.yaml) when left out */
    description: z.string().min(1).optional(),
    /** <title> when it should differ from the heading title */
    metaTitle: z.string().optional(),
    ogDescription: z.string().optional(),
    ogImage: media().optional(),
    sitemapPriority: z.number().min(0).max(1).optional(),
    menuTitle: z.string().optional(),
    published: z.boolean().default(true),
  })
  .strict()

const showOnSite = { showOnSite: z.boolean().default(true) }
const labeledLink = z.object({ label: z.string(), link: link(), newTab: flag().nullish() })
const platform = z.enum(['win64', 'win32', 'macIntel', 'macArm', 'linux'])
const network = z.object({
  version: z.string().nullish(),
  files: z.array(z.object({ platform, url: link() })).nullish(),
})

export const settingsSchemas = {
  site: z
    .object({
      siteTitle: z.string(),
      defaultDescription: z.string(),
      defaultOgImage: media().nullish(),
      twitterSite: z.string().nullish(),
      llmsIntro: z.string().nullish(),
      contactEmail: z.email(),
      jobsEmail: z.email(),
      githubUrl: link().nullish(),
      explorerUrl: link().nullish(),
      testnetExplorerUrl: link().nullish(),
      discordUrl: link().nullish(),
      telegramUrl: link().nullish(),
    })
    .strict(),
  header: z
    .object({
      navItems: z
        .array(
          z.object({
            label: z.string(),
            link: link(),
            children: z.array(z.object({ label: z.string(), link: link() })).nullish(),
          }),
        )
        .nullish(),
      cta: z.object({ label: z.string(), link: link() }),
      mobileExtraLinks: z.array(labeledLink).nullish(),
    })
    .strict(),
  footer: z
    .object({
      columns: z
        .array(z.object({ title: z.string(), links: z.array(labeledLink).nullish() }))
        .nullish(),
      newsletter: z
        .object({
          enabled: z.boolean().nullish(),
          action: link().nullish(),
          placeholder: z.string().nullish(),
          buttonLabel: z.string().nullish(),
          successTitle: z.string().nullish(),
          successText: z.string().nullish(),
        })
        .optional(),
      copyright: z.string().nullish(),
      mobileCopyright: z.string().nullish(),
      copyrightLink: z.object({ label: z.string().nullish(), url: link().nullish() }).optional(),
    })
    .strict(),
  releases: z
    .object({
      mainnet: network.optional(),
      testnet: network.optional(),
      apps: z
        .object({
          appStoreBadge: media().nullish(),
          googlePlayBadge: media().nullish(),
          mainnet: z
            .object({ appStore: link().nullish(), googlePlay: link().nullish() })
            .optional(),
          testnet: z
            .object({ appStore: link().nullish(), googlePlay: link().nullish() })
            .optional(),
        })
        .optional(),
      /** /downloads/<filename> → the file of that network and platform */
      aliases: z
        .array(
          z.object({
            filename: z.string().regex(/^[\w.-]+$/),
            network: z.enum(['mainnet', 'testnet']),
            platform,
          }),
        )
        .nullish(),
    })
    .strict(),
}

export const listSchemas = {
  team: z.object({
    photo: media(),
    name: z.string(),
    role: z.string(),
    links: z
      .array(
        z.object({
          icon: z.enum(['github', 'linkedin', 'link']),
          customIcon: media().nullish(),
          url: link(),
        }),
      )
      .nullish(),
    ...showOnSite,
  }),
  timeline: z.object({
    date: z.string().regex(/^\d{4}-\d{2}$/, 'expected YYYY-MM'),
    title: z.string(),
    ...showOnSite,
  }),
  exchanges: z.object({ name: z.string(), link: link(), logo: media(), ...showOnSite }),
  'coin-trackers': z.object({
    name: z.string(),
    link: link(),
    logo: media(),
    logoHover: media(),
    ...showOnSite,
  }),
  'social-links': z.object({
    name: z.string(),
    link: link(),
    icon: media(),
    iconHover: media(),
    ...showOnSite,
  }),
  faq: z.object({ question: z.string(), answer: richText(), ...showOnSite }).strict(),
  events: z
    .object({
      date: z.string().regex(/^\d{4}-\d{2}$/, 'expected YYYY-MM'),
      title: z.string(),
      content: richText().nullish(),
      images: z
        .array(media())
        .transform((list) => list.map((image) => ({ image })))
        .nullish(),
      video: video().optional(),
      order: z.number().optional(),
      ...showOnSite,
    })
    .strict(),
}

export type SettingsName = keyof typeof settingsSchemas
export type ListName = keyof typeof listSchemas
/** lists stored as one markdown file per item (front matter + body) */
export const MARKDOWN_LISTS: Partial<Record<ListName, string>> = {
  faq: 'answer',
  events: 'content',
}
