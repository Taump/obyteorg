'use client'

import { useEffect } from 'react'

/**
 * Past 75px of scroll the fixed header shrinks. Exposed as
 * `<html data-scrolled>` so header, logo and the mobile burger restyle via `in-data-scrolled:`.
 */
export function ScrollWatcher({ threshold = 75 }: { threshold?: number }) {
  useEffect(() => {
    const root = document.documentElement
    const update = () => root.toggleAttribute('data-scrolled', window.scrollY > threshold)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [threshold])
  return null
}
