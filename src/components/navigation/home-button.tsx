"use client";

import Link from "next/link";
import { Home } from "lucide-react";

import { cn } from "@/lib/utils";

interface HomeButtonProps {
  className?: string;
}

export function HomeButton({ className }: HomeButtonProps) {
  return (
    <nav aria-label="Navegación principal" className={cn("w-full", className)}>
      <Link
        href="/"
        className="pixel-font inline-flex items-center gap-2 rounded-2xl border border-emerald-400/70 bg-emerald-950/70 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-emerald-100 shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition hover:-translate-y-0.5 hover:bg-emerald-900/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60"
      >
        <Home className="size-4 text-emerald-200" strokeWidth={2.5} aria-hidden="true" />
        Home
      </Link>
    </nav>
  );
}
