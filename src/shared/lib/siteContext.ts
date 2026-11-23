import { cache } from 'react'

/**
 * Site-wide settings needed deep inside rendered content (e-mail links), per server request.
 * The page route fills it before rendering the blocks (React `cache` = request scope).
 */
export const siteContext = cache(() => ({ contactEmail: '', jobsEmail: '', explorerUrl: '' }))
