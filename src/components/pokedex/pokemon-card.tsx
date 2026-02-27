import Image from "next/image";
import Link from "next/link";

import { PokemonListItem } from "@/server/pokemon-service";
import { PokemonTypePill } from "./pokemon-type-pill";

export function PokemonCard({ pokemon }: { pokemon: PokemonListItem }) {
  const displayName = pokemon.name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
  const evolvesFromLabel = pokemon.evolvesFrom
    ? pokemon.evolvesFrom.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    : null;

  return (
    <Link
      href={`/pokemon/${pokemon.name}`}
      className="group flex flex-col gap-3 rounded-2xl border border-emerald-900/50 bg-card/60 p-4 transition hover:-translate-y-1 hover:border-emerald-400/80 hover:bg-card/80"
    >
      <div className="flex items-center justify-between text-xs text-emerald-200/80">
        <span className="pixel-font text-[10px] tracking-widest">{pokemon.formattedId}</span>
        <span className="rounded-sm bg-emerald-900/40 px-2 py-0.5">Ficha</span>
      </div>
      <div className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-emerald-900/30 p-3">
        <Image
          src={pokemon.sprite}
          alt={pokemon.name}
          fill
          sizes="144px"
          className="object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)] group-hover:scale-105"
        />
      </div>
      <div className="space-y-2">
  <h3 className="pixel-font text-sm text-primary">{displayName}</h3>
        <div className="flex flex-wrap gap-1">
          {pokemon.types.map((type) => (
            <PokemonTypePill key={type} typeName={type} size="sm" />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.15em] text-emerald-200/70">
          <span className="rounded-md border border-emerald-500/40 px-2 py-0.5">{pokemon.generationLabel}</span>
          <span className="rounded-md border border-emerald-500/20 px-2 py-0.5">{pokemon.evolutionLabel}</span>
          {pokemon.isLegendary && (
            <span className="rounded-md border border-yellow-400/60 px-2 py-0.5 text-yellow-200">Legendario</span>
          )}
        </div>
        {evolvesFromLabel && (
          <p className="text-[11px] text-emerald-200/70">
            Evoluciona de <span className="font-semibold text-emerald-100">{evolvesFromLabel}</span>
          </p>
        )}
      </div>
    </Link>
  );
}
