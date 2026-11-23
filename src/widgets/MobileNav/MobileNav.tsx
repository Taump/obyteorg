'use client'

import { SiteLink } from '@/shared/ui/SiteLink'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import type { Header } from '@/content/types'
import { clsx } from 'clsx'
import { isActivePath } from '@/shared/lib/isActivePath'
import { newTabProps } from '@/shared/lib/newTab'
import { buttonBase, buttonPrimary } from '@/shared/ui/button'
import { Copyright } from '@/shared/ui/Copyright'
import { ChevronDownIcon, ChevronRightIcon } from '@/shared/ui/icons'
import { Logo } from '@/shared/ui/Logo'

type Props = {
  header: Header
  /** footer copyright settings (the menu has its own, shorter line) */
  copyright: {
    text: string
    year: number
    link?: { label?: string | null; url?: string | null } | null
  }
}

const bar = 'absolute left-0 h-[2px] w-full cursor-pointer bg-link transition-all duration-[350ms]'

/**
 * Burger + full-screen menu for ≤840px; submenus open as an accordion (per-item state).
 */
export function MobileNav({ header, copyright }: Props) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    document.documentElement.toggleAttribute('data-menu-open', open)
  }, [open])

  return (
    <>
      <div className="fixed right-0 top-0 z-[4] hidden max-md:block">
        <button
          id="toggle"
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="overlay"
          onClick={() => setOpen((o) => !o)}
          className={clsx(
            'right-[1rem] top-[22px] z-[100] h-[14px] w-[22px] cursor-pointer transition-[opacity,top] duration-[250ms,500ms] hover:opacity-70',
            'in-data-scrolled:top-[20px]',
            open ? 'fixed' : 'absolute',
          )}
        >
          <span className={clsx(bar, 'top-0', open && 'translate-y-[8px] rotate-45')} />
          <span className={clsx(bar, 'top-[6px]', open && 'opacity-0')} />
          <span
            className={clsx(bar, open ? 'top-[15px] -translate-y-[8px] -rotate-45' : 'top-[12px]')}
          />
        </button>
      </div>

      <div className="absolute left-0 top-[40%] z-[2] mx-auto">
        <div
          id="overlay"
          className={clsx(
            'fixed left-0 top-0 w-full bg-header transition-[opacity,visibility,height] duration-[350ms]',
            open ? 'visible h-full' : 'invisible h-0',
          )}
          aria-hidden={!open}
        >
          <Logo className="inline" imgClassName="ml-16 mt-[9px] block h-[38px]" />
          <div className="h-[calc(100%-46px)] overflow-y-auto">
            <nav className="relative mx-auto text-center" aria-label="Mobile">
              <ul className="mx-0 mb-48 mt-60 list-none p-0 font-noto">
                {(header.navItems ?? []).map((item) => {
                  const key = item.id ?? item.link
                  const children = item.children ?? []
                  const isOpen = expanded === key
                  return (
                    <li key={key} className="relative mb-16 mt-0 list-none last:mb-0">
                      {children.length > 0 && (
                        <button
                          type="button"
                          data-toggler
                          aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${item.label}`}
                          aria-expanded={isOpen}
                          onClick={() => setExpanded(isOpen ? null : key)}
                          className="absolute -ml-[26px] mt-8 cursor-pointer text-[0.8rem] text-body-text"
                        >
                          {isOpen ? (
                            <ChevronDownIcon className="mr-[2pt] inline-block size-[1em]" />
                          ) : (
                            <ChevronRightIcon className="mr-[2pt] inline-block size-[1em]" />
                          )}
                        </button>
                      )}
                      <SiteLink
                        href={item.link}
                        onClick={() => setOpen(false)}
                        className={clsx(
                          'text-[24px] leading-[36px] hover:text-primary focus:text-primary',
                          isActivePath(pathname, item.link) ? 'text-primary' : 'text-link',
                        )}
                      >
                        {item.label}
                      </SiteLink>
                      {children.length > 0 && (
                        <div
                          className={clsx(
                            'grid transition-[grid-template-rows] duration-300',
                            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                          )}
                        >
                          <ul className="m-0 list-none overflow-hidden p-0">
                            {children.map((child) => (
                              <li key={child.id ?? child.link} className="mb-8 mt-0 list-none">
                                <SiteLink
                                  href={child.link}
                                  onClick={() => setOpen(false)}
                                  tabIndex={isOpen ? undefined : -1}
                                  className={clsx(
                                    'text-[16px] hover:text-primary focus:text-primary',
                                    isActivePath(pathname, child.link)
                                      ? 'text-primary'
                                      : 'text-link',
                                  )}
                                >
                                  {child.label}
                                </SiteLink>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </nav>
            <div className="flex flex-col items-center">
              {header.cta?.link && (
                <SiteLink
                  href={header.cta.link}
                  className={clsx(
                    buttonBase,
                    buttonPrimary,
                    'px-[19px] py-12 text-[0.8rem]/[normal]',
                  )}
                >
                  {header.cta.label}
                </SiteLink>
              )}
              <ul className="mx-0 mb-36 mt-0 list-none p-0 text-center text-[16px]">
                {(header.mobileExtraLinks ?? []).map((l) => (
                  <li key={l.id ?? l.link} className="mb-14 last:mb-0">
                    <SiteLink href={l.link} className="text-link" {...newTabProps(l.newTab)}>
                      {l.label}
                    </SiteLink>
                  </li>
                ))}
              </ul>
              <div className="max-w-[264px] border-t border-blue-2/20 pb-30 pt-15 text-center text-[12px] text-text">
                <Copyright {...copyright} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
