import { PAGE_BACKGROUNDS, SMALL_MAX_WIDTH } from './pageBackgrounds'

/**
 * Starts loading the header picture of a page variant with the HTML (it is the largest element
 * of most inner pages, otherwise found only after the CSS has loaded) — on phones its centre
 * crop, the file the ≤768px CSS rule shows.
 *
 * A rendered <link> (React hoists it into <head>), not ReactDOM.preload(): preload() hints travel
 * in the RSC payload and run as soon as it arrives — also when a link to the page is merely
 * prefetched, which would download the header pictures of every page linked from the menu.
 */
export function PageBackgroundPreload({ variant }: { variant: string | null | undefined }) {
  const bg = variant ? PAGE_BACKGROUNDS[variant] : undefined
  if (!bg) return null
  if (bg.small === bg.src) {
    return <link rel="preload" as="image" href={bg.src} fetchPriority="high" />
  }
  return (
    <>
      <link
        rel="preload"
        as="image"
        href={bg.src}
        fetchPriority="high"
        media={`(min-width: ${SMALL_MAX_WIDTH + 1}px)`}
      />
      <link
        rel="preload"
        as="image"
        href={bg.small}
        fetchPriority="high"
        media={`(max-width: ${SMALL_MAX_WIDTH}px)`}
      />
    </>
  )
}
