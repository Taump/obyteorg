/**
 * Page-level styling variants of Article / TextWide sections: the class of the page's section,
 * styled in src/shared/styles/pages.css (`.faq-wrap`, `.iot-wrap` …).
 */
export const ARTICLE_VARIANTS = [
  'applications-wrap',
  'platform-wrap',
  'autonomous-agents-wrap',
  'smart-contracts-wrap',
  'identity-wrap',
  'payment-channels-wrap',
  'oracles-wrap',
  'issue-tokens-wrap',
  'blackbytes-wrap',
  'textcoins-wrap',
  'prosaic-contracts-wrap',
  'chatbots-wrap',
  'iot-wrap2',
  'technology-wrap',
  'order-providers-wrap',
  'developers-wrap',
  'faq-wrap',
  'contacts-wrap',
  'careers-wrap',
  'community-projects-wrap',
  'distribution-wrap',
  'community-grid-wrap',
  'events-wrap',
  'grants-wrap',
  'obyte-foundation-wrap',
  'privacy-wrap',
  'terms-of-use-wrap',
  'resources-wrap',
  'testnet-wrap',
] as const

export const TEXT_WIDE_VARIANTS = [
  'iot-wrap',
  'poc-wrap',
  'developers-wide',
  'obyte-foundation-wide',
] as const

/** Text-wide variants whose wrapper is also a `section.section` (side padding). */
export const TEXT_WIDE_SECTION_VARIANTS: readonly string[] = ['iot-wrap', 'poc-wrap']

