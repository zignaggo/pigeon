import { cn } from '../../lib/utils'

type Props = {
  checked: boolean
  onChange: () => void
  disabled?: boolean
}

export function Switch({ checked, onChange, disabled }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-300',
        'disabled:cursor-not-allowed disabled:opacity-60',
        checked
          ? 'border-transparent bg-[linear-gradient(160deg,var(--lagoon),var(--lagoon-deep))]'
          : 'border-[var(--line)] bg-[var(--chip-bg)]',
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300',
          checked ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  )
}
