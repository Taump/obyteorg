import fs from 'node:fs'

import { expect, test } from '@playwright/test'
import { parse as parseYaml } from 'yaml'

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3000'

test.describe('SEO and agent access', () => {
  test('page head: title, description, canonical, share tags', async ({ page }) => {
    await page.goto(`${BASE}/platform/smart-contracts`)
    await expect(page).toHaveTitle(
      'Smart Contracts | Obyte — a fully decentralized, DAG based crypto.',
    )
    const meta = (sel: string) => page.locator(`meta[${sel}]`).getAttribute('content')
    const description = await meta('name="description"')
    expect(description).toContain('Smart contracts on Obyte')
    expect(await meta('name="twitter:description"')).toBe(description)
    expect(await meta('property="og:url"')).toMatch(/\/platform\/smart-contracts$/)
    expect(await meta('property="og:image"')).toMatch(/phone-shadow\.png$/)
    expect(await meta('name="twitter:card"')).toBe('summary_large_image')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/platform\/smart-contracts$/,
    )
    // no markdown twins (removed): no alternate link
    await expect(page.locator('link[rel="alternate"][type="text/markdown"]')).toHaveCount(0)
  })

  test('structured data: FAQPage on /faq, breadcrumbs on nested pages', async ({ page }) => {
    const types = async () =>
      page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((els) => els.map((e) => JSON.parse(e.textContent!)['@type']))
    await page.goto(`${BASE}/faq`)
    expect(await types()).toContain('FAQPage')
    await page.goto(`${BASE}/platform/oracles`)
    expect(await types()).toEqual(['BreadcrumbList'])
    await page.goto(`${BASE}/`)
    expect(await types()).toEqual(['Organization', 'WebSite', 'SoftwareApplication'])
  })

  test('no markdown twins: pages answer HTML whatever Accept says', async ({ request }) => {
    expect((await request.get(`${BASE}/platform/oracles.md`)).status()).toBe(404)
    expect((await request.get(`${BASE}/llms-full.txt`)).status()).toBe(404)
    const negotiated = await request.get(`${BASE}/faq`, { headers: { Accept: 'text/markdown' } })
    expect(negotiated.headers()['content-type']).toContain('text/html')
  })

  test('llms.txt, sitemap and robots', async ({ request }) => {
    const llms = await (await request.get(`${BASE}/llms.txt`)).text()
    expect(llms).toMatch(/^# Obyte\n\n> /)
    expect(llms).toMatch(/\[Oracles\]\(https?:\/\/[^)]+\/platform\/oracles\)/)
    const sitemap = await (await request.get(`${BASE}/sitemap.xml`)).text()
    expect(sitemap).toContain('/platform/smart-contracts</loc>')
    expect(sitemap).toContain('<priority>0.6</priority>') // careers
    const robots = await (await request.get(`${BASE}/robots.txt`)).text()
    expect(robots).toContain('User-Agent: ClaudeBot')
    expect(robots).not.toContain('Disallow')
  })

  test('redirects', async ({ request }) => {
    const go = (path: string) => request.get(`${BASE}${path}`, { maxRedirects: 0 })
    expect((await go('/terms.html')).status()).toBe(308)
    expect((await go('/terms.html')).headers().location).toMatch(/\/legal\/terms$/)
    expect((await go('/home')).status()).toBe(308)
    expect((await go('/home')).headers().location).toMatch(/^(https?:\/\/[^/]+)?\/$/)
    // the coin supply for aggregators: stats.obyte.org's JSON, as the live site answers
    const coin = await go('/coin_info.json')
    expect(coin.status()).toBe(200)
    expect(await coin.json()).toHaveProperty('max_supply')
    expect((await go('/milan2019')).headers().location).toBe('https://old.obyte.org/milan2019')
    expect((await go('/discord')).status()).toBe(303)
  })

  test('wallet downloads: every name of releases.yaml, exact Location, no-store, unknown 404', async ({
    request,
  }) => {
    const releases = parseYaml(fs.readFileSync('content/settings/releases.yaml', 'utf8'))
    const site = parseYaml(fs.readFileSync('content/settings/site.yaml', 'utf8'))
    const resolve = (url: string) => url.replace(/^\{github\}/, site.githubUrl)
    expect(releases.aliases.length).toBeGreaterThan(0)
    for (const a of releases.aliases) {
      const file = releases[a.network].files.find(
        (f: { platform: string }) => f.platform === a.platform,
      )
      for (const query of ['', '?x=1']) {
        const res = await request.get(`${BASE}/downloads/${a.filename}${query}`, {
          maxRedirects: 0,
        })
        expect(res.status(), a.filename).toBe(303)
        expect(res.headers().location, a.filename).toBe(resolve(file.url))
        expect(res.headers()['cache-control']).toBe('no-store')
      }
    }
    const unknown = await request.get(`${BASE}/downloads/Obyte-unknown.exe`, { maxRedirects: 0 })
    expect(unknown.status()).toBe(404)
  })
})
