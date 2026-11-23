'use client'

import Image from 'next/image'
import {
  type CSSProperties,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import arrowLeft from '@/shared/assets/home/arrow-left.svg'
import arrowRight from '@/shared/assets/home/arrow-right.svg'
import { clsx } from 'clsx'

type Point = { id?: string | null; date: string; title: string }

/** Slide animation: 300 ms ease-out, 0.85 edge resistance (Swiper-like feel). */
const SPEED = 300
const RESISTANCE = 0.85
/** narrow screens centre the current slide */
const CENTERED_MAX_WIDTH = 450

type Geometry = { snaps: number[]; min: number; max: number }

/**
 * Snap positions (translateX values) like Swiper 4 with `slidesPerView: 'auto'`: one per slide,
 * clamped to the wrapper bounds; with centered slides every slide snaps to the middle.
 */
function measure(container: HTMLElement, wrapper: HTMLElement, centered: boolean): Geometry {
  const slides = [...wrapper.children] as HTMLElement[]
  const size = container.clientWidth
  const offsets = slides.map((s) => s.offsetLeft)
  const lastSlide = slides[slides.length - 1]
  const total = lastSlide ? lastSlide.offsetLeft + lastSlide.offsetWidth : 0
  if (centered) {
    const snaps = slides.map((s, i) => -(offsets[i] - (size - s.offsetWidth) / 2))
    return { snaps, min: snaps[snaps.length - 1], max: snaps[0] }
  }
  const min = Math.min(0, size - total)
  const snaps = offsets.map((o) => Math.max(-o, min)).filter((v, i, a) => a.indexOf(v) === i)
  return { snaps, min, max: 0 }
}

/**
 * Timeline slider (a small replacement for Swiper).
 * Starts on the newest (last) point. Before hydration CSS puts the wrapper in the same
 * end position, so nothing jumps.
 */
export function Slider({ points }: { points: Point[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const geo = useRef<Geometry | null>(null)
  const drag = useRef<{ x: number; start: number; t: number; id: number } | null>(null)
  // x: translate; index/count: current snap and number of snaps (for the arrows)
  const [state, setState] = useState<{
    x: number
    animate: boolean
    index: number
    count: number
  } | null>(null)
  const xRef = useRef<number | null>(null) // latest position, for the resize handler
  useEffect(() => {
    xRef.current = state?.x ?? null
  }, [state])

  const snapIndex = (x: number) => {
    const snaps = geo.current?.snaps ?? []
    let best = 0
    snaps.forEach((s, i) => {
      if (Math.abs(s - x) < Math.abs(snaps[best] - x)) best = i
    })
    return best
  }

  const goTo = useCallback((index: number, animate = true) => {
    const snaps = geo.current?.snaps
    if (!snaps?.length) return
    const i = Math.max(0, Math.min(snaps.length - 1, index))
    setState({ x: snaps[i], animate, index: i, count: snaps.length })
  }, [])

  // measure on mount (and on resize, keeping the current slide), then jump to the last point
  useEffect(() => {
    const container = containerRef.current
    const wrapper = wrapperRef.current
    if (!container || !wrapper) return
    const isCentered = document.body.getBoundingClientRect().width <= CENTERED_MAX_WIDTH
    let first = true
    const update = () => {
      const current = geo.current && xRef.current !== null ? snapIndex(xRef.current) : Infinity
      geo.current = measure(container, wrapper, isCentered)
      goTo(first ? Infinity : current, false)
      first = false
    }
    const raf = requestAnimationFrame(update)
    const ro = new ResizeObserver(() => !first && update())
    ro.observe(container)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [goTo])

  const current = state?.index ?? Infinity
  const atStart = state !== null && current === 0
  const atEnd = state === null || current >= state.count - 1

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!state || (e.pointerType === 'mouse' && e.button !== 0)) return
    drag.current = { x: e.clientX, start: state.x, t: performance.now(), id: e.pointerId }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    const g = geo.current
    if (!d || !g || d.id !== e.pointerId) return
    let x = d.start + (e.clientX - d.x)
    // rubber band past the ends
    if (x > g.max) x = g.max + (x - g.max) * (1 - RESISTANCE)
    if (x < g.min) x = g.min + (x - g.min) * (1 - RESISTANCE)
    setState((s) => s && { ...s, x, animate: false })
  }
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId || !state) return
    drag.current = null
    const dx = e.clientX - d.x
    const from = snapIndex(d.start)
    // quick flick → neighbour slide (Swiper "short swipe"), otherwise the nearest snap
    if (performance.now() - d.t < 300 && Math.abs(dx) > 10) goTo(from + (dx < 0 ? 1 : -1))
    else goTo(snapIndex(state.x))
  }

  const controlClass =
    'mr-20 flex size-40 cursor-pointer items-center justify-center rounded-full border border-blue-2/20 bg-transparent p-0 outline-none disabled:pointer-events-none disabled:cursor-auto disabled:opacity-35'

  return (
    <div
      ref={containerRef}
      className="relative z-[1] cursor-grab select-none active:cursor-grabbing max-sm:m-0"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{ touchAction: 'pan-y' }}
    >
      <div
        ref={wrapperRef}
        className={clsx(
          'relative z-[1] mb-42 flex w-full items-start',
          // Before hydration: the end position Swiper had after slideTo(last), from the slide
          // count (--n) and the slide box (260px + 32px; ≤768px 45% + 32px; ≤450px centered).
          !state && [
            '[transform:translateX(min(0px,calc(100%_-_var(--n)*292px)))]',
            'max-sm:[transform:translateX(min(0px,calc(100%_-_var(--n)*(45%_+_32px))))]',
            'max-[451px]:[transform:translateX(calc(50%_-_(var(--n)_-_0.5)*(45%_+_32px)))]',
          ],
        )}
        style={
          state
            ? {
                transform: `translate3d(${state.x}px, 0, 0)`,
                transition: state.animate ? `transform ${SPEED}ms ease-out` : 'none',
              }
            : ({ '--n': points.length } as CSSProperties)
        }
      >
        {points.map((point) => (
          <div
            key={point.id ?? `${point.date}-${point.title}`}
            className={clsx(
              'relative mt-42 box-content w-[260px] shrink-0 select-none border-t-[5px] border-blue-2/20 pr-32 pt-40 transition-opacity duration-[250ms] ease-linear',
              'max-sm:mt-0 max-sm:w-[45%] max-sm:px-16 max-sm:pt-30',
            )}
          >
            {/* content-box: 14px + 2×5px border = 24px, centred on the line */}
            <div className="absolute -top-15 left-0 box-content size-14 rounded-full border-[5px] border-white bg-blue-2 shadow-[0_6px_20px_rgba(74,144,226,0.12)] max-sm:left-1/2 max-sm:-ml-12" />
            <div>
              <div className="mb-9 text-[12px]/[16px] font-bold text-primary">{point.date}</div>
              <div className="text-[20px]/[27px] font-normal text-text">{point.title}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="relative z-[2] flex select-none max-sm:justify-center">
        <button
          type="button"
          aria-label="Previous"
          className={controlClass}
          disabled={atStart}
          onClick={() => goTo(current - 1)}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Image src={arrowLeft} alt="previous" width={12} height={21} unoptimized />
        </button>
        <button
          type="button"
          aria-label="Next"
          className={controlClass}
          disabled={atEnd}
          onClick={() => goTo(current + 1)}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Image src={arrowRight} alt="next" width={12} height={21} unoptimized />
        </button>
      </div>
    </div>
  )
}
