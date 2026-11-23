import Image from 'next/image'
import { SiteLink } from '@/shared/ui/SiteLink'

import logo from '@/shared/assets/obyte-logo.svg'
import { clsx } from 'clsx'

export function Logo({
  className,
  imgClassName,
  priority = false,
}: {
  /** link classes, incl. its display (default: block) */
  className?: string
  imgClassName?: string
  /** only the header logo is above the fold */
  priority?: boolean
}) {
  return (
    <SiteLink href="/" className={className ?? 'block'} aria-label="Obyte — home">
      <Image
        src={logo}
        alt="Obyte logo"
        priority={priority}
        unoptimized
        className={clsx('w-auto', imgClassName)}
      />
    </SiteLink>
  )
}
