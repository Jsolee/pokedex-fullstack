"use client";

import Link from "next/link";
import { Home, Package, MapPin, Leaf, Cpu, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/berries", label: "Bayas", icon: Leaf },
  { href: "/items", label: "Ítems", icon: Package },
  { href: "/locations", label: "Lugares", icon: MapPin },
  { href: "/moves", label: "Movimientos", icon: Sparkles },
  { href: "/machines", label: "Máquinas", icon: Cpu },
];

interface MainNavigationProps {
  className?: string;
}

export function MainNavigation({ className }: MainNavigationProps) {
  return (
    <nav aria-label="Navegación principal" className={cn("w-full", className)}>
      <div className="flex flex-wrap gap-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="pixel-font inline-flex items-center gap-2 rounded-2xl border border-emerald-400/70 bg-emerald-950/70 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-emerald-100 shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition hover:-translate-y-0.5 hover:bg-emerald-900/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60"
          >
            <Icon className="size-4 text-emerald-200" strokeWidth={2.5} aria-hidden="true" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
