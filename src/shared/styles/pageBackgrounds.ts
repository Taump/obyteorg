// The header picture of each page variant, for preloading (`small`: the centre crop shown at
// ≤768px). Keep in sync with the backgrounds of pages.css.
import bg0 from '../assets/pages/technology/technology-bg.webp'
import bg1 from '../assets/pages/technology/technology-bg-sm.webp'
import bg2 from '../assets/pages/textcoins/textcoins-bg.webp'
import bg3 from '../assets/pages/textcoins/textcoins-bg-sm.webp'
import bg4 from '../assets/pages/developers/developers-bg.webp'
import bg5 from '../assets/pages/developers/developers-bg-sm.webp'
import bg6 from '../assets/pages/resources/resources.webp'
import bg7 from '../assets/pages/resources/resources-sm.webp'
import bg8 from '../assets/pages/prosaic/prosaic-contracts.webp'
import bg9 from '../assets/pages/prosaic/prosaic-contracts-sm.webp'
import bg10 from '../assets/pages/autonomous-agents/autonomous-agents.webp'
import bg11 from '../assets/pages/autonomous-agents/autonomous-agents-sm.webp'
import bg12 from '../assets/pages/testnet/testnet-bg.webp'
import bg13 from '../assets/pages/testnet/testnet-bg-sm.webp'
import bg14 from '../assets/pages/order-providers/providers-bg.webp'
import bg15 from '../assets/pages/order-providers/providers-bg-sm.webp'
import bg16 from '../assets/pages/terms-of-use/terms-bg.webp'
import bg17 from '../assets/pages/terms-of-use/terms-bg-sm.webp'
import bg18 from '../assets/pages/privacy/privacy-bg.webp'
import bg19 from '../assets/pages/privacy/privacy-bg-sm.webp'
import bg20 from '../assets/pages/grants/grants-bg.webp'
import bg21 from '../assets/pages/grants/grants-bg-sm.webp'
import bg22 from '../assets/pages/chatbots/chatbots-bg.webp'
import bg23 from '../assets/pages/chatbots/chatbots-bg-sm.webp'
import bg24 from '../assets/pages/issue-tokens/issues-bg.webp'
import bg25 from '../assets/pages/issue-tokens/issues-bg-sm.webp'
import bg26 from '../assets/pages/platform/platform-bg.webp'
import bg27 from '../assets/pages/platform/platform-bg-sm.webp'
import bg28 from '../assets/pages/payments-channels/payments-channels-bg.webp'
import bg29 from '../assets/pages/payments-channels/payments-channels-bg-sm.webp'
import bg30 from '../assets/pages/contact/contact-bg.webp'
import bg31 from '../assets/pages/contact/contact-bg-sm.webp'
import bg32 from '../assets/pages/distribution/distribution-bg.webp'
import bg33 from '../assets/pages/distribution/distribution-bg-sm.webp'
import bg34 from '../assets/pages/world-community/world-community-bg.webp'
import bg35 from '../assets/pages/world-community/world-community-bg-sm.webp'
import bg36 from '../assets/pages/careers/careers-bg.webp'
import bg37 from '../assets/pages/careers/careers-bg-sm.webp'
import bg38 from '../assets/pages/oracles/oracles-bg.webp'
import bg39 from '../assets/pages/oracles/oracles-bg-sm.webp'
import bg40 from '../assets/pages/smart-contracts/contracts-bg.webp'
import bg41 from '../assets/pages/smart-contracts/contracts-bg-sm.webp'
import bg42 from '../assets/pages/obyte-foundation/obyte-foundation-bg.webp'
import bg43 from '../assets/pages/identity/identity-bg.webp'
import bg44 from '../assets/pages/identity/identity-bg-sm.webp'
import bg45 from '../assets/pages/blackbytes/blackbytes-bg.webp'
import bg46 from '../assets/pages/blackbytes/blackbytes-bg-sm.webp'
import bg47 from '../assets/pages/faq/faq-bg.webp'
import bg48 from '../assets/pages/faq/faq-bg-sm.webp'
import bg49 from '../assets/pages/iot/iot-bg.webp'
import bg50 from '../assets/pages/iot/iot-bg-sm.webp'
import bg51 from '../assets/pages/poc/poc-bg.webp'
import bg52 from '../assets/pages/poc/poc-bg-sm.webp'
import bg53 from '../assets/pages/events/events-bg.webp'
import bg54 from '../assets/pages/events/events-bg-sm.webp'
import bg55 from '../assets/pages/community/community-bg.webp'
import bg56 from '../assets/pages/community/community-bg-sm.webp'
import bg57 from '../assets/pages/applications/applications-bg.webp'
import bg58 from '../assets/pages/applications/applications-bg-sm.webp'

export const SMALL_MAX_WIDTH = 768

export const PAGE_BACKGROUNDS: Record<string, { src: string; small: string }> = {
  'technology-wrap': { src: bg0.src, small: bg1.src },
  'textcoins-wrap': { src: bg2.src, small: bg3.src },
  'developers-wrap': { src: bg4.src, small: bg5.src },
  'resources-wrap': { src: bg6.src, small: bg7.src },
  'prosaic-contracts-wrap': { src: bg8.src, small: bg9.src },
  'autonomous-agents-wrap': { src: bg10.src, small: bg11.src },
  'testnet-wrap': { src: bg12.src, small: bg13.src },
  'order-providers-wrap': { src: bg14.src, small: bg15.src },
  'terms-of-use-wrap': { src: bg16.src, small: bg17.src },
  'privacy-wrap': { src: bg18.src, small: bg19.src },
  'grants-wrap': { src: bg20.src, small: bg21.src },
  'chatbots-wrap': { src: bg22.src, small: bg23.src },
  'issue-tokens-wrap': { src: bg24.src, small: bg25.src },
  'platform-wrap': { src: bg26.src, small: bg27.src },
  'payment-channels-wrap': { src: bg28.src, small: bg29.src },
  'contacts-wrap': { src: bg30.src, small: bg31.src },
  'distribution-wrap': { src: bg32.src, small: bg33.src },
  'community-grid-wrap': { src: bg34.src, small: bg35.src },
  'careers-wrap': { src: bg36.src, small: bg37.src },
  'oracles-wrap': { src: bg38.src, small: bg39.src },
  'smart-contracts-wrap': { src: bg40.src, small: bg41.src },
  'obyte-foundation-wrap': { src: bg42.src, small: bg42.src },
  'identity-wrap': { src: bg43.src, small: bg44.src },
  'blackbytes-wrap': { src: bg45.src, small: bg46.src },
  'faq-wrap': { src: bg47.src, small: bg48.src },
  'iot-wrap': { src: bg49.src, small: bg50.src },
  'poc-wrap': { src: bg51.src, small: bg52.src },
  'events-wrap': { src: bg53.src, small: bg54.src },
  'community-projects-wrap': { src: bg55.src, small: bg56.src },
  'applications-wrap': { src: bg57.src, small: bg58.src },
}
