"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import { formatPokemonId } from "@/lib/format";
import { PokemonApiResponse } from "@/lib/pokeapi";
import { PokemonTypePill } from "./pokemon-type-pill";

type PokemonHeroProps = {
  pokemon: PokemonApiResponse;
  flavorText?: string | null;
  spriteGallery?: Array<{ key: string; label: string; url: string }>;
};

export function PokemonHero({ pokemon, flavorText, spriteGallery }: PokemonHeroProps) {
  const gallery = useMemo(
    () => (spriteGallery ?? []).filter((entry) => Boolean(entry.url)),
    [spriteGallery],
  );
  const fallbackSprite = useMemo(
    () =>
      pokemon.sprites.other?.["official-artwork"]?.front_default ??
      pokemon.sprites.front_default ??
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`,
    [pokemon.id, pokemon.sprites],
  );
  const [selectedSprite, setSelectedSprite] = useState(gallery[0]?.url ?? fallbackSprite);
  const primarySprite = selectedSprite ?? fallbackSprite;
  const description = flavorText ?? "La PokeAPI no ofrece descripción para este Pokémon.";

  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="relative overflow-hidden rounded-3xl border border-emerald-800/60 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 p-6">
        <div className="flex items-center justify-between text-xs text-emerald-200/70">
          <span className="pixel-font text-[10px] tracking-widest">{formatPokemonId(pokemon.id)}</span>
          <span className="rounded-sm bg-emerald-900/60 px-3 py-1">
            Gén I - IX
          </span>
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <h1 className="pixel-font text-2xl text-primary">{pokemon.name}</h1>
          <div className="flex flex-wrap gap-2">
            {pokemon.types.map((entry) => (
              <PokemonTypePill key={entry.type.name} typeName={entry.type.name} />
            ))}
          </div>
          <p className="text-sm text-emerald-100/80">{description}</p>
        </div>
        <div className="scanline-overlay mt-6 flex items-center justify-center">
          <Image
            src={primarySprite}
            alt={pokemon.name}
            width={400}
            height={400}
            priority
            className="max-h-[320px] object-contain"
          />
        </div>
      </div>
      <div className="grid gap-4 rounded-3xl border border-emerald-800/40 bg-emerald-950/50 p-6">
        <p className="pixel-font text-xs uppercase text-emerald-300/80">Galería de sprites</p>
        {gallery.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {gallery.map((variant) => (
              <button
                key={variant.key}
                type="button"
                onClick={() => setSelectedSprite(variant.url)}
                className={
                  "rounded-2xl border bg-emerald-950/60 p-4 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-300" +
                  (primarySprite === variant.url
                    ? " border-lime-300/80 shadow-[0_0_12px_rgba(190,242,100,0.5)]"
                    : " border-emerald-800/60 hover:border-lime-200/60")
                }
              >
                <div className="flex justify-center">
                  <Image
                    src={variant.url}
                    alt={`${pokemon.name} - ${variant.label}`}
                    width={160}
                    height={160}
                    className="h-24 w-24 object-contain"
                  />
                </div>
                <p className="mt-2 text-xs text-emerald-200/80">{variant.label}</p>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-emerald-100">No hay sprites alternativos disponibles.</p>
        )}
      </div>
    </section>
  );
}
