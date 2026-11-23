'use client'

import { useState } from 'react'

import { clsx } from 'clsx'

type Props = {
  provider: 'youtube' | 'vimeo'
  videoId: string
  title?: string | null
  className?: string
}

const embedUrl = ({ provider, videoId }: Pick<Props, 'provider' | 'videoId'>) =>
  provider === 'youtube'
    ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1`
    : `https://player.vimeo.com/video/${encodeURIComponent(videoId)}?autoplay=1`

/**
 * Click-to-load video: shows the poster and a play button, loads the player iframe (~1 MB of JS)
 * only when the visitor asks for it.
 */
export function VideoFacade({ provider, videoId, title, className }: Props) {
  const [playing, setPlaying] = useState(false)
  const label = title || 'Play video'

  if (playing) {
    return (
      <iframe
        src={embedUrl({ provider, videoId })}
        title={label}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className={clsx('size-full border-0', className)}
      />
    )
  }

  const poster =
    provider === 'youtube'
      ? `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`
      : `https://vumbnail.com/${encodeURIComponent(videoId)}.jpg`

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={label}
      className={clsx(
        'group relative block size-full cursor-pointer overflow-hidden bg-black',
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- third-party poster, not optimizable */}
      <img src={poster} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
      <svg
        viewBox="0 0 68 48"
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-48 w-68 -translate-x-1/2 -translate-y-1/2 opacity-90 group-hover:opacity-100"
      >
        <path
          d="M66.5 7.7a8.6 8.6 0 0 0-6-6C55.2 0 34 0 34 0S12.8 0 7.5 1.7a8.6 8.6 0 0 0-6 6C0 13 0 24 0 24s0 11 1.5 16.3a8.6 8.6 0 0 0 6 6C12.8 48 34 48 34 48s21.2 0 26.5-1.7a8.6 8.6 0 0 0 6-6C68 35 68 24 68 24s0-11-1.5-16.3z"
          className="fill-[#212121] group-hover:fill-[#f00]"
        />
        <path d="M45 24 27 14v20" fill="#fff" />
      </svg>
    </button>
  )
}
