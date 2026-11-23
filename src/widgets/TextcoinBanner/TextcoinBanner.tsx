'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react'

import phone from '@/shared/assets/phone-shadow.png'
import background from '@/shared/assets/textcoin-bg.webp'
import { clsx } from 'clsx'
import { buttonBase, buttonStates } from '@/shared/ui/button'
import { containerClass } from '@/shared/ui/layout'
import { VideoFacade } from '@/shared/ui/VideoFacade'

/*
 * Textcoins are shared as links https://obyte.org/#textcoin?<12 words>. Show the "You received
 * money!" section, open the wallet via its deep link, and
 * fall back to the app store when the wallet isn't installed.
 */
const PREFIX = '#textcoin?'
const VIDEO_ID = 'ELKpFTOJtmU'

/** Mnemonic words joined with '-' — anything else in the hash is ignored. */
export function parseTextcoin(hash: string): string | null {
  if (!hash.startsWith(PREFIX)) return null
  const words = decodeURIComponent(hash.slice(PREFIX.length)).trim()
  return /^[a-z0-9]+(-[a-z0-9]+)*$/i.test(words) ? words : null
}

type Device = { android: boolean; ios: boolean; chrome: boolean; wechat: boolean }
const detect = (ua: string): Device => ({
  android: /Android/.test(ua),
  ios: /iPhone|iPod|iPad/.test(ua),
  chrome: /Chrome/.test(ua) && !/OPR/.test(ua),
  wechat: /micromessenger/i.test(ua),
})

const subscribeHash = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}
const subscribeNothing = () => () => {}

/**
 * Where to send a visitor without the wallet: on Android the Play Store app (`market:` link with
 * the textcoin as install referrer, so the fresh wallet can pick it up), elsewhere the App Store.
 * Store links: Wallet releases → Mobile apps (mainnet).
 */
function storeUrl(
  device: Device,
  words: string,
  appStore?: string | null,
  googlePlay?: string | null,
) {
  // validated as links in releases.yaml; checked again before navigating
  const https = (u?: string | null) => (u && /^https:\/\/\S+$/i.test(u) ? u : null)
  if (!device.android) return https(appStore)
  const play = https(googlePlay)
  const pkg = play && new URL(play).searchParams.get('id')
  return pkg && /^[A-Za-z0-9._]+$/.test(pkg)
    ? `market://details?id=${pkg}&referrer=${encodeURIComponent(words)}`
    : play
}

export function TextcoinBanner({
  appStore,
  googlePlay,
}: {
  appStore?: string | null
  googlePlay?: string | null
}) {
  const pathname = usePathname()
  // Client-only values: null during SSR/prerender, read from the browser after hydration.
  const words = useSyncExternalStore(
    subscribeHash,
    () => parseTextcoin(window.location.hash),
    () => null,
  )
  const ua = useSyncExternalStore(
    subscribeNothing,
    () => navigator.userAgent,
    () => null,
  )
  const device = useMemo(() => (ua ? detect(ua) : null), [ua])
  const timers = useRef<number[]>([])

  // If the wallet app opens, the page loses focus / is hidden: cancel the store redirect.
  useEffect(() => {
    if (!words || !device) return
    const clear = () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      timers.current = []
    }
    const events: (keyof WindowEventMap)[] = ['pagehide', 'blur']
    if (device.ios || (device.android && !device.chrome)) events.push('beforeunload')
    events.forEach((e) => window.addEventListener(e, clear))
    return () => {
      clear()
      events.forEach((e) => window.removeEventListener(e, clear))
    }
  }, [words, device])

  if (!words || !device) return null

  if (device.wechat) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white p-10">
        To continue, open this page in system default browser (
        <b>&quot;Open in {device.android ? 'browser' : 'Safari'}&quot;</b>) by clicking in the upper
        right corner of this screen.
      </div>
    )
  }

  const openInApp = () => {
    const store = storeUrl(device, words, appStore, googlePlay)
    if (store) {
      timers.current.push(
        window.setTimeout(() => {
          window.top!.location.href = store
        }, 1000),
      )
    }
    if (device.ios) timers.current.push(window.setTimeout(() => window.location.reload(), 2000))
    window.location.href = `obyte:textcoin?${words}`
  }

  const mobile = device.android || device.ios

  return (
    <section
      id="textcoin"
      className="relative -mb-100 bg-[#dfeeff] bg-cover bg-top bg-no-repeat pt-102 max-sm:-mb-56 max-sm:bg-[auto_100%] max-sm:px-[1rem] max-sm:pt-56"
      style={{ backgroundImage: `url(${background.src})` }}
    >
      <div className={containerClass}>
        <div className="flex pt-50 max-sm:flex-col-reverse">
          <div className="mr-[5%] max-w-[50%] shrink-0 max-sm:max-w-none">
            <Image src={phone} alt="textcoin" className="block max-sm:max-w-full" />
          </div>
          <div>
            {pathname === '/' && (
              <div className="mb-32 h-[330px] w-full max-w-[482px] max-sm:mx-auto max-sm:mb-25">
                <VideoFacade
                  provider="youtube"
                  videoId={VIDEO_ID}
                  title="How to claim a textcoin"
                />
              </div>
            )}
            <h3 className="mt-[2rem] text-[48px] font-semibold text-link">You received money!</h3>
            {mobile ? (
              <p>
                Click the button below to open or install Obyte (Byteball) app on your device and
                claim your funds.
              </p>
            ) : (
              <p>
                <a href="#download">
                  Download and install O<sub>byte</sub> (Byteball) Wallet
                </a>{' '}
                first, then Click the button below to open app on your device and claim your funds.
              </p>
            )}
            <p>
              <button
                type="button"
                onClick={openInApp}
                className={clsx(
                  buttonBase,
                  buttonStates,
                  'h-48 w-[182px] rounded-[24px] border-success bg-success text-[16px]/[normal] text-white shadow-[0_12px_14px_rgba(51,149,14,0.2)]',
                )}
              >
                Receive funds
              </button>
            </p>
            <p>
              If the button doesn&apos;t work,{' '}
              <a href="#download">
                install O<sub>byte</sub> (Byteball) Wallet
              </a>
              , navigate to <i>Receive</i> &rarr; <i>Claim funds using textcoin</i> and paste the
              following string:
              <br />
              <b>{words}</b>
              <br />
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
