'use client'

import { SiteLink } from '@/shared/ui/SiteLink'
import { usePathname } from 'next/navigation'

import type { Header } from '@/content/types'
import { clsx } from 'clsx'
import { AngleDownIcon } from '@/shared/ui/icons'

import { isActivePath } from '@/shared/lib/isActivePath'

type NavItems = NonNullable<Header['navItems']>

/** Desktop menu with hover dropdowns (`nav.dropmenu.animated`). */
export function DesktopNav({ items }: { items: NavItems }) {
  const pathname = usePathname()
  const linkState = (href: string) =>
    isActivePath(pathname, href)
      ? 'text-primary'
      : 'text-link hover:text-primary focus:text-primary'

  return (
    <nav className="mr-16 block max-md:hidden" aria-label="Main">
      <ul className="m-0 flex list-none whitespace-nowrap p-0">
        {items.map((item) => {
          const children = item.children ?? []
          return (
            <li
              key={item.id ?? item.link}
              className="group relative m-0 inline-block transition-[background,color] duration-[700ms,500ms]"
            >
              <SiteLink
                href={item.link}
                className={clsx(
                  'block p-12 text-[16px] font-bold leading-[24px]',
                  linkState(item.link),
                )}
              >
                {item.label}
                {/*
                  A trailing space before the `::after` inline-block (the chevron, empty for links
                  without a submenu): every link is one space wider — part of the menu spacing.
                */}{' '}
                <span
                  className={clsx(
                    '-mt-[3px] inline-block align-middle',
                    // the glyph box of a 12px icon font with an 18px line height
                    children.length > 0 && 'h-[18px] w-[12px] pt-[3px]',
                  )}
                >
                  {children.length > 0 && <AngleDownIcon className="block size-[12px]" />}
                </span>
              </SiteLink>
              {children.length > 0 && (
                <ul
                  className={clsx(
                    'invisible absolute top-full m-0 list-none rounded-[8px] bg-white py-8 opacity-0',
                    'shadow-[0_5px_20px_rgba(74,144,226,0.2)]',
                    '-translate-y-[10px] transition-[transform,opacity,visibility] duration-[300ms,500ms,500ms]',
                    'group-hover:visible group-hover:translate-y-0 group-hover:opacity-100',
                    'group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100',
                  )}
                >
                  {children.map((child) => (
                    <li key={child.id ?? child.link} className="relative m-0">
                      <SiteLink
                        href={child.link}
                        className={clsx(
                          'block py-4 pl-20 pr-36 text-[16px] font-bold leading-[24px] hover:bg-menu-hover hover:text-primary',
                          isActivePath(pathname, child.link) ? 'text-primary' : 'text-link',
                        )}
                      >
                        {child.label}
                      </SiteLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
