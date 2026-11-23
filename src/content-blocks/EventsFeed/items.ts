import type { Event, EventListBlock } from '@/content/types'

type EventItem = NonNullable<EventListBlock['items']>[number]

/** "April 2020" (UTC: event dates are stored as noon on the 1st of the month) */
const monthYear = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })

/** Events of the list as list items (newest first, optionally only the first N). */
export const eventsToItems = (events: Event[], limit?: number | null): EventItem[] =>
  events.slice(0, limit ?? undefined).map((e) => ({
    id: String(e.id),
    date: monthYear(e.date),
    title: e.title,
    content: e.content,
    images: e.images,
    video: e.video,
  }))
