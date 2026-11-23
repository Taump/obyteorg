import { SiteLink } from '@/shared/ui/SiteLink'

import type { Footer as FooterData, SocialLink } from '@/content/types'
import line from '@/shared/assets/footer-line.png'
import { newTabProps } from '@/shared/lib/newTab'
import { Copyright } from '@/shared/ui/Copyright'
import { containerClass } from '@/shared/ui/layout'
import { Logo } from '@/shared/ui/Logo'
import { MediaImage } from '@/shared/ui/MediaImage'

import { Newsletter } from './Newsletter'

/** Site footer: link columns, newsletter, social icons, copyright. */
export function Footer({
  data,
  socialLinks,
  year,
}: {
  data: FooterData
  socialLinks: SocialLink[]
  year: number
}) {
  const nl = data.newsletter
  return (
    <footer
      id="footer"
      className="relative bg-body py-96 text-center font-sans text-[0.8rem] text-[#acb3c2] max-sm:px-[1rem] max-sm:pb-74 max-sm:pt-110"
    >
      <div className={containerClass}>
        <div className="mb-46 flex items-center justify-center max-sm:justify-start">
          <div
            className="h-58 grow bg-center bg-no-repeat max-sm:hidden"
            style={{ backgroundImage: `url(${line.src})` }}
          />
          <Logo className="mx-80 block shrink-0 max-sm:mx-0" imgClassName="inline h-[63px]" />
          <div
            className="h-58 grow bg-center bg-no-repeat max-sm:hidden"
            style={{ backgroundImage: `url(${line.src})` }}
          />
        </div>

        <div className="mb-8 flex justify-center max-sm:-ml-32 max-sm:mb-32 max-sm:flex-wrap">
          {(data.columns ?? []).map((col) => (
            <div
              key={col.id ?? col.title}
              className="mx-16 max-w-[160px] grow text-left max-sm:ml-32 max-sm:mr-0 max-sm:w-[calc(50%-32px)] max-sm:min-w-[160px] max-sm:max-w-none"
            >
              <div className="mb-24 text-[20px] font-light leading-[30px] text-text-2 max-sm:font-normal">
                {col.title}
              </div>
              <div className="mb-24 flex flex-col flex-wrap text-[14px]">
                {(col.links ?? []).map((l) => (
                  <SiteLink
                    key={l.id ?? l.link}
                    href={l.link}
                    className="leading-[28px] text-text max-sm:text-[16px] max-sm:leading-[48px]"
                    {...newTabProps(l.newTab)}
                  >
                    {l.label}
                  </SiteLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {nl?.enabled && nl.action && (
          <div className="mb-16 flex flex-wrap justify-center">
            {/* block wrapper: the inline-block form sits on a text line (+6px below) */}
            <div className="w-full">
              <Newsletter
                action={nl.action}
                placeholder={nl.placeholder ?? ''}
                buttonLabel={nl.buttonLabel ?? 'Subscribe'}
                successTitle={nl.successTitle ?? ''}
                successText={nl.successText ?? ''}
              />
            </div>
          </div>
        )}

        <div className="mb-16 flex flex-wrap justify-center">
          {socialLinks.map((s) => (
            <a
              key={s.id ?? s.link}
              href={s.link}
              target="_blank"
              rel="noopener"
              aria-label={s.name}
              className="group mx-8 mb-8 size-32 shrink-0"
            >
              <MediaImage
                media={s.icon}
                alt=""
                className="block size-32 rounded-full group-hover:hidden"
              />
              <MediaImage
                media={s.iconHover}
                alt=""
                className="hidden size-32 rounded-full group-hover:block"
              />
            </a>
          ))}
        </div>

        <div className="text-[12px] text-text">
          <Copyright text={data.copyright ?? ''} year={year} link={data.copyrightLink} />
        </div>
      </div>
    </footer>
  )
}
