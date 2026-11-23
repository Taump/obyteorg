/** The link is the current page or one of its ancestors (active menu item). */
export const isActivePath = (pathname: string, href: string) =>
  href.startsWith('/') &&
  !href.startsWith('/#') &&
  (pathname === href || (href !== '/' && pathname.startsWith(`${href}/`)))
