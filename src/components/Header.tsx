export function Header() {
  return (
    <header className="flex items-center gap-3.5">
      <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[linear-gradient(160deg,var(--lagoon),var(--palm))] text-[26px] shadow-[0_6px_16px_rgba(47,106,74,0.28)] transition-transform duration-300 hover:scale-105 hover:-rotate-6">
        🕊️
      </div>
      <div>
        <h1 className="display-title m-0 text-[28px] font-bold text-[var(--sea-ink)]">
          Pigeon
        </h1>
        <p className="mt-0.5 text-[13px] text-[var(--sea-ink-soft)]">
          Transferência na rede local · TCP 7878
        </p>
      </div>
    </header>
  )
}
