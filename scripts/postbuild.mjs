/**
 * Runs after `pnpm build`: completes the standalone server (.next/standalone/server.js) with the
 * files Next leaves out — public/ and the build's static assets — so it can be started directly
 * (`node .next/standalone/server.js`, `pnpm start:prod`, the Docker image).
 */
import fs from 'node:fs'

const out = '.next/standalone'
if (fs.existsSync(`${out}/server.js`)) {
  for (const [from, to] of [
    ['public', `${out}/public`],
    ['.next/static', `${out}/.next/static`],
  ]) {
    fs.rmSync(to, { recursive: true, force: true })
    fs.cpSync(from, to, { recursive: true })
  }
  console.log('standalone server completed with public/ and .next/static')
}
