import Link from "next/link";

import { PaginationControls } from "@/components/pagination/pagination-controls";
import { PokemonCard } from "@/components/pokedex/pokemon-card";
import { DataState } from "@/components/state/data-state";
import { SearchForm } from "@/components/search/search-form";
import {
  EVOLUTION_STAGE_OPTIONS,
  LEGENDARY_FILTER_OPTIONS,
  POKEMON_GENERATIONS,
  POKEMON_TYPE_OPTIONS,
} from "@/lib/constants";
import { getPokemonList, type PokemonFilters } from "@/server/pokemon-service";

export const dynamic = "force-dynamic";

type SearchParams =
  | Promise<Record<string, string | string[] | undefined>>
  | Record<string, string | string[] | undefined>;

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const queryParam = Array.isArray(params.query) ? params.query[0] : params.query;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const typeParam = Array.isArray(params.type) ? params.type[0] : params.type;
  const generationParam = Array.isArray(params.generation) ? params.generation[0] : params.generation;
  const evolutionParam = Array.isArray(params.evolution) ? params.evolution[0] : params.evolution;
  const legendaryParam = Array.isArray(params.legendary) ? params.legendary[0] : params.legendary;

  const page = Number(pageParam ?? 1) || 1;
  const filters = normalizeFilters({ typeParam, generationParam, evolutionParam, legendaryParam });
  const data = await getPokemonList({ page, query: queryParam ?? undefined, filters });
  const isEmpty = data.items.length === 0;
  const filtersActive = Boolean(filters.type || filters.generation || filters.evolution || filters.legendary);
  const emptyDescription = queryParam
    ? "Ningún Pokémon coincide con tu búsqueda. Intenta otro nombre o ID."
    : filtersActive
      ? "No hay Pokémon que cumplan con los filtros seleccionados. Ajusta los parámetros para ver más resultados."
      : "Ningún Pokémon coincide con tu búsqueda. Intenta con otro nombre o id.";

  return (
    <div className="space-y-10">
      <header className="rounded-3xl border border-emerald-900/50 bg-emerald-950/70 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
        <p className="pixel-font text-xs text-emerald-300">Mini Pokédex</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="pixel-font text-2xl text-primary">GameBoy View</h1>
            <p className="text-sm text-emerald-200/80">
            </p>
          </div>
          <Link
            href="/types"
            className="pixel-font rounded-md border border-emerald-400/60 bg-emerald-900/40 px-4 py-2 text-xs uppercase tracking-widest text-emerald-100 hover:bg-emerald-800/60"
          >
            Ver tipos
          </Link>
        </div>
        <div className="mt-6">
          <SearchForm
            placeholder="Busca por nombre o id"
            initialQuery={queryParam?.toString() ?? ""}
            initialFilters={filters}
            typeOptions={typeOptions}
            generationOptions={POKEMON_GENERATIONS}
            evolutionOptions={EVOLUTION_STAGE_OPTIONS}
            legendaryOptions={LEGENDARY_FILTER_OPTIONS}
          />
        </div>
      </header>

      {isEmpty ? (
        <DataState title="Sin resultados" description={emptyDescription} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((pokemon) => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} />
          ))}
        </div>
      )}

      {data.totalPages > 1 && !queryParam && (
        <div className="flex justify-center">
          <PaginationControls page={data.page} totalPages={data.totalPages} />
        </div>
      )}
    </div>
  );
}

function normalizeFilters({
  typeParam,
  generationParam,
  evolutionParam,
  legendaryParam,
}: {
  typeParam?: string;
  generationParam?: string;
  evolutionParam?: string;
  legendaryParam?: string;
}): PokemonFilters {
  const type = POKEMON_TYPE_OPTIONS.includes((typeParam ?? "") as (typeof POKEMON_TYPE_OPTIONS)[number])
    ? (typeParam as PokemonFilters["type"])
    : null;
  const generation = POKEMON_GENERATIONS.find((entry) => entry.value === generationParam)?.value ?? null;
  const evolution = EVOLUTION_STAGE_OPTIONS.find((entry) => entry.value === evolutionParam)?.value ?? null;
  const legendary =
    legendaryParam === "legendary" || legendaryParam === "standard" ? (legendaryParam as PokemonFilters["legendary"]) : null;

  return { type, generation, evolution, legendary };
}

const typeOptions = POKEMON_TYPE_OPTIONS.map((type) => ({
  value: type,
  label: type.replace(/\b\w/g, (char) => char.toUpperCase()),
}));
