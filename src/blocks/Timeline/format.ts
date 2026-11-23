/** "Sep 2016" (UTC: month dates are stored as noon on the 1st) */
export const formatMonth = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
