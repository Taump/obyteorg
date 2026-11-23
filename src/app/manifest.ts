import type { MetadataRoute } from 'next'

/** Web app manifest. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Obyte',
    short_name: 'Obyte',
    start_url: '/',
    display: 'browser',
    background_color: '#f7f7f7',
    theme_color: '#1560bd',
    icons: [{ src: '/icon2.png', sizes: '192x192', type: 'image/png' }],
  }
}
