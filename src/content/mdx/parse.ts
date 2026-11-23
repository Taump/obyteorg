/**
 * Parses and validates the restricted MDX of content/ (no JavaScript is ever evaluated):
 *
 *   - front matter: YAML only, between `---` lines at the very start;
 *   - no import/export, no {expressions} (in text or attributes), no spread attributes;
 *   - components only from the registry, at the level they belong to (sections at the top of a
 *     page, content blocks inside sections, child elements inside their parent);
 *   - lowercase HTML only from HTML_TAGS, with literal attributes;
 *   - markdown images `![alt](/media/x.png)` become Image blocks.
 *
 * Every component element gets `data.block` — the validated object its React component renders
 * (see RichText.tsx); the same tree feeds the markdown twin (markdown.ts).
 */
import fs from 'node:fs'
import path from 'node:path'

import type { Image, PhrasingContent, Root, RootContent } from 'mdast'
import type { MdxJsxAttribute, MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx-jsx'
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { parse as parseYaml } from 'yaml'
import type { z } from 'zod'

import { isSafeUrl } from '@/shared/lib/safeUrl'

import { CONTENT_DIR, PROJECT_ROOT } from '../paths'
import { bindMarkdownParser } from './fields'
import { BLOCKS, HTML_TAGS, INLINE, SECTIONS, type ElementSpec } from './registry'

export type ContentIssue = { file: string; line?: number; message: string }

export class ContentError extends Error {
  constructor(public issues: ContentIssue[]) {
    super(
      `invalid content:\n` +
        issues.map((i) => `  ${i.file}${i.line ? `:${i.line}` : ''}  ${i.message}`).join('\n'),
    )
  }
}

type JsxElement = MdxJsxFlowElement | MdxJsxTextElement
type Level = 'page' | 'content'
type Ctx = { file: string; issues: ContentIssue[] }

const processor = unified().use(remarkParse).use(remarkMdx).use(remarkGfm)

const rel = (file: string) => path.relative(PROJECT_ROOT, file)

/** `---\n<yaml>\n---\n<body>`: YAML only (no `---js` / other front matter languages). */
export function splitFrontMatter(source: string, file: string) {
  if (!source.startsWith('---')) return { data: {}, body: source, bodyLine: 1 }
  const m = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(source)
  if (!m)
    throw new ContentError([
      { file, line: 1, message: 'front matter: expected "---" (YAML only), closed by "---"' },
    ])
  let data: unknown
  try {
    data = parseYaml(m[1]) ?? {}
  } catch (e) {
    throw new ContentError([{ file, line: 1, message: `front matter: ${(e as Error).message}` }])
  }
  if (typeof data !== 'object' || Array.isArray(data))
    throw new ContentError([{ file, line: 1, message: 'front matter must be a YAML mapping' }])
  const bodyLine = m[0].split('\n').length
  return { data: data as Record<string, unknown>, body: source.slice(m[0].length), bodyLine }
}

const isBlank = (n: RootContent | PhrasingContent): boolean =>
  (n.type === 'text' && !n.value.trim()) ||
  (n.type === 'paragraph' && n.children.every((c) => c.type === 'text' && !c.value.trim()))

const isJsx = (n: { type: string }): n is JsxElement =>
  n.type === 'mdxJsxFlowElement' || n.type === 'mdxJsxTextElement'

/** A paragraph that holds only one component (MDX puts inline-looking elements in paragraphs). */
const loneJsx = (n: RootContent): JsxElement | null => {
  if (isJsx(n)) return n
  if (n.type === 'paragraph') {
    const kids = n.children.filter((c) => !(c.type === 'text' && !c.value.trim()))
    if (kids.length === 1 && isJsx(kids[0]) && /^[A-Z]/.test(kids[0].name ?? '')) return kids[0]
  }
  return null
}

function attributes(el: JsxElement, ctx: Ctx, allowed?: string[]) {
  const out: Record<string, string | true> = {}
  for (const a of el.attributes) {
    if (a.type !== 'mdxJsxAttribute') {
      issue(ctx, el, `<${el.name}>: spread attributes are not allowed`)
      continue
    }
    const attr = a as MdxJsxAttribute
    if (attr.value !== null && typeof attr.value !== 'string') {
      issue(
        ctx,
        el,
        `<${el.name} ${attr.name}={…}>: expressions are not allowed, use ${attr.name}="…"`,
      )
      continue
    }
    if (allowed && !allowed.includes(attr.name)) {
      issue(ctx, el, `<${el.name}>: attribute "${attr.name}" is not allowed`)
      continue
    }
    out[attr.name] = attr.value ?? true
  }
  return out
}

function issue(ctx: Ctx, node: { position?: { start: { line: number } } }, message: string) {
  ctx.issues.push({ file: ctx.file, line: node.position?.start.line, message })
}

function dataFile(name: string, el: JsxElement, ctx: Ctx): Record<string, unknown> {
  if (!/^[\w-]+(\/[\w-]+)*$/.test(name)) {
    issue(ctx, el, `data="${name}": expected a path like home/hero`)
    return {}
  }
  const file = path.join(CONTENT_DIR, 'data', `${name}.yaml`)
  if (!fs.existsSync(file)) {
    issue(ctx, el, `data="${name}": missing ${rel(file)}`)
    return {}
  }
  try {
    const v = parseYaml(fs.readFileSync(file, 'utf8'))
    if (v && typeof v === 'object' && !Array.isArray(v)) return v
    issue(ctx, el, `${rel(file)}: expected a YAML mapping`)
  } catch (e) {
    issue(ctx, el, `${rel(file)}: ${(e as Error).message}`)
  }
  return {}
}

const root = (children: RootContent[]): Root => ({ type: 'root', children })

/** Validates a component element and stores its block object on `data.block`. */
function buildElement(el: JsxElement, spec: ElementSpec, ctx: Ctx): unknown {
  const raw: Record<string, unknown> = {}
  const attrs = attributes(el, ctx)
  if (spec.data && typeof attrs.data === 'string') Object.assign(raw, dataFile(attrs.data, el, ctx))
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'data' && spec.data) continue
    raw[k === 'anchor' && spec.level === 'section' ? 'anchorId' : k] = v
  }
  // images given as path + separate alt: image="/media/x.png" imageAlt="…"
  for (const k of Object.keys(raw))
    if (k.endsWith('Alt') && typeof raw[k.slice(0, -3)] === 'string') {
      raw[k.slice(0, -3)] = { src: raw[k.slice(0, -3)], alt: raw[k] }
      delete raw[k]
    }

  // consecutive lines `<Lead>…</Lead>\n<Text>…</Text>` parse as one paragraph of inline elements:
  // a paragraph of nothing but child elements is unwrapped into those elements
  const kids = (el.children as RootContent[]).flatMap((c) =>
    c.type === 'paragraph' &&
    c.children.some(isJsx) &&
    c.children.every(
      (k) =>
        (k.type === 'text' && !k.value.trim()) || (isJsx(k) && k.name && spec.elements?.[k.name]),
    )
      ? (c.children.filter(isJsx) as unknown as RootContent[])
      : [c],
  )
  const rest: RootContent[] = []
  for (const child of kids) {
    const childEl = loneJsx(child)
    const sub = childEl?.name ? spec.elements?.[childEl.name] : undefined
    if (childEl && sub) {
      const value = buildElement(childEl, sub.spec, ctx)
      if (sub.many) ((raw[sub.field] ??= []) as unknown[]).push(value)
      else if (sub.field in raw) issue(ctx, childEl, `<${el.name}>: only one <${childEl.name}>`)
      else raw[sub.field] = value
    } else rest.push(child)
  }
  const content = rest.filter((n) => !isBlank(n))
  if (content.length) {
    if (!spec.children) {
      const names = Object.keys(spec.elements ?? {})
      issue(
        ctx,
        content[0],
        `<${el.name}> has no markdown content` +
          (names.length ? ` (children: ${names.map((n) => `<${n}>`).join(', ')})` : ''),
      )
    } else raw[spec.children] = walk(root(content), 'content', ctx)
  }

  const parsed = (spec.schema as z.ZodType).safeParse(raw)
  if (!parsed.success) {
    for (const i of parsed.error.issues)
      issue(ctx, el, `<${el.name}> ${i.path.join('.') || ''}: ${i.message}`.replace(' : ', ': '))
    return null
  }
  // components get their blockType; child elements are plain values of their parent's field
  const value =
    spec.level !== 'child' && parsed.data && typeof parsed.data === 'object'
      ? { ...(parsed.data as object), blockType: spec.type }
      : parsed.data
  el.data = { ...el.data, block: value } as unknown as typeof el.data
  return value
}

/** Validates a markdown tree in place: sections (page level) or content (inside a section). */
function walk(tree: Root, level: Level, ctx: Ctx): Root {
  const visit = (parent: { children: RootContent[] }, inPage: boolean) => {
    for (let i = 0; i < parent.children.length; i++) {
      const node = parent.children[i]
      switch (node.type) {
        case 'mdxjsEsm':
          issue(ctx, node, 'import/export is not allowed')
          continue
        case 'mdxFlowExpression':
        case 'mdxTextExpression':
          issue(ctx, node, '{expressions} are not allowed (write \\{ for a literal brace)')
          continue
        case 'image': {
          // ![alt](/media/x.png) → Image block
          const img = node as Image
          const el: MdxJsxTextElement = {
            type: 'mdxJsxTextElement',
            name: 'Image',
            attributes: [
              { type: 'mdxJsxAttribute', name: 'src', value: img.url },
              { type: 'mdxJsxAttribute', name: 'alt', value: img.alt ?? '' },
            ],
            children: [],
            position: img.position,
          }
          parent.children[i] = el as unknown as RootContent
          buildElement(el, BLOCKS.Image, ctx)
          continue
        }
      }
      if (inPage) {
        const el = loneJsx(node)
        const spec = el?.name ? SECTIONS[el.name] : undefined
        if (el && spec) {
          parent.children[i] = el as RootContent
          buildElement(el, spec, ctx)
        } else if (!isBlank(node))
          issue(
            ctx,
            node,
            el?.name
              ? `<${el.name}> is not a page section (${Object.keys(SECTIONS).join(', ')})`
              : 'content outside of a section: wrap it in <Article> or <TextWide>',
          )
        continue
      }
      if (isJsx(node)) {
        const name = node.name
        if (!name) {
          issue(ctx, node, 'fragments <> are not allowed')
          continue
        }
        if (/^[a-z]/.test(name)) {
          const allowed = HTML_TAGS[name]
          if (!allowed)
            issue(
              ctx,
              node,
              `<${name}> is not allowed (HTML: ${Object.keys(HTML_TAGS).join(', ')})`,
            )
          else {
            const attrs = attributes(node, ctx, allowed)
            if (typeof attrs.href === 'string' && !isSafeUrl(attrs.href))
              issue(ctx, node, `<${name} href="${attrs.href}">: unsafe or invalid URL`)
          }
          visit(node as unknown as { children: RootContent[] }, false)
          continue
        }
        const spec = BLOCKS[name] ?? INLINE[name]
        if (!spec) {
          issue(
            ctx,
            node,
            SECTIONS[name]
              ? `<${name}> is a page section, it can't be nested`
              : `unknown component <${name}>`,
          )
          continue
        }
        buildElement(node, spec, ctx)
        continue
      }
      if ('children' in node) visit(node as { children: RootContent[] }, false)
    }
  }
  visit(tree, level === 'page')
  return tree
}

/** Parses an MDX page (front matter + sections). Throws ContentError with every problem found. */
export function parsePage(source: string, file: string) {
  const relFile = rel(file)
  const { data, body, bodyLine } = splitFrontMatter(source, relFile)
  const ctx: Ctx = { file: relFile, issues: [] }
  let tree: Root
  try {
    tree = processor.parse(body) as Root
  } catch (e) {
    const err = e as Error & { line?: number }
    throw new ContentError([
      { file: relFile, line: err.line ? err.line + bodyLine - 1 : undefined, message: err.message },
    ])
  }
  // report lines of the whole file, not of the body
  shiftLines(tree, bodyLine - 1)
  walk(tree, 'page', ctx)
  if (ctx.issues.length) throw new ContentError(ctx.issues)
  return { data, tree }
}

/** Parses markdown of a YAML field or a .md data file (content level). */
export function parseMarkdown(source: string, file = '(markdown)'): Root {
  const ctx: Ctx = { file, issues: [] }
  let tree: Root
  try {
    tree = processor.parse(source) as Root
  } catch (e) {
    throw new ContentError([{ file, message: (e as Error).message }])
  }
  walk(tree, 'content', ctx)
  if (ctx.issues.length) throw new ContentError(ctx.issues)
  return tree
}
bindMarkdownParser((src) => parseMarkdown(src))

function shiftLines(
  node: { position?: { start: { line: number }; end: { line: number } }; children?: unknown[] },
  by: number,
) {
  if (!by) return
  if (node.position) {
    node.position.start.line += by
    node.position.end.line += by
  }
  for (const c of (node.children ?? []) as (typeof node)[]) shiftLines(c, by)
}
