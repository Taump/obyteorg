# obyte.org — notes for Claude Code

- Content lives in `content/` (MDX + YAML) — see `docs/content.md`. The MDX dialect has no
  JavaScript; components and their attributes are defined in `src/content/mdx/registry.ts`
  (schema) and rendered by `src/blocks/*` / `src/content-blocks/*`.
- After changing content or the registry: `pnpm content:check`.
- Before claiming the site still works: `pnpm lint`, `pnpm test:int`, then build
  (`pnpm build && pnpm start:prod`) and run `pnpm test:e2e` and
  `pnpm check:links --base http://localhost:3000 --no-external`; for performance-relevant changes
  `pnpm perf` (and `PERF_PRESET=desktop pnpm perf`).
- Inner-page styles live in `src/shared/styles/pages.css` (components layer); header pictures for
  preloading in `pageBackgrounds.ts` — keep them in sync.
