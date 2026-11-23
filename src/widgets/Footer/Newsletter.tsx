'use client'

import { useState, type FormEvent } from 'react'

type Props = {
  action: string
  placeholder: string
  buttonLabel: string
  successTitle: string
  successText: string
}

/**
 * MailerLite subscription form (without MailerLite's embed CSS and webforms.js). Works without
 * JS as a plain POST to MailerLite in a new tab; with JS it submits in the background and shows
 * the success message.
 */
export function Newsletter({ action, placeholder, buttonLabel, successTitle, successText }: Props) {
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('sending')
    try {
      // MailerLite doesn't send CORS headers; the request still lands (opaque response)
      await fetch(action, { method: 'POST', body: new FormData(e.currentTarget), mode: 'no-cors' })
      setState('done')
    } catch {
      e.currentTarget.submit() // network/CSP trouble: fall back to the plain form post
    }
  }

  return (
    // overflow-hidden: baseline = bottom edge (6px line gap below); ≤400px the button is an
    // inline-block whose text sets the baseline instead
    <div className="inline-block w-full max-w-[400px] bg-body min-[401px]:overflow-hidden">
      {state === 'done' ? (
        <div className="px-20 py-20 text-left" role="status">
          <h4 className="mb-10 font-sans text-[30px] font-normal leading-[38px] text-black">
            {successTitle}
          </h4>
          <p className="m-0 text-[14px] leading-[20px] text-black">{successText}</p>
        </div>
      ) : (
        <form
          action={action}
          method="post"
          target="_blank"
          onSubmit={onSubmit}
          className="flex px-20 pb-20 pt-20 max-[400px]:flex-col"
        >
          <label className="w-[70%] pr-10 max-[400px]:mb-20 max-[400px]:w-full max-[400px]:pr-0">
            <span className="sr-only">E-mail</span>
            <input
              type="email"
              name="fields[email]"
              required
              autoComplete="email"
              placeholder={placeholder}
              className="h-[42px] w-full rounded-[25px] border border-blue bg-white p-10 font-sans text-[12px] leading-[20px] text-[#9a9a9a] outline-none focus:border-primary"
            />
          </label>
          <input type="hidden" name="ml-submit" value="1" />
          <input type="hidden" name="anticsrf" value="true" />
          <button
            type="submit"
            disabled={state === 'sending'}
            className="h-[42px] w-[30%] cursor-pointer rounded-[25px] border border-blue bg-blue p-10 font-sans text-[14px] leading-[20px] text-white hover:bg-[#0f4b94] disabled:opacity-80 max-[400px]:w-full"
          >
            {buttonLabel}
            {/* MailerLite's mobile button label ends with 5 &nbsp; — keeps the text where it was */}
            <span className="hidden max-[400px]:inline">{'\u00a0'.repeat(5)}</span>
          </button>
        </form>
      )}
    </div>
  )
}
