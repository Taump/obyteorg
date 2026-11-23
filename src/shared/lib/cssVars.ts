import type { CSSProperties } from 'react'

/**
 * Static-imported images as CSS custom properties (`--name: url(…)`), for backgrounds that need
 * media queries or pseudo-elements: `style={bgVars({ bg: img })}` + `bg-(image:--bg)`.
 */
export const bgVars = (images: Record<string, { src: string }>) =>
  Object.fromEntries(
    Object.entries(images).map(([name, img]) => [`--${name}`, `url(${img.src})`]),
  ) as CSSProperties
