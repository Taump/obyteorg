import type { EventsFeedBlock } from '@/content/types'

import { EventCards } from '../EventList/EventList'
import type { ContentLists } from '../types'
import { eventsToItems } from './items'

/** The events of content/data/events as the /events list. */
export function EventsFeed({ block, lists }: { block: EventsFeedBlock; lists: ContentLists }) {
  return <EventCards items={eventsToItems(lists.events ?? [], block.limit)} variant="events" />
}
