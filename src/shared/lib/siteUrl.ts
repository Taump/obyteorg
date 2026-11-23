/**
 * Public origin of the site (https://obyte.org in production, from NEXT_PUBLIC_SERVER_URL):
 * canonical URLs, Open Graph, sitemap, llms.txt.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'https://obyte.org').replace(
  /\/+$/,
  '',
)

/** Site-relative path or URL → absolute URL (absolute URLs pass through). */
export const absoluteUrl = (pathOrUrl: string) =>
  /^[a-z][a-z0-9+.-]*:/i.test(pathOrUrl)
    ? pathOrUrl
    : `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
