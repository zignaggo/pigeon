import type { ReactNode } from "react";
import { cn } from "../lib/utils";

type Props = {
  icon?: string;
  title: string;
  children: ReactNode;
  className?: string;
};

export function Panel({ icon, title, children, className }: Props) {
  return (
    <section
      className={cn(
        "feature-card flex flex-col gap-2.5 rounded-2xl border border-[var(--line)] p-4 transition-all duration-200",
        className,
      )}
    >
      <div className="mb-0.5 flex items-center gap-2">
        {icon && <span className="text-base">{icon}</span>}
        <h2 className="m-0 text-base font-bold text-[var(--sea-ink)]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mt-0.5 text-xs font-semibold text-[var(--sea-ink-soft)]">
      {children}
    </label>
  );
}
