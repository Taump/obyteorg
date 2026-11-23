import type { Event, Faq } from '@/content/types'

/** Collection data some content blocks show (loaded by the page route for top-level content). */
export type ContentLists = { events?: Event[]; faq?: Faq[] }
