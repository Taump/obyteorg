'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/**
 * Client-side navigation opens a new page at its top, like a full page load.
 * (Next.js only scrolls when the new page's first element is out of view, so a link in the
 * footer could open the next page half-way down.) Links with a #hash keep jumping to their
 * anchor, and back/forward keeps the browser's scroll restoration.
 */
export function ScrollToTop() {
  const pathname = usePathname()
  const popped = useRef(false)

  useEffect(() => {
    const onPop = () => (popped.current = true)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false // initial load: the browser already decided (top or #hash)
      return
    }
    if (popped.current) {
      popped.current = false
      return
    }
    if (!window.location.hash) window.scrollTo(0, 0)
  }, [pathname])

  return null
}
