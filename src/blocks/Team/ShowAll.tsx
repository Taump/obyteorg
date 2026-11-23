'use client'

import { type ReactNode, useState } from 'react'

import { clsx } from 'clsx'
import { buttonBase } from '@/shared/ui/button'

type Props = {
  children: ReactNode
  total: number
  visible: number
  showAllLabel: string
  showLessLabel: string
}

/**
 * "Show all / Show less" for the team grid. Members stay in the DOM; the list hides everything
 * after the first `visible` ones (the section's `visibleCount`) until expanded.
 */
export function ShowAll({ children, total, visible, showAllLabel, showLessLabel }: Props) {
  const [expanded, setExpanded] = useState(false)
  const collapsible = total > visible
  return (
    <>
      <div
        data-collapsed={(collapsible && !expanded) || undefined}
        className="relative z-[1] -ml-32 mb-10 flex flex-wrap max-sm:m-0 max-sm:mb-32 max-sm:w-full max-xs:flex-col"
      >
        {children}
      </div>
      {collapsible && (
        <div className="relative z-[1] text-center">
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            className={clsx(
              buttonBase,
              'rounded-[30px] border-blue-2/20 bg-transparent px-19 py-12 text-[0.8rem]/[normal] text-link',
              'hover:text-blue active:text-blue',
            )}
          >
            {expanded ? showLessLabel : showAllLabel}
          </button>
        </div>
      )}
    </>
  )
}
