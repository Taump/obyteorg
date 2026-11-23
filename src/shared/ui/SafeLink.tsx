import type { ReactNode } from 'react'

import { newTabProps } from '@/shared/lib/newTab'
import { safeHref } from '@/shared/lib/safeUrl'

/**
 * Link from content data. An empty or disallowed URL (javascript:, data: …) renders the children as
 * plain text instead of a link.
 */
export function SafeLink({
  href,
  newTab,
  className,
  children,
}: {
  href?: string | null
  newTab?: boolean | null
  className?: string
  children?: ReactNode
}) {
  const safe = safeHref(href)
  if (!safe) return <>{children}</>
  return (
    <a href={safe} className={className} {...newTabProps(newTab)}>
      {children}
    </a>
  )
}
