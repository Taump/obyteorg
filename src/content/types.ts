/**
 * Content types of the site:
 * rich text fields hold a markdown tree (mdast) parsed from MDX/YAML, media fields hold a resolved
 * image from public/media (see src/content/media.ts).
 */
import type { Root } from 'mdast'

/** Rich text: a markdown tree (the children of an MDX element, or a parsed YAML markdown string). */
export type RichTextData = Root

export type Layout = (
  | ArticleBlock
  | TextWideBlock
  | DownloadBlock
  | HeroBlock
  | TechnologyBlock
  | IndependentBlock
  | BigChangesBlock
  | TimelineBlock
  | TeamBlock
  | ExchangesBlock
)[]

/** A page of content/pages: front matter + its sections (MDX layout elements, in order). */
export interface Page {
  /** URL path, e.g. /platform/iot */
  path: string
  /** source file relative to the project, e.g. content/pages/platform/iot/index.mdx */
  file: string
  title: string
  layout: Layout
  menuTitle?: string | null
  sitemapPriority?: number | null
  meta?: {
    title?: string | null
    description?: string | null
    ogDescription?: string | null
    image?: Media | null
  }
  /** ISO date of the last content change (content/.generated/dates.json), when known */
  updatedAt?: string | null
  /** breadcrumbs: ancestors from the root, this page last */
  breadcrumbs: { url: string; label: string }[]
}

export interface ArticleBlock {
  /**
   * Optional anchor, e.g. "download" makes /#download scroll to this block.
   */
  anchorId?: string | null
  /**
   * Page styling (header background etc.)
   */
  variant:
    | 'applications-wrap'
    | 'platform-wrap'
    | 'autonomous-agents-wrap'
    | 'smart-contracts-wrap'
    | 'identity-wrap'
    | 'payment-channels-wrap'
    | 'oracles-wrap'
    | 'issue-tokens-wrap'
    | 'blackbytes-wrap'
    | 'textcoins-wrap'
    | 'prosaic-contracts-wrap'
    | 'chatbots-wrap'
    | 'iot-wrap2'
    | 'technology-wrap'
    | 'order-providers-wrap'
    | 'developers-wrap'
    | 'faq-wrap'
    | 'contacts-wrap'
    | 'careers-wrap'
    | 'community-projects-wrap'
    | 'distribution-wrap'
    | 'community-grid-wrap'
    | 'events-wrap'
    | 'grants-wrap'
    | 'obyte-foundation-wrap'
    | 'privacy-wrap'
    | 'terms-of-use-wrap'
    | 'resources-wrap'
    | 'testnet-wrap'
  body?: RichTextData | null
  id?: string | null
  blockType: 'article'
}

export interface TextWideBlock {
  /**
   * Optional anchor, e.g. "download" makes /#download scroll to this block.
   */
  anchorId?: string | null
  variant: 'iot-wrap' | 'poc-wrap' | 'developers-wide' | 'obyte-foundation-wide'
  body?: RichTextData | null
  id?: string | null
  blockType: 'textWide'
}

export interface DownloadBlock {
  /**
   * Optional anchor, e.g. "download" makes /#download scroll to this block.
   */
  anchorId?: string | null
  network: 'mainnet' | 'testnet'
  title: RichTextData
  bigImage: Media
  smallImage: Media
  /**
   * /downloads/<file> links are resolved by the Releases global.
   */
  downloadLinks?:
    | {
        label: string
        link: string
        id?: string | null
      }[]
    | null
  body?: RichTextData | null
  id?: string | null
  blockType: 'download'
}

export interface Media {
  /** site-relative URL of the original: /media/… (public/media) */
  url: string
  /** describes the image for screen readers, search engines and AI agents */
  alt: string
  mimeType: string
  width?: number | null
  height?: number | null
}

export interface HeroBlock {
  /**
   * Optional anchor, e.g. "download" makes /#download scroll to this block.
   */
  anchorId?: string | null
  title: RichTextData
  subtitle?: string | null
  description?: string | null
  mainQuote: {
    text: RichTextData
    author: string
    /**
     * Book / manifesto title
     */
    source?: string | null
    avatar?: Media | null
    smallAvatar?: Media | null
  }
  information?:
    | {
        title: string
        text: string
        id?: string | null
      }[]
    | null
  sideQuote: {
    text: RichTextData
    author: string
    /**
     * Book / manifesto title
     */
    source?: string | null
    avatar?: Media | null
    smallAvatar?: Media | null
  }
  comparisons?:
    | {
        image: Media
        title: string
        description?: string | null
        active?: boolean | null
        id?: string | null
      }[]
    | null
  id?: string | null
  blockType: 'hero'
}

export interface TechnologyBlock {
  /**
   * Optional anchor, e.g. "download" makes /#download scroll to this block.
   */
  anchorId?: string | null
  title: RichTextData
  quote: {
    text: RichTextData
    author: string
    /**
     * Book / manifesto title
     */
    source?: string | null
    avatar?: Media | null
    smallAvatar?: Media | null
  }
  body?: RichTextData | null
  fallbackImage?: Media | null
  scenes?:
    | {
        scene: 'scene1' | 'scene2' | 'scene3'
        title: string
        text: string
        id?: string | null
      }[]
    | null
  id?: string | null
  blockType: 'technology'
}

export interface IndependentBlock {
  /**
   * Optional anchor, e.g. "download" makes /#download scroll to this block.
   */
  anchorId?: string | null
  title: string
  description?: string | null
  quote: {
    text: RichTextData
    author: string
    /**
     * Book / manifesto title
     */
    source?: string | null
    avatar?: Media | null
    smallAvatar?: Media | null
  }
  id?: string | null
  blockType: 'independent'
}

export interface BigChangesBlock {
  /**
   * Optional anchor, e.g. "download" makes /#download scroll to this block.
   */
  anchorId?: string | null
  text: string
  quote: {
    text: RichTextData
    author: string
    /**
     * Book / manifesto title
     */
    source?: string | null
    avatar?: Media | null
    smallAvatar?: Media | null
  }
  id?: string | null
  blockType: 'bigChanges'
}

export interface TimelineBlock {
  /**
   * Optional anchor, e.g. "download" makes /#download scroll to this block.
   */
  anchorId?: string | null
  title: string
  body?: RichTextData | null
  id?: string | null
  blockType: 'timeline'
}

export interface TeamBlock {
  /**
   * Optional anchor, e.g. "download" makes /#download scroll to this block.
   */
  anchorId?: string | null
  title: string
  body?: RichTextData | null
  /**
   * Leave ≥ number of members to hide the button.
   */
  visibleCount: number
  showAllLabel: string
  showLessLabel: string
  id?: string | null
  blockType: 'team'
}

export interface ExchangesBlock {
  /**
   * Optional anchor, e.g. "download" makes /#download scroll to this block.
   */
  anchorId?: string | null
  title: string
  intro?: string | null
  /**
   * Shown under the exchange logos.
   */
  body?: RichTextData | null
  id?: string | null
  blockType: 'exchanges'
}

export interface Event {
  /** stable key: file name or slug */
  id: string
  date: string
  title: string
  content?: RichTextData | null
  images?:
    | {
        image: Media
        id?: string | null
      }[]
    | null
  video?: {
    provider?: ('youtube' | 'vimeo') | null
    videoId?: string | null
  }
  /**
   * Uncheck to hide without deleting.
   */
  showOnSite?: boolean | null
}

export interface Faq {
  /** stable key: file name or slug */
  id: string
  question: string
  answer: RichTextData
  /**
   * Uncheck to hide without deleting.
   */
  showOnSite?: boolean | null
}

export interface TimelineEvent {
  /** stable key: file name or slug */
  id: string
  date: string
  title: string
  /**
   * Uncheck to hide without deleting.
   */
  showOnSite?: boolean | null
}

export interface TeamMember {
  /** stable key: file name or slug */
  id: string
  photo: Media
  name: string
  role: string
  links?:
    | {
        icon: 'github' | 'linkedin' | 'link'
        /**
         * Small square image shown in the white circle (16×16).
         */
        customIcon?: Media | null
        url: string
        id?: string | null
      }[]
    | null
  /**
   * Uncheck to hide without deleting.
   */
  showOnSite?: boolean | null
}

export interface Exchange {
  /** stable key: file name or slug */
  id: string
  name: string
  link: string
  /**
   * Shown in grayscale, in colour on hover.
   */
  logo: Media
  /**
   * Uncheck to hide without deleting.
   */
  showOnSite?: boolean | null
}

export interface CoinTracker {
  /** stable key: file name or slug */
  id: string
  name: string
  link: string
  /**
   * 48×48 round icon
   */
  logo: Media
  logoHover: Media
  /**
   * Uncheck to hide without deleting.
   */
  showOnSite?: boolean | null
}

export interface SocialLink {
  /** stable key: file name or slug */
  id: string
  name: string
  link: string
  /**
   * 32×32 round icon
   */
  icon: Media
  iconHover: Media
  /**
   * Uncheck to hide without deleting.
   */
  showOnSite?: boolean | null
}

export interface Header {
  /** stable key: file name or slug */
  id: string
  navItems?:
    | {
        label: string
        link: string
        children?:
          | {
              label: string
              link: string
              id?: string | null
            }[]
          | null
        id?: string | null
      }[]
    | null
  cta: {
    label: string
    link: string
  }
  mobileExtraLinks?:
    | {
        label: string
        link: string
        newTab?: boolean | null
        id?: string | null
      }[]
    | null
}

export interface Footer {
  /** stable key: file name or slug */
  id: string
  columns?:
    | {
        title: string
        links?:
          | {
              label: string
              link: string
              newTab?: boolean | null
              id?: string | null
            }[]
          | null
        id?: string | null
      }[]
    | null
  newsletter?: {
    enabled?: boolean | null
    /**
     * MailerLite web form submit URL
     */
    action?: string | null
    placeholder?: string | null
    buttonLabel?: string | null
    successTitle?: string | null
    successText?: string | null
  }
  /**
   * {year} is replaced with the current year
   */
  copyright?: string | null
  /**
   * Copyright line in the mobile menu ({year} = current year)
   */
  mobileCopyright?: string | null
  copyrightLink?: {
    label?: string | null
    url?: string | null
  }
}

export interface Release {
  /** stable key: file name or slug */
  id: string
  mainnet?: {
    /**
     * Current version, for reference (e.g. 5.0.2)
     */
    version?: string | null
    files?:
      | {
          platform: 'win64' | 'win32' | 'macIntel' | 'macArm' | 'linux'
          url: string
          id?: string | null
        }[]
      | null
  }
  testnet?: {
    /**
     * Current version, for reference (e.g. 5.0.2)
     */
    version?: string | null
    files?:
      | {
          platform: 'win64' | 'win32' | 'macIntel' | 'macArm' | 'linux'
          url: string
          id?: string | null
        }[]
      | null
  }
  apps?: {
    appStoreBadge?: Media | null
    googlePlayBadge?: Media | null
    mainnet?: {
      appStore?: string | null
      googlePlay?: string | null
    }
    testnet?: {
      appStore?: string | null
      googlePlay?: string | null
    }
  }
  aliases?:
    | {
        /**
         * Served at /downloads/<filename>
         */
        filename: string
        network: 'mainnet' | 'testnet'
        platform: 'win64' | 'win32' | 'macIntel' | 'macArm' | 'linux'
        id?: string | null
      }[]
    | null
}

export interface SiteSetting {
  /** stable key: file name or slug */
  id: string
  siteTitle: string
  /**
   * Used when a page has no meta description
   */
  defaultDescription: string
  /**
   * Empty = /user/themes/obyte/assets/phone-shadow.png
   */
  defaultOgImage?: Media | null
  twitterSite?: string | null
  /**
   * Short description of Obyte for AI agents (top of /llms.txt)
   */
  llmsIntro?: string | null
  /**
   * Shown wherever a page has a “Contact email” link
   */
  contactEmail: string
  /**
   * Shown wherever a page has a “Jobs email” link
   */
  jobsEmail: string
  /**
   * In links: {github}/repo-name
   */
  githubUrl?: string | null
  /**
   * In links: {explorer}/address/…
   */
  explorerUrl?: string | null
  /**
   * In links: {testnetExplorer}
   */
  testnetExplorerUrl?: string | null
  /**
   * In links: {discord}
   */
  discordUrl?: string | null
  /**
   * In links: {telegram}
   */
  telegramUrl?: string | null
}

export interface PageIntroBlock {
  /**
   * Rendered as <h1>
   */
  title: string
  lead?: RichTextData | null
  leadStyle: 'subBlock' | 'subTitle' | 'subBlockText'
  texts?:
    | {
        style: 'block' | 'blockInline' | 'paragraph' | 'plain' | 'small' | 'subParagraph'
        text: RichTextData
        id?: string | null
      }[]
    | null
  id?: string | null
  blockType: 'pageIntro'
}

export interface SpacerBlock {
  /**
   * Height in text lines
   */
  lines: number
  /** wrapped in a paragraph: <p><br><br></p> */
  paragraph?: boolean | null
  id?: string | null
  blockType: 'spacer'
}

export interface DevCalloutBlock {
  image?: Media | null
  /**
   * Small label above the title (leave empty for none)
   */
  category?: string | null
  title: string
  content?: RichTextData | null
  white?: boolean | null
  id?: string | null
  blockType: 'devCallout'
}

export interface InnerBoxBlock {
  style:
    | 'list-block d-flex'
    | 'flex-list'
    | 'text-block'
    | 'content-small'
    | 'd-flex'
    | 'container grid-xl > top-block'
    | 'top-block > container grid-xl'
    | 'event-block'
    | 'p.bullet'
    | 'p.bullet-padding'
    | 'p.med-width'
    | 'p.max-width'
    | 'p.w-550'
    | 'p.w-670'
    | 'p.w-745'
    | 'p.text-center'
    | 'h2.section-heading text-center'
    | 'small'
  content: RichTextData
  id?: string | null
  blockType: 'innerBox'
}

export interface FlexBlockBlock {
  image?: Media | null
  mobileImage?: Media | null
  imagePosition?: ('left' | 'right') | null
  kind: 'flex-block' | 'flex-text' | 'd-flex' | 'content-wrap' | 'google-block d-inline-flex'
  /**
   * Layout modifier classes, e.g. "one", "center second", "blue".
   */
  modifiers?: string | null
  /**
   * Page-specific style of the image itself
   */
  imageStyle?: ('info-img' | 'content-img' | 'img1' | 'img2' | 'mobile') | null
  /**
   * Image box modifier classes (.img-block)
   */
  imageModifiers?: string | null
  content?: RichTextData | null
  /**
   * Text without paragraph spacing
   */
  plainText?: boolean | null
  id?: string | null
  blockType: 'flexBlock'
}

export interface CardGridBlock {
  variant: 'linkCards' | 'linkLists' | 'text'
  cards?:
    | {
        title: string
        image?: Media | null
        link?: string | null
        /**
         * Link lists variant
         */
        links?:
          | {
              label: string
              link?: string | null
              /**
               * Text after the link, e.g. ": a pure JavaScript library"
               */
              description?: string | null
              id?: string | null
            }[]
          | null
        /**
         * Link lists: one row per link (with its description)
         */
        linkRows?: boolean | null
        content?: RichTextData | null
        /**
         * Card class, e.g. "one"
         */
        modifier?: string | null
        id?: string | null
      }[]
    | null
  id?: string | null
  blockType: 'cardGrid'
}

export interface WhiteBoxBlock {
  label?: string | null
  content: RichTextData
  /**
   * Text without paragraph spacing (e.g. the textcoin example)
   */
  plainText?: boolean | null
  id?: string | null
  blockType: 'whiteBox'
}

export interface BoxBlock {
  style:
    | 'list-block d-flex'
    | 'flex-list'
    | 'text-block'
    | 'content-small'
    | 'd-flex'
    | 'container grid-xl > top-block'
    | 'top-block > container grid-xl'
    | 'event-block'
    | 'p.bullet'
    | 'p.bullet-padding'
    | 'p.med-width'
    | 'p.max-width'
    | 'p.w-550'
    | 'p.w-670'
    | 'p.w-745'
    | 'p.text-center'
    | 'h2.section-heading text-center'
    | 'small'
  content: RichTextData
  id?: string | null
  blockType: 'box'
}

export interface DistributionTableBlock {
  intro?: RichTextData | null
  headings: {
    method: string
    years: string
    amount: string
    history: string
  }
  rows?:
    | {
        method: RichTextData
        years: string
        /**
         * e.g. 645,341.799 (decimals shown smaller)
         */
        amount: string
        /**
         * Obyte address(es), one per line (linked to the DAG explorer)
         */
        addresses: string
        id?: string | null
      }[]
    | null
  id?: string | null
  blockType: 'distributionTable'
}

export interface FaqFeedBlock {
  /**
   * Show only the first N questions (empty = all). Edit them in Lists → FAQ.
   */
  limit?: number | null
  id?: string | null
  blockType: 'faqFeed'
}

export interface EventListBlock {
  variant?: ('events' | 'grants') | null
  items?:
    | {
        date?: string | null
        title: string
        content?: RichTextData | null
        images?:
          | {
              image: Media
              id?: string | null
            }[]
          | null
        video?: {
          provider?: ('youtube' | 'vimeo') | null
          videoId?: string | null
        }
        id?: string | null
      }[]
    | null
  id?: string | null
  blockType: 'eventList'
}

export interface EventsFeedBlock {
  /**
   * Show only the newest N events (empty = all). Edit events in Lists → Events.
   */
  limit?: number | null
  id?: string | null
  blockType: 'eventsFeed'
}

export interface MediaListBlock {
  variant: 'resources' | 'attestors' | 'blackbytes'
  items?:
    | {
        image?: Media | null
        title?: string | null
        link?: string | null
        content?: RichTextData | null
        id?: string | null
      }[]
    | null
  id?: string | null
  blockType: 'mediaList'
}

export interface ColumnsBlock {
  columns?:
    | {
        /**
         * Width in 12-column grid (full width on mobile)
         */
        width: number
        content?: RichTextData | null
        video?: {
          provider?: ('youtube' | 'vimeo') | null
          videoId?: string | null
        }
        id?: string | null
      }[]
    | null
  id?: string | null
  blockType: 'columns'
}

export interface VideoEmbedBlock {
  provider: 'youtube' | 'vimeo'
  videoId: string
  /**
   * Accessible title of the video
   */
  title?: string | null
  id?: string | null
  blockType: 'videoEmbed'
}
