/**
 * Images of the site: originals in public/media, served through the next/image optimizer.
 * A media field in MDX/YAML is a site path (`/media/platform/img4.png`); it resolves to
 * { url, alt, mimeType, width, height } — dimensions read from the file, alt from
 * content/media.yaml (`<path>: <alt>`) unless the usage gives its own.
 */
import fs from 'node:fs'
import path from 'node:path'

import { imageSize } from 'image-size'
import { parse as parseYaml } from 'yaml'

import type { Media } from './types'
import { CONTENT_DIR, PUBLIC_DIR } from './paths'

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
}

let alts: Record<string, string> | null = null
/** content/media.yaml: alt texts by site path. */
function mediaAlts(): Record<string, string> {
  if (!alts) {
    const file = path.join(CONTENT_DIR, 'media.yaml')
    alts = fs.existsSync(file) ? (parseYaml(fs.readFileSync(file, 'utf8')) ?? {}) : {}
  }
  return alts!
}

const cache = new Map<string, Media>()

export class MediaError extends Error {}

/** Resolves a site path of public/media; throws MediaError for unknown or unsafe paths. */
export function resolveMedia(src: string, alt?: string | null): Media {
  if (!/^\/media\/[\w./-]+$/.test(src) || src.includes('..'))
    throw new MediaError(`not a /media/… path: ${src}`)
  const key = `${src}\u0000${alt ?? ''}`
  const hit = cache.get(key)
  if (hit) return hit
  const file = path.join(PUBLIC_DIR, src)
  if (!fs.existsSync(file)) throw new MediaError(`missing file public${src}`)
  const ext = path.extname(file).toLowerCase()
  const mimeType = MIME[ext]
  if (!mimeType) throw new MediaError(`unsupported image type: ${src}`)
  const text = alt ?? mediaAlts()[src]
  if (text == null) throw new MediaError(`no alt text for ${src} (content/media.yaml or alt="…")`)
  let width: number | null = null
  let height: number | null = null
  try {
    const size = imageSize(fs.readFileSync(file))
    width = size.width ?? null
    height = size.height ?? null
  } catch {
    if (mimeType !== 'image/svg+xml') throw new MediaError(`unreadable image: ${src}`)
  }
  const media: Media = { url: src, alt: text, mimeType, width, height }
  cache.set(key, media)
  return media
}
