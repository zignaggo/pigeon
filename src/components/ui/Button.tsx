import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'primary' | 'send' | 'ghost'

const base =
  'rounded-[10px] px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all duration-200 ' +
  'active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100'

const disabledFill =
  'disabled:bg-muted disabled:bg-none disabled:text-muted-foreground disabled:shadow-none disabled:border disabled:border-border'

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-foreground border-0 ' +
    'shadow-[0_6px_16px_rgba(0,0,0,0.3)] hover:brightness-105 ' +
    disabledFill,
  send:
    'bg-primary text-primary-foreground border-0 ' +
    'shadow-[0_6px_16px_rgba(0,0,0,0.3)] hover:brightness-110 ' +
    disabledFill,
  ghost:
    'border-border text-foreground bg-card border ' +
    'hover:bg-accent hover:text-accent-foreground disabled:text-muted-foreground disabled:opacity-70',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }

export function Button({ variant = 'primary', className, type = 'button', ...props }: Props) {
  return <button type={type} className={cn(base, variants[variant], className)} {...props} />
}
