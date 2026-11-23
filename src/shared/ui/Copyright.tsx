/** Copyright line: footer.yaml text with `{year}` filled in + the optional external link. */
export function Copyright({
  text,
  year,
  link,
}: {
  text: string
  year: number
  link?: { label?: string | null; url?: string | null } | null
}) {
  return (
    <>
      {text.replace('{year}', String(year))}{' '}
      {link?.url && (
        <a href={link.url} target="_blank" rel="noopener nofollow">
          {link.label}
        </a>
      )}
      .
    </>
  )
}
