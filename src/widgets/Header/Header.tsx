import { SiteLink } from '@/shared/ui/SiteLink'

import type { Header as HeaderData } from '@/content/types'
import { buttonBase, buttonPrimary } from '@/shared/ui/button'
import { containerClass } from '@/shared/ui/layout'
import { Logo } from '@/shared/ui/Logo'
import { cn } from '@/shared/lib/cn'

import { DesktopNav } from './DesktopNav'
import { ScrollWatcher } from './ScrollWatcher'

/**
 * Fixed site header (`section#header`). Heights come from its content: logo 62px + 20/18px
 * padding = 100px; ≤840px logo 38px + 9/9 = 56px; scrolled: 3rem with a 28px logo.
 */
export function Header({ data }: { data: HeaderData }) {
  return (
    <header
      id="header"
      className={cn(
        'fixed top-0 z-[4] w-full bg-header font-noto text-[0.7rem] font-bold text-dark',
        'shadow-[0_1px_0_rgba(69,108,145,0.12)] transition-all duration-500 in-data-scrolled:h-[3rem]',
      )}
    >
      <ScrollWatcher />
      <div className={cn(containerClass, 'h-full')}>
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-[1_0_0] items-center pb-[18px] pt-[20px] transition-all duration-500 max-md:mr-[2rem] max-md:py-[9px]">
            <Logo
              priority
              imgClassName={cn(
                'block h-[62px] transition-all duration-500 max-md:h-[38px]',
                'in-data-scrolled:h-[28px] max-md:in-data-scrolled:h-[28px]',
              )}
            />
          </div>
          <div className="flex flex-[1_0_0] items-center justify-end max-md:hidden">
            <div className="flex items-center justify-center">
              <DesktopNav items={data.navItems ?? []} />
              {data.cta?.link && (
                <SiteLink
                  href={data.cta.link}
                  className={cn(buttonBase, buttonPrimary, 'px-[19px] py-8 text-[16px]/[normal]')}
                >
                  {data.cta.label}
                </SiteLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
