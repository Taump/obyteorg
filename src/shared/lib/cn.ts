import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Our breakpoints differ from Tailwind defaults (see globals.css), teach tailwind-merge about them.
const twMerge = extendTailwindMerge({
  override: {
    theme: { breakpoint: ['xs', 'sm', 'md', 'lg', 'xl', '2x'] },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
