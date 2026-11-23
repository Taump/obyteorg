/** Link attributes for links flagged "open in new tab" (`newTab: true` in the settings). */
export const newTabProps = (newTab?: boolean | null) =>
  newTab ? ({ target: '_blank', rel: 'noopener' } as const) : {}
