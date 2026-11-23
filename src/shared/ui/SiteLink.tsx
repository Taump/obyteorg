import Link from 'next/link'
import type { ComponentProps } from 'react'

/**
 * Client-side link between site pages, without Next's viewport prefetching: the menu links
 * every page, and prefetching them would download the content (and header pictures) of a dozen
 * pages on every visit. A click fetches the static page then — still without a full reload.
 */
export function SiteLink(props: ComponentProps<typeof Link>) {
  return <Link prefetch={false} {...props} />
}
