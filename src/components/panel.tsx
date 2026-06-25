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
        "feature-card border-border bg-card flex flex-col gap-2.5 rounded-2xl border p-4 transition-all duration-200",
        className,
      )}
    >
      <div className="mb-0.5 flex items-center gap-2">
        {icon && <span className="text-base">{icon}</span>}
        <h2 className="text-foreground m-0 text-base font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="text-muted-foreground mt-0.5 text-xs font-semibold">
      {children}
    </label>
  );
}
