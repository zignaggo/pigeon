import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'primary' | 'send' | 'ghost'

const base =
  'rounded-[10px] px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all duration-200 ' +
  'active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100'

const variants: Record<Variant, string> = {
  primary:
    'border-0 text-white bg-[linear-gradient(160deg,var(--lagoon),var(--lagoon-deep))] ' +
    'shadow-[0_6px_16px_rgba(50,143,151,0.3)] hover:brightness-105 ' +
    'disabled:bg-[var(--chip-bg)] disabled:bg-none disabled:text-[var(--sea-ink-soft)] disabled:shadow-none disabled:border disabled:border-[var(--line)]',
  send:
    'border-0 text-white bg-[linear-gradient(160deg,var(--palm),#245539)] ' +
    'shadow-[0_6px_16px_rgba(47,106,74,0.3)] hover:brightness-110 ' +
    'disabled:bg-[var(--chip-bg)] disabled:bg-none disabled:text-[var(--sea-ink-soft)] disabled:shadow-none disabled:border disabled:border-[var(--line)]',
  ghost:
    'border border-[var(--line)] text-[var(--sea-ink)] bg-[var(--surface-strong)] ' +
    'hover:bg-[var(--link-bg-hover)] disabled:text-[var(--sea-ink-soft)] disabled:opacity-70',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }

export function Button({ variant = 'primary', className, ...props }: Props) {
  return <button className={cn(base, variants[variant], className)} {...props} />
}
