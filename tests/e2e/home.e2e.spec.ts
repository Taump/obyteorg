import { expect, test, type Page } from '@playwright/test'

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3000'

const sceneData = (page: Page) =>
  page.locator('object[type="image/svg+xml"]').first().getAttribute('data')

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
  })

  test('section anchors', async ({ page }) => {
    await page.goto(`${BASE}/`)
    for (const id of [
      'the-future-is-br-b-decentralized-b',
      'we-use-technology-to-assert-br-individual-freedoms',
      'big-changes',
      'timeline',
      'download',
      'team',
      'gbyte-exchanges',
    ]) {
      await expect(page.locator(`[id="${id}"]`)).toHaveCount(1)
    }
  })

  test('ledger scenes: 0 / 12 / 32 s, Replay restarts from scene 1', async ({ page }) => {
    await page.clock.install()
    await page.goto(`${BASE}/`)
    await page.getByText('Evolution of ledgers').first().scrollIntoViewIfNeeded()
    await expect.poll(() => sceneData(page)).toBe('/animation/scene1.svg')

    await page.clock.runFor(12_000)
    await expect.poll(() => sceneData(page)).toBe('/animation/scene2.svg')
    await expect(page.getByText('In blockchains, there are a few gatekeepers')).toBeVisible()

    await page.clock.runFor(20_000)
    await expect.poll(() => sceneData(page)).toBe('/animation/scene3.svg')

    await page.getByRole('button', { name: 'Replay' }).click()
    await expect.poll(() => sceneData(page)).toBe('/animation/scene1.svg')
    // the previous timers were cleared: scene 2 comes 12 s after the replay, not earlier
    await page.clock.runFor(11_000)
    await expect.poll(() => sceneData(page)).toBe('/animation/scene1.svg')
    await page.clock.runFor(1_000)
    await expect.poll(() => sceneData(page)).toBe('/animation/scene2.svg')
  })

  test('timeline starts on the newest point and moves with the arrows', async ({ page }) => {
    await page.goto(`${BASE}/#timeline`)
    const timeline = page.locator('#timeline + section')
    const next = timeline.getByRole('button', { name: 'Next' })
    const prev = timeline.getByRole('button', { name: 'Previous' })
    await expect(next).toBeDisabled()
    await expect(prev).toBeEnabled()
    const wrapper = timeline.locator('[style*="translate3d"]').first()
    const x = async () =>
      wrapper.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41)
    const end = await x()
    await prev.click()
    await expect.poll(x).toBeGreaterThan(end)
    await expect(next).toBeEnabled()
  })

  test('team: first members visible, "Show all" reveals the rest', async ({ page }) => {
    await page.goto(`${BASE}/#team`)
    const team = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: 'Team' }) })
    const members = team.locator('[data-extra]')
    await expect(members.first()).toBeHidden()
    await team.getByRole('button', { name: 'Show all' }).click()
    await expect(members.first()).toBeVisible()
    await team.getByRole('button', { name: 'Show less' }).click()
    await expect(members.first()).toBeHidden()
  })
})
