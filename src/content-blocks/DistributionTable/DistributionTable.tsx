import { Fragment } from 'react'

import type { DistributionTableBlock } from '@/content/types'
import { siteContext } from '@/shared/lib/siteContext'

import { InlineRichText, RichText } from '../RichText'

/** "645,341.799" → <b>645,341</b><small>.799</small> */
function Amount({ value }: { value: string }) {
  const [int, dec] = value.split('.')
  return (
    <>
      <b>{int}</b>
      {dec && <small>.{dec}</small>}
    </>
  )
}

/** /distribution: intro + table (`.distribution-block`); addresses link to the explorer. */
export function DistributionTable({ block }: { block: DistributionTableBlock }) {
  const explorer = siteContext().explorerUrl.replace(/\/+$/, '')
  const { headings } = block
  return (
    <div className="distribution-block">
      <div className="info-block">
        <RichText data={block.intro} />
      </div>
      <table>
        <thead>
          <tr>
            <th>{headings?.method}</th>
            <th>{headings?.years}</th>
            <th>{headings?.amount}</th>
            <th>{headings?.history}</th>
          </tr>
        </thead>
        <tbody>
          {block.rows?.map((r) => (
            <tr key={r.id}>
              <td>
                <InlineRichText data={r.method} />
              </td>
              <td>{r.years}</td>
              <td>
                <Amount value={r.amount} />
              </td>
              <td>
                {r.addresses
                  .split(/\s+/)
                  .filter(Boolean)
                  .map((address, i) => (
                    <Fragment key={address}>
                      {i > 0 && (
                        <>
                          {' '}
                          <br />
                        </>
                      )}
                      <a target="_blank" rel="noopener" href={`${explorer}/address/${address}`}>
                        {address}
                      </a>
                    </Fragment>
                  ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
