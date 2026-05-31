import type { InputHTMLAttributes } from "react";

import { cn } from "../../lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      spellCheck={false}
      className={cn(
        "border-border bg-background w-full rounded-[10px] border px-3 py-2.5",
        "text-foreground font-mono text-sm outline-none transition-all duration-200",
        "placeholder:text-muted-foreground placeholder:opacity-60",
        "focus:border-ring focus:ring-ring/30 focus:ring-[3px]",
        "disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}
