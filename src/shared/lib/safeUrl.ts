/**
 * URL allow-list for links of the content (markdown links, link fields).
 * Allowed: relative paths and anchors, http(s), mailto, and the Obyte wallet schemes
 * (`obyte:` / `obyte-tn:` — pairing links and textcoins). Everything else (javascript:, data:, …)
 * is rejected.
 */
const ALLOWED_SCHEMES = ['http:', 'https:', 'mailto:', 'obyte:', 'obyte-tn:']

export function isSafeUrl(raw: string | null | undefined): boolean {
  if (!raw) return false
  const url = raw.trim()
  // Strip control chars/whitespace browsers ignore inside schemes ("java\tscript:")
  const normalized = url.replace(/[\u0000- \u007f]/g, '').toLowerCase()
  if (normalized.startsWith('//')) return false // protocol-relative → another host
  if (/^(\/|#|\?|\.\.?\/)/.test(normalized)) return true
  const scheme = normalized.match(/^([a-z][a-z0-9+.-]*:)/)?.[1]
  if (!scheme) return !normalized.includes(':') // bare relative path like "faq"
  return ALLOWED_SCHEMES.includes(scheme)
}

/** Returns the URL if safe, otherwise undefined (render as plain text). */
export const safeHref = (raw: string | null | undefined): string | undefined =>
  isSafeUrl(raw) ? raw!.trim() : undefined
