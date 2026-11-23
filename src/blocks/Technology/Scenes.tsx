'use client'

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import replayIcon from '@/shared/assets/home/replay.svg'
import { clsx } from 'clsx'

type Scene = { id?: string | null; scene: string; title: string; text: string }

/** Scene 1 at once, scene 2 after 12 s, scene 3 after 32 s. */
const SCENE_DELAYS = [0, 12_000, 32_000]
/** Start loading the SVGs a bit before the section scrolls into view. */
const PRELOAD_MARGIN = '200px'

// inline-block (not inline): while the SVG loads the browser renders the fallback
// content, and an inline <object> would then lose its 560px height
const objectClass = clsx(
  'pointer-events-none inline-block h-[560px] w-full max-[641px]:aspect-square max-[641px]:h-auto',
  '[@media(min-width:320px)_and_(max-width:960px)_and_(orientation:landscape)]:h-[250px]',
)

/**
 * "Evolution of ledgers": SMIL-animated SVG scenes shown one after another. The SVGs are
 * untouched originals in public/animation/
 * embedded with <object> as before; remounting the <object> (React key) restarts its SMIL
 * timeline from the start (like `container.innerHTML = scene.outerHTML`).
 *
 * Differences that don't change what users see: the SVGs load only when the section approaches
 * the viewport, and with prefers-reduced-motion each scene is shown at its final frame.
 */
export function Scenes({ scenes, fallback }: { scenes: Scene[]; fallback?: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const [current, setCurrent] = useState(0)
  const [run, setRun] = useState(0) // bumps on replay → remounts the <object>
  const [near, setNear] = useState(false)

  const replay = useCallback(() => {
    timers.current.forEach(clearTimeout)
    setCurrent(0)
    setRun((r) => r + 1)
    timers.current = SCENE_DELAYS.slice(1, scenes.length).map((delay, i) =>
      setTimeout(() => setCurrent(i + 1), delay),
    )
  }, [scenes.length])

  // load the SVGs once the section is close to the viewport; the sequence starts right away
  // (as on page load), and the scroll rule below restarts it when the user gets there
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        setNear(true)
        replay()
      },
      { rootMargin: PRELOAD_MARGIN },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      timers.current.forEach(clearTimeout)
    }
  }, [replay])

  // restart when the page is scrolled into [top − 0.2·h, top + 1.2·h] of the block,
  // arm again after leaving that window
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const height = el.offsetHeight
    let inside = false
    const onScroll = () => {
      const top = el.getBoundingClientRect().top + window.scrollY
      const y = window.scrollY
      const nowInside = y >= top - height * 0.2 && y <= top + height * 1.2
      if (nowInside && !inside) replay()
      inside = nowInside
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [replay])

  const scene = scenes[current]
  if (!scene) return null
  return (
    <div ref={containerRef} className="relative w-[560px] max-[641px]:w-full">
      <div className={scene.scene}>
        {near ? (
          <object
            key={`${run}-${current}`}
            type="image/svg+xml"
            data={`/animation/${scene.scene}.svg`}
            aria-label="dag animation"
            className={objectClass}
            onLoad={freezeIfReducedMotion}
          >
            {fallback}
          </object>
        ) : (
          // same box as the <object> (inline replaced element on the text baseline)
          <span className={objectClass} />
        )}
        <div>
          <div className="flex justify-between max-[641px]:flex-col-reverse">
            <h2 className="m-0 w-auto font-sans text-[24px]/[33px] font-semibold not-italic text-link max-[641px]:mt-10">
              {scene.title}
            </h2>
            <button
              type="button"
              onClick={replay}
              className="flex cursor-pointer items-center border-0 bg-transparent p-0 text-left font-sans"
            >
              <span
                className="mr-6 block size-20 rounded-full border border-blue/20 bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${replayIcon.src})` }}
              />
              <span className="text-[12px] italic text-blue">Replay</span>
            </button>
          </div>
          <div className="flex items-center max-[641px]:flex-col">
            <div className="mr-16 w-auto text-[46px] font-light text-link max-[641px]:m-0 max-[641px]:w-full">
              {current + 1}
            </div>
            <div className="text-[16px] italic text-text">{scene.text}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** prefers-reduced-motion: jump each scene's SMIL timeline to its end state and stop it. */
function freezeIfReducedMotion(e: React.SyntheticEvent<HTMLObjectElement>) {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const svg = e.currentTarget.contentDocument?.documentElement as SVGSVGElement | undefined
  if (!svg?.pauseAnimations) return
  svg.setCurrentTime(60)
  svg.pauseAnimations()
}
