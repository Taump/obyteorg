/*
 * `.btn`: Noto Sans bold pill. Composed from parts, so client components
 * can join them with plain clsx (no tailwind-merge in the browser bundle):
 *   clsx(buttonBase, buttonPrimary, size)    — size = padding + `text-[16px]/[normal]`
 * The buttons rely on the font's normal line height, hence `leading-[normal]` (and `/[normal]`
 * on the size). Padding differs per place (header 8px 19px, content 12px 19px).
 */
export const buttonBase =
  'inline-block cursor-pointer select-none whitespace-nowrap border text-center align-middle font-noto font-bold leading-[normal] no-underline transition-[background,border,box-shadow,color] duration-200 focus-visible:shadow-[0_0_0_0.1rem_rgb(48_133_238/0.2)]'

/** Hover = light-blue fill with blue text; pressed = darker blue. */
export const buttonStates =
  'hover:border-primary-dark hover:bg-primary-light hover:text-blue active:border-[#1370e3] active:bg-primary-dark active:text-white'

/** The standard blue button. */
export const buttonPrimary = `rounded-[30px] border-primary bg-blue text-white ${buttonStates}`
