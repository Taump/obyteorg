import path from 'node:path'

/** Project root: the working directory of next build / next start / scripts. */
export const PROJECT_ROOT = process.cwd()
export const CONTENT_DIR = path.join(PROJECT_ROOT, 'content')
export const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public')
