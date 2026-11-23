import { expect, test } from '@playwright/test'

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3000'

test.describe('Site layout', () => {
  test('header, footer and newsletter render on a content page', async ({ page }) => {
    await page.goto(`${BASE}/faq`)
    const nav = page.getByRole('navigation', { name: 'Main' })
    await expect(nav.getByRole('link', { name: 'FAQ' })).toHaveClass(/text-primary/) // active
    await expect(page.getByRole('link', { name: 'Download wallet' }).first()).toHaveAttribute(
      'href',
      '/#download',
    )
    await expect(page.locator('footer')).toContainText('Proudly blocked in China')
    await expect(page.getByPlaceholder('Email for Obyte newsletter')).toBeVisible()
  })

  test('desktop dropdown opens on hover', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`${BASE}/`)
    const nav = page.getByRole('navigation', { name: 'Main' })
    await expect(nav.getByRole('link', { name: 'Oracles' })).toBeHidden()
    await nav.getByRole('link', { name: /^Platform/ }).hover()
    await expect(nav.getByRole('link', { name: 'Oracles' })).toBeVisible()
  })

  test('mobile menu opens, expands a submenu and closes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(`${BASE}/`)
    await page.getByRole('button', { name: 'Open menu' }).click()
    const menu = page.getByRole('navigation', { name: 'Mobile' })
    await expect(menu.getByRole('link', { name: 'Applications' })).toBeVisible()
    await menu.getByRole('button', { name: 'Expand Platform' }).click()
    await expect(menu.getByRole('link', { name: 'Oracles' })).toBeVisible()
    await page.getByRole('button', { name: 'Close menu' }).click()
    await expect(menu.getByRole('link', { name: 'Applications' })).toBeHidden()
  })

  test('textcoin links show the claim banner', async ({ page }) => {
    await page.goto(`${BASE}/#textcoin?fringe-scheme-erode-wish-cross-mule`)
    await expect(page.getByRole('heading', { name: 'You received money!' })).toBeVisible()
    await expect(page.getByText('fringe-scheme-erode-wish-cross-mule')).toBeVisible()
  })

  test('unknown pages return 404', async ({ page }) => {
    const res = await page.goto(`${BASE}/definitely-not-a-page`)
    expect(res?.status()).toBe(404)
  })

  test('links open the next page at its top; back restores; #anchors clear the header', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`${BASE}/faq`)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.locator('footer a[href="/platform"]').first().click()
    await page.waitForURL(/\/platform$/)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)

    await page.goBack()
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000)

    await page.getByRole('link', { name: 'Download wallet' }).first().click()
    await page.waitForURL(/#download$/)
    await expect
      .poll(() =>
        page.evaluate(() => {
          const top = document.getElementById('download')!.getBoundingClientRect().top
          const header = document.getElementById('header')!.getBoundingClientRect().height
          return Math.abs(Math.round(top - header))
        }),
      )
      .toBe(0)
  })

  test('/downloads/<name> redirects to the current release file', async ({ request }) => {
    for (const name of ['Obyte-win64.exe', 'Byteball-osx64.dmg', 'Obyte-test-linux64.zip']) {
      const res = await request.get(`${BASE}/downloads/${name}`, { maxRedirects: 0 })
      expect(res.status(), name).toBe(303)
      expect(res.headers().location).toMatch(/^https:\/\/github\.com\/byteball\//)
    }
    const missing = await request.get(`${BASE}/downloads/nope.exe`, { maxRedirects: 0 })
    expect(missing.status()).toBe(404)
  })
})
