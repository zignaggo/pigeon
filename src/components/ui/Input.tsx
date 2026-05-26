import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      spellCheck={false}
      className={cn(
        'w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2.5',
        'font-mono text-sm text-[var(--sea-ink)] outline-none transition-all duration-200',
        'placeholder:text-[var(--sea-ink-soft)] placeholder:opacity-60',
        'focus:border-[var(--lagoon)] focus:shadow-[0_0_0_3px_rgba(79,184,178,0.18)]',
        'disabled:opacity-60',
        className,
      )}
      {...props}
    />
  )
}
