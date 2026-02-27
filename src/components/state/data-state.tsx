import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DataStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function DataState({ title, description, action, className }: DataStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-emerald-900/40 bg-emerald-950/40 p-8 text-center text-emerald-100",
        className,
      )}
    >
      <p className="pixel-font text-sm uppercase tracking-wider text-emerald-300">{title}</p>
      {description && <p className="mt-3 text-sm text-emerald-200/80">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
