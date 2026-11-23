import type { CSSProperties } from 'react'

import type { ColumnsBlock } from '@/content/types'
import { VideoBox } from '@/shared/ui/VideoBox'

import { RichText } from '../RichText'

/**
 * Spectre `.columns` / `.column.col-N.col-sm-12` grid (this theme's sm = ≤768px), rebuilt with
 * Tailwind because Spectre's grid class names clash with Tailwind utilities.
 */
export function Columns({ block }: { block: ColumnsBlock }) {
  return (
    <div className="-mx-[0.4rem] flex flex-wrap">
      {block.columns?.map((c) => (
        <div
          key={c.id}
          className="w-(--col) max-w-full flex-none px-[0.4rem] max-sm:w-full"
          style={{ '--col': `${(Number(c.width) / 12) * 100}%` } as CSSProperties}
        >
          {/* like <iframe height="100%">: fills a stretched column, else 150px tall */}
          <VideoBox
            video={c.video}
            className="video-block [&>*]:inline-block [&>*]:h-full [&>*]:min-h-[150px] [&>*]:align-baseline"
          />
          {c.content && (
            <div className="text-block">
              <RichText data={c.content} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
