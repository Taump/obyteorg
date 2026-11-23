/**
 * Lighthouse CI budgets. Runs against an already started server:
 *
 *   pnpm build && pnpm start                     # or any deployed URL
 *   pnpm perf                                    # mobile (simulated slow 4G, 4× CPU)
 *   PERF_PRESET=desktop pnpm perf                # desktop
 *   PERF_BASE_URL=https://staging.obyte.org pnpm perf
 *
 * Reports: .lighthouseci/ (gitignored).
 */
const base = (process.env.PERF_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const desktop = process.env.PERF_PRESET === 'desktop'

const PAGES = [
  '/',
  '/platform',
  '/platform/identity',
  '/platform/iot',
  '/faq',
  '/developers',
  '/events',
  '/testnet',
  '/legal/terms',
]

module.exports = {
  ci: {
    collect: {
      url: PAGES.map((p) => base + p),
      numberOfRuns: 3,
      settings: {
        ...(desktop ? { preset: 'desktop' } : {}),
        chromeFlags: '--headless=new',
        onlyCategories: ['performance', 'seo', 'best-practices', 'accessibility'],
      },
    },
    assert: {
      // the median of the runs, not the best or the worst one
      aggregationMethod: 'median',
      assertions: {
        // Mobile performance is bounded by the React/Next runtime (~120 KB gzip) under the
        // simulated slow 4G + 4× CPU: with JS blocked the same pages score 99 (2026-11-23).
        // Agreed target: desktop 100 in every category; mobile 100 except performance ≥ 90.
        'categories:performance': ['error', { minScore: desktop ? 1 : 0.9 }],
        'categories:seo': ['error', { minScore: 1 }],
        'categories:best-practices': ['error', { minScore: 1 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.05 }],
        'total-blocking-time': ['error', { maxNumericValue: desktop ? 50 : 150 }],
        'largest-contentful-paint': ['error', { maxNumericValue: desktop ? 1200 : 4000 }],
        'total-byte-weight': ['error', { maxNumericValue: 1_000_000 }],
        'resource-summary:script:size': ['error', { maxNumericValue: 200_000 }],
        'resource-summary:font:size': ['warn', { maxNumericValue: 100_000 }],
      },
    },
    upload: { target: 'filesystem', outputDir: '.lighthouseci' },
  },
}
