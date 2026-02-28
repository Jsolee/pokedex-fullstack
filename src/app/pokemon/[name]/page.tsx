import { Metadata } from "next";
import { notFound } from "next/navigation";

import { BackButton } from "@/components/navigation/back-button";
import { PokemonHero } from "@/components/pokedex/pokemon-hero";
import { PokemonStatBars } from "@/components/pokedex/pokemon-stat-bars";
import { PokemonVitals } from "@/components/pokedex/pokemon-vitals";
import { DataState } from "@/components/state/data-state";
import { getPokemonProfile, PokemonProfile } from "@/server/pokemon-service";

type PageProps = {
  params: Promise<{ name: string }> | { name: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  return {
    title: `${resolved.name} | Mini Pokédex`,
  };
}

export default async function PokemonDetailPage({ params }: PageProps) {
  const { name } = await params;
  let profile: PokemonProfile | null = null;
  try {
    profile = await getPokemonProfile(name);
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      notFound();
    }
    throw error;
  }

  if (!profile) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <BackButton />
      <PokemonHero
        key={profile.pokemon.id}
        pokemon={profile.pokemon}
        flavorText={profile.flavorText}
        spriteGallery={profile.spriteGallery}
      />
      <section className="grid gap-6 rounded-3xl border border-emerald-900/50 bg-emerald-950/70 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="pixel-font text-xs uppercase text-emerald-300">Estadísticas base</p>
          <div className="mt-4">
            <PokemonStatBars stats={profile.pokemon.stats} />
          </div>
        </div>
        <div>
          <p className="pixel-font text-xs uppercase text-emerald-300">Datos complementarios</p>
          <div className="mt-4">
            <PokemonVitals pokemon={profile.pokemon} />
          </div>
        </div>
      </section>
      <DataState
        title="Dónde encontrarlo"
        description={
          profile.encounterLocations.length
            ? profile.encounterLocations.join(" · ")
            : "No hay datos de encuentros en la PokeAPI para este Pokémon."
        }
        className="bg-emerald-950/40"
      />
    </div>
  );
}
