import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  output: 'standalone',
  // images of public/media are optimized by this server (next/image): AVIF/WebP, srcset widths
  images: {
    localPatterns: [{ pathname: '/media/**' }],
    formats: ['image/avif', 'image/webp'],
    // the originals change only with a new build; optimized variants are kept for a month
    minimumCacheTTL: 2_592_000,
  },
  poweredByHeader: false,
  // the site only (scripts/ and tests/ are checked by `tsc` / lint, and aren't in the Docker build)
  typescript: { tsconfigPath: 'tsconfig.build.json' },
  trailingSlash: false,
  /** Permanent addresses of earlier URLs (308), archived pages (303). */
  async redirects() {
    return [
      { source: '/terms.html', destination: '/legal/terms', permanent: true },
      { source: '/privacy.html', destination: '/legal/privacy', permanent: true },
      { source: '/testnet.html', destination: '/testnet', permanent: true },
      // an alias of the home page
      { source: '/home', destination: '/', permanent: true },
      // `^milan.*` → the archived Milan conference pages
      { source: '/:page(milan.*)', destination: 'https://old.obyte.org/:page', statusCode: 303 },
      // the sitemap's earlier address
      { source: '/sitemap', destination: '/sitemap.xml', permanent: true },
    ]
  },
  /** The coin supply for aggregators: answered with stats.obyte.org's JSON (200), as obyte.org does. */
  async rewrites() {
    return [{ source: '/coin_info.json', destination: 'https://stats.obyte.org/coin_info.json' }]
  },
  async headers() {
    /*
     * CSP for the public site. No nonces: they make every page dynamic (no SSG). Scripts may only
     * come from our origin; 'unsafe-inline' is needed for Next's inline bootstrap scripts.
     * XSS is prevented at the source (no HTML/JS in content, URL allow-list). Dev adds
     * 'unsafe-eval' for React Refresh.
     */
    const dev = process.env.NODE_ENV !== 'production'
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://i.ytimg.com https://vumbnail.com",
      "font-src 'self'",
      `connect-src 'self' https://static.mailerlite.com${dev ? ' ws:' : ''}`,
      // 'self': Chrome loads <object> documents (the animated SVG scenes) as frames
      "frame-src 'self' https://www.youtube-nocookie.com https://player.vimeo.com",
      "form-action 'self' https://static.mailerlite.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      // the home page's animated SMIL scenes are <object type="image/svg+xml"> from /animation/
      "object-src 'self'",
      // only on an https site: on http (e.g. a test run on http://IP:3000) the browser would
      // rewrite every image/script/style request to https and they would all fail
      ...(!dev && process.env.NEXT_PUBLIC_SERVER_URL?.startsWith('https://')
        ? ['upgrade-insecure-requests']
        : []),
    ].join('; ')
    const security = [
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
      },
    ]
    return [
      { source: '/:path*', headers: security },
      {
        source: '/:path*',
        headers: [{ key: 'Content-Security-Policy', value: csp }],
      },
      {
        // font file names carry the font version (scripts/build-fonts.sh) → safe to cache forever
        source: '/fonts/:file*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // images of public/media: a file may be replaced under the same name → a day in the
        // browser, a week of stale-while-revalidate (Cloudflare/browsers refresh in the background)
        source: '/media/:file*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        // unversioned files in public/: the animation scenes, the white paper, share images
        source: '/:dir(animation|user)/:file*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/Byteball.pdf',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        // SVGs are checked by content:check; if one is opened directly it still can't run code.
        source: '/media/:file*.svg',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'none'; style-src 'unsafe-inline'; img-src data:; sandbox",
          },
        ],
      },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default nextConfig
