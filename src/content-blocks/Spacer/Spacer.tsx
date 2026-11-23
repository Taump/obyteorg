import type { SpacerBlock } from '@/content/types'

/**
 * Vertical spacing: bare `<br><br>` between elements, or (`paragraph`) an
 * empty-line paragraph `<p><br><br></p>` between sections.
 */
export function Spacer({ block }: { block: SpacerBlock }) {
  const lines = Array.from({ length: block.lines ?? 2 }, (_, i) => <br key={i} />)
  return block.paragraph ? <p>{lines}</p> : lines
}
