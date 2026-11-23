import { describe, expect, it } from 'vitest'

import { isSafeUrl } from '@/shared/lib/safeUrl'

describe('isSafeUrl', () => {
  it.each([
    '/platform/textcoins',
    '#download',
    '/#download',
    'https://obyte.org',
    'http://example.com',
    'mailto:o@obyte.org',
    'obyte:Ar2ukVqx309sX+LoC9RVOpfATgXskt+Ser5jVr3Q2FOo@obyte.org/bb#0000',
    'obyte-tn:AxBxXDnPOzE/AxLHmidAjwLPFtQ6dK3k70zM0yKVeDzC@obyte.org/bb-test#0000',
    '/Byteball.pdf',
  ])('allows %s', (url) => expect(isSafeUrl(url)).toBe(true))

  it.each([
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    ' javascript:alert(1)',
    'java\tscript:alert(1)',
    'data:text/html;base64,PHNjcmlwdD4=',
    'vbscript:msgbox(1)',
    '//evil.example.com',
    '',
  ])('rejects %s', (url) => expect(isSafeUrl(url)).toBe(false))
})
