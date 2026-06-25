export function Header() {
  return (
    <header className="flex items-center gap-3.5">
      <div className="bg-primary flex size-12 items-center justify-center rounded-[14px] text-[26px] shadow-[0_6px_16px_rgba(0,0,0,0.3)] transition-transform duration-300 hover:scale-105 hover:-rotate-6">
        🕊️
      </div>
      <div>
        <h1 className="display-title text-foreground m-0 text-[28px] font-bold">
          Pigeon
        </h1>
        <p className="text-muted-foreground mt-0.5 text-[13px]">
          Transferência na rede local · TCP 7878
        </p>
      </div>
    </header>
  );
}
