// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { isActivePath } from '@/shared/lib/isActivePath'
import { parseTextcoin } from '@/widgets/TextcoinBanner/TextcoinBanner'

describe('textcoin links', () => {
  it('accepts mnemonic words', () => {
    expect(parseTextcoin('#textcoin?fringe-scheme-erode-wish')).toBe('fringe-scheme-erode-wish')
  })
  it('ignores anything else', () => {
    expect(parseTextcoin('#download')).toBeNull()
    expect(parseTextcoin('#textcoin?<img src=x onerror=alert(1)>')).toBeNull()
    expect(parseTextcoin('#textcoin?a b')).toBeNull()
    expect(parseTextcoin('#textcoin?')).toBeNull()
  })
})

describe('active navigation item', () => {
  it('matches the page and its children', () => {
    expect(isActivePath('/platform', '/platform')).toBe(true)
    expect(isActivePath('/platform/oracles', '/platform')).toBe(true)
    expect(isActivePath('/platforms', '/platform')).toBe(false)
  })
  it('never marks anchors or external links', () => {
    expect(isActivePath('/', '/#download')).toBe(false)
    expect(isActivePath('/', 'https://blog.obyte.org')).toBe(false)
    expect(isActivePath('/faq', '/')).toBe(false)
  })
})
