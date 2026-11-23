import type { Root } from 'mdast'
import { describe, expect, it } from 'vitest'

import { getAllPages, getGlobal, getList, getPublishedPaths } from '@/content/loader'
import { ContentError, parsePage } from '@/content/mdx/parse'
import { resolveLinks } from '@/content/pageData'
import { plainText } from '@/content/plainText'

const page = (body: string, front = 'title: T\n') => `---\n${front}---\n\n${body}`
const issues = (src: string) => {
  try {
    parsePage(src, 'content/pages/test.mdx')
    return []
  } catch (e) {
    if (!(e instanceof ContentError)) throw e
    return e.issues.map((i) => i.message)
  }
}
const firstBlock = (src: string) =>
  (
    parsePage(src, 'content/pages/test.mdx').tree.children[0].data as {
      block: Record<string, unknown>
    }
  ).block

describe('restricted MDX', () => {
  it('rejects JavaScript: import/export, expressions, expression attributes, spreads', () => {
    const found = issues(
      page(`import X from 'x'

<Article variant="faq-wrap">
{1 + 1}
<FaqFeed limit={3} />
<Spacer {...a} />
</Article>`),
    )
    expect(found).toEqual(
      expect.arrayContaining([
        'import/export is not allowed',
        expect.stringContaining('{expressions} are not allowed'),
        expect.stringContaining('limit={…}'),
        expect.stringContaining('spread attributes'),
      ]),
    )
  })

  it('front matter is YAML only', () => {
    expect(() => parsePage('---js\n{ title: "x" }\n---\n', 'x.mdx')).toThrow(ContentError)
  })

  it('only known components, at their level; only allowed HTML; safe URLs', () => {
    const found = issues(
      page(`Loose text.

<Article variant="faq-wrap">
<Unknown />
<Hero />
<div>x</div>
<a href="javascript:alert(1)">x</a>
</Article>`),
    )
    expect(found).toEqual(
      expect.arrayContaining([
        expect.stringContaining('content outside of a section'),
        'unknown component <Unknown>',
        expect.stringContaining('<Hero> is a page section'),
        expect.stringContaining('<div> is not allowed'),
        expect.stringContaining('unsafe or invalid URL'),
      ]),
    )
  })

  it('validates attributes against the component schema', () => {
    expect(issues(page('<Article variant="nope">x</Article>'))[0]).toMatch(/variant/)
    expect(
      issues(
        page(
          '<Article variant="faq-wrap"><FlexBlock image="/media/none.png">x</FlexBlock></Article>',
        ),
      )[0],
    ).toMatch(/missing file/)
  })

  it('builds block objects: attributes, children, child elements', () => {
    const block = firstBlock(
      page(`<Article variant="faq-wrap" anchor="faq">

<PageIntro title="FAQ">
  <Lead>Answers to *common* questions.</Lead>
  <Text style="paragraph">See [careers](/careers).</Text>
</PageIntro>

Text with <Email kind="jobs" />.

</Article>`),
    )
    expect(block).toMatchObject({ blockType: 'article', variant: 'faq-wrap', anchorId: 'faq' })
    const intro = ((block.body as Root).children[0].data as { block: Record<string, unknown> })
      .block
    expect(intro).toMatchObject({ blockType: 'pageIntro', title: 'FAQ', leadStyle: 'subBlock' })
    expect((intro.texts as unknown[]).length).toBe(1)
    expect(plainText(block.body as Root, { contactEmail: 'o@x', jobsEmail: 'jobs@x' })).toContain(
      'Text with jobs@x.',
    )
  })
})

describe('site link tokens', () => {
  it('are resolved in link fields only — text and code stay verbatim', () => {
    const block = firstBlock(
      page(`<Article variant="developers-wrap">

[repo]({github}/ocore) and the literal text \\{github\\}

\`\`\`js
const x = "{github}"
\`\`\`

</Article>`),
    )
    const resolved = resolveLinks(block, { githubUrl: 'https://github.com/byteball' })
    const json = JSON.stringify(resolved)
    expect(json).toContain('"url":"https://github.com/byteball/ocore"')
    expect(json).toContain('const x = \\"{github}\\"')
    expect(json).toContain('and the literal text {github}')
  })
})

describe('content/', () => {
  it('all pages, settings and lists are valid; every published path is unique', () => {
    const pages = getAllPages()
    expect(pages.length).toBeGreaterThanOrEqual(31)
    const paths = getPublishedPaths()
    expect(new Set(paths).size).toBe(paths.length)
    for (const g of ['site-settings', 'header', 'footer', 'releases'] as const)
      expect(getGlobal(g)).toBeTruthy()
    expect(getList('faq').length).toBeGreaterThan(0)
    expect(getList('events')[0].date >= getList('events').at(-1)!.date).toBe(true)
  })
})
