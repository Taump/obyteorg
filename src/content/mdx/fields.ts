/**
 * Field schemas shared by MDX attributes and YAML data. MDX attribute values are strings (literal
 * only), so numbers and booleans are coerced; rich text accepts the markdown tree of MDX children
 * or a markdown string from YAML; media accepts a /media/… path (or { src, alt }).
 */
import type { Root } from 'mdast'
import { z } from 'zod'

import { MediaError, resolveMedia } from '../media'
import type { Media } from '../types'
import { isSafeUrl } from '@/shared/lib/safeUrl'

let parseMarkdown: ((src: string) => Root) | null = null
/** Set by parse.ts (avoids an import cycle: the parser needs the registry, the registry the parser). */
export const bindMarkdownParser = (fn: (src: string) => Root) => {
  parseMarkdown = fn
}

const isRoot = (v: unknown): v is Root =>
  typeof v === 'object' && v !== null && (v as Root).type === 'root'

/** Rich text: MDX children (mdast root) or a markdown string (YAML). */
export const richText = () =>
  z
    .union([z.custom<Root>(isRoot, 'expected markdown'), z.string()])
    .transform((v) => (typeof v === 'string' ? parseMarkdown!(v) : v))

const isMedia = (v: unknown): v is Media =>
  typeof v === 'object' && v !== null && typeof (v as Media).url === 'string' && 'mimeType' in v

/**
 * Image of public/media: "/media/x.png" or { src, alt }; an already resolved image passes as is
 * (a child element is validated on its own, then again as part of its parent).
 */
export const media = () =>
  z
    .union([
      z.string(),
      z.object({ src: z.string(), alt: z.string().optional() }),
      z.custom<Media>(isMedia),
    ])
    .transform((v, ctx) => {
      if (isMedia(v)) return v
      const { src, alt } = typeof v === 'string' ? { src: v, alt: undefined } : v
      try {
        return resolveMedia(src, alt)
      } catch (e) {
        if (!(e instanceof MediaError)) throw e
        ctx.addIssue({ code: 'custom', message: e.message })
        return z.NEVER
      }
    })

/** Link target: relative path, #anchor, mailto:, http(s), or a {token}/… site link. */
export const link = () => z.string().refine(isSafeUrl, { message: 'unsafe or invalid URL' })

/** Number given as an MDX string attribute. */
export const num = () => z.coerce.number()

/** Flag attribute: `<X white />` (true), or "true"/"false" in MDX, a boolean in YAML. */
export const flag = () =>
  z.union([z.boolean(), z.enum(['true', 'false'])]).transform((v) => v === true || v === 'true')

/** youtube:ID / vimeo:ID → { provider, videoId } */
export const video = () =>
  z
    .union([
      z.string().regex(/^(youtube|vimeo):[\w-]+$/, 'expected youtube:ID or vimeo:ID'),
      z.object({ provider: z.enum(['youtube', 'vimeo']), videoId: z.string() }),
    ])
    .transform((v) => {
      if (typeof v !== 'string') return v
      const [provider, videoId] = v.split(':') as ['youtube' | 'vimeo', string]
      return { provider, videoId }
    })
