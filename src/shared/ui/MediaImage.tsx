import Image, { getImageProps, type ImageProps } from 'next/image'
import type { CSSProperties } from 'react'

import type { Media } from '@/content/types'

type Props = Omit<ImageProps, 'src' | 'alt' | 'width' | 'height'> & {
  media: Media | null | undefined
  alt?: string
  /**
   * Page content image at its natural size (laid out by pages.css — e.g. two photos side by side
   * in a flex row). One optimized file (AVIF/WebP) at
   * the natural width and no srcset: with a srcset the browser derives the intrinsic size from
   * the descriptors, which changes how flex rows size the image, and the optimizer never upscales
   * (a "2x" candidate of a small original would be the same pixels → shown at half size).
   */
  natural?: boolean
}

/**
 * Image of public/media. Rasters go through the next/image optimizer of the Next.js server
 * (AVIF/WebP); SVGs are served as-is (vector, the optimizer would only rasterize them).
 */
export function MediaImage({ media, alt, natural = false, ...props }: Props) {
  if (!media?.url) return null
  const isSvg = media.mimeType === 'image/svg+xml'
  const common = {
    src: media.url,
    alt: alt ?? media.alt,
    width: media.width ?? undefined,
    height: media.height ?? undefined,
  }
  if (natural && !isSvg && media.width && media.height) {
    const { props: img } = getImageProps({ ...common, ...props, unoptimized: false })
    // the 1x candidate: the smallest optimizer width ≥ the natural width
    const { srcSet, sizes: _sizes, ...rest } = img
    const src = srcSet?.split(',')[0].trim().split(' ')[0] ?? img.src
    // natural size for CSS that lays out rows of photos (pages.css: the IoT pair)
    const style = {
      ...rest.style,
      '--natural-w': `${media.width}px`,
      '--natural-ratio': `${media.width} / ${media.height}`,
    } as CSSProperties
    // eslint-disable-next-line @next/next/no-img-element -- next/image's own props, one candidate
    return <img {...rest} style={style} src={src} alt={common.alt} />
  }
  return <Image {...common} alt={common.alt} unoptimized={isSvg} {...props} />
}
