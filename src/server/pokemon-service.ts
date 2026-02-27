import {
  CACHE_TTL_HOURS,
  DEFAULT_PAGE_SIZE,
  EVOLUTION_STAGE_OPTIONS,
  MAX_POKEMON_COUNT,
  getGenerationLabel,
} from "@/lib/constants";
import { formatPokemonId } from "@/lib/format";
import {
  fetchPokemonByName,
  fetchPokemonListing,
  fetchPokemonSpecies,
  fetchEvolutionChainByUrl,
  fetchPokemonNamesByType,
  fetchGenerationSpeciesNames,
  fetchAllPokemonNames,
  EvolutionChainResponse,
  PokemonApiResponse,
  PokemonEncounterResponse,
  PokemonSpeciesResponse,
  fetchPokemonEncounters,
} from "@/lib/pokeapi";
import { runPrisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

const CACHE_TTL_MS = CACHE_TTL_HOURS * 60 * 60 * 1000;
const OFFICIAL_ARTWORK_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";
const FULL_INDEX_TTL_MS = 1000 * 60 * 60 * 6; // 6 horas
const POKEMON_INDEX_CACHE_KEY = "__pokemon_index__";
const INDEX_BUILD_CONCURRENCY = 40;

type PokemonIndexCache = {
  items: PokemonListItem[];
  timestamp: number;
};

let pokemonIndexCache: PokemonIndexCache | null = null;
let pokemonIndexPromise: Promise<PokemonListItem[]> | null = null;

function sortPokemonList(items: PokemonListItem[]) {
  return [...items].sort((a, b) => a.id - b.id);
}

type JsonCompatible = Record<string, unknown>;
type PokemonCacheRecord = Awaited<ReturnType<PrismaClient["pokemonCache"]["findUnique"]>>;
type EvolutionStage = "base" | "stage-1" | "stage-2";
type EvolutionMetadata = {
  stage: EvolutionStage;
  label: string;
  evolvesFrom: string | null;
};

export type PokemonFilters = {
  type?: string | null;
  generation?: string | null;
  evolution?: EvolutionStage | null;
  legendary?: "legendary" | "standard" | null;
};

export type PokemonListItem = {
  id: number;
  formattedId: string;
  name: string;
  sprite: string;
  types: string[];
  generation: string | null;
  generationLabel: string;
  isLegendary: boolean;
  evolutionStage: EvolutionStage;
  evolutionLabel: string;
  evolvesFrom: string | null;
};

export type PokemonListPayload = {
  items: PokemonListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isSearch: boolean;
  filtersApplied: boolean;
};

export type PokemonSpriteVariant = {
  key: string;
  label: string;
  url: string;
};

export type PokemonProfile = {
  pokemon: PokemonApiResponse;
  flavorText: string | null;
  spriteGallery: PokemonSpriteVariant[];
  encounterLocations: string[];
};

function getArtworkUrl(id: number) {
  return `${OFFICIAL_ARTWORK_URL}/${id}.png`;
}

function extractId(url: string) {
  const match = url.match(/\/pokemon\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

async function buildDetailedListItem(
  detail: PokemonApiResponse,
  options?: {
    species?: PokemonSpeciesResponse;
    evolution?: EvolutionMetadata;
    isLegendaryOverride?: boolean;
  },
): Promise<PokemonListItem> {
  try {
    const speciesName = detail.species?.name ?? detail.name;
    const species = options?.species ?? (await fetchPokemonSpecies(speciesName));
    const evolution = options?.evolution ?? (await resolveEvolutionMetadata(species));
    const isLegendary =
      options?.isLegendaryOverride ?? Boolean(species.is_legendary || species.is_mythical);
    return {
      id: detail.id,
      formattedId: formatPokemonId(detail.id),
      name: detail.name,
      sprite:
        detail.sprites.other?.["official-artwork"]?.front_default ??
        detail.sprites.front_default ??
        getArtworkUrl(detail.id),
      types: detail.types.map((entry) => entry.type.name),
      generation: species.generation?.name ?? null,
      generationLabel: getGenerationLabel(species.generation?.name),
      isLegendary,
      evolutionStage: evolution.stage,
      evolutionLabel: evolution.label,
      evolvesFrom: evolution.evolvesFrom,
    };
  } catch (error) {
    console.warn(`No se pudo enriquecer ${detail.name}`, error);
    return buildFallbackItem(detail);
  }
}

function buildFallbackItem(detail: PokemonApiResponse): PokemonListItem {
  return {
    id: detail.id,
    formattedId: formatPokemonId(detail.id),
    name: detail.name,
    sprite:
      detail.sprites.other?.["official-artwork"]?.front_default ??
      detail.sprites.front_default ??
      getArtworkUrl(detail.id),
    types: detail.types.map((entry) => entry.type.name),
    generation: null,
    generationLabel: "Generación desconocida",
    isLegendary: false,
    evolutionStage: "base",
    evolutionLabel: EVOLUTION_STAGE_OPTIONS[0].label,
    evolvesFrom: null,
  };
}

function normalizeSimpleItem(result: { name: string; url: string }): PokemonListItem {
  const id = extractId(result.url);
  if (!id) {
    return {
      id: 0,
      formattedId: "#0000",
      name: result.name,
      sprite: getArtworkUrl(0),
      types: [],
      generation: null,
      generationLabel: "Generación desconocida",
      isLegendary: false,
      evolutionStage: "base",
      evolutionLabel: EVOLUTION_STAGE_OPTIONS[0].label,
      evolvesFrom: null,
    };
  }

  return {
    id,
    formattedId: formatPokemonId(id),
    name: result.name,
    sprite: getArtworkUrl(id),
    types: [],
    generation: null,
    generationLabel: "Generación desconocida",
    isLegendary: false,
    evolutionStage: "base",
    evolutionLabel: EVOLUTION_STAGE_OPTIONS[0].label,
    evolvesFrom: null,
  };
}

export async function getPokemonList({
  page = 1,
  query,
  pageSize = DEFAULT_PAGE_SIZE,
  filters,
}: {
  page?: number;
  query?: string | null;
  pageSize?: number;
  filters?: PokemonFilters;
}): Promise<PokemonListPayload> {
  const sanitizedQuery = query?.trim().toLowerCase() ?? "";
  const hasFilters = hasActiveFilters(filters);
  if (sanitizedQuery) {
    try {
      const detail = await getPokemonDetail(sanitizedQuery);
      const enriched = await buildDetailedListItem(detail);
      const matches = !hasFilters || matchesFilters(enriched, filters!);
      return {
        items: matches ? [enriched] : [],
        total: matches ? 1 : 0,
        page: 1,
        pageSize: 1,
        totalPages: 1,
        isSearch: true,
        filtersApplied: hasFilters,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return {
          items: [],
          total: 0,
          page: 1,
          pageSize: 1,
          totalPages: 1,
          isSearch: true,
          filtersApplied: hasFilters,
        };
      }
      throw error;
    }
  }
  if (hasFilters) {
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const filteredItems = await collectFilteredPokemon(filters!);
    const total = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const normalizedPage = Math.min(Math.max(1, safePage), totalPages);
    const start = (normalizedPage - 1) * pageSize;
    const items = filteredItems.slice(start, start + pageSize);

    return {
      items,
      total,
      page: normalizedPage,
      pageSize,
      totalPages,
      isSearch: true,
      filtersApplied: true,
    };
  }

  const safePage = Number.isFinite(page) && page > 0 ? page : 1;

  try {
    const index = await getFullPokemonIndex();
    const total = Math.min(index.length, MAX_POKEMON_COUNT);
    if (total > 0) {
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const normalizedPage = Math.min(Math.max(1, safePage), totalPages);
      const start = (normalizedPage - 1) * pageSize;
      const items = index.slice(start, start + pageSize);

      return {
        items,
        total,
        page: normalizedPage,
        pageSize,
        totalPages,
        isSearch: false,
        filtersApplied: false,
      };
    }
  } catch (error) {
    console.warn("No se pudo paginar desde el índice completo, usando listado remoto", error);
  }

  const listing = await fetchPokemonListing(safePage, pageSize);
  const items = await Promise.all(
    listing.results.map(async (result) => {
      try {
        const detail = await fetchPokemonByName(result.name);
        return await buildDetailedListItem(detail);
      } catch {
        return normalizeSimpleItem(result);
      }
    }),
  );

  const total = Math.min(listing.count, MAX_POKEMON_COUNT);
  const totalPages = Math.ceil(total / pageSize);

  return {
    items,
    total,
    page: safePage,
    pageSize,
    totalPages,
    isSearch: false,
    filtersApplied: false,
  };
}

export async function getPokemonDetail(nameOrId: string): Promise<PokemonApiResponse> {
  const key = nameOrId.trim().toLowerCase();
  const existing = (await runPrisma((client) =>
    client.pokemonCache.findUnique({
      where: { name: key },
    }),
  )) as PokemonCacheRecord | null;

  if (existing && isFresh(existing.updatedAt)) {
    return existing.payload as unknown as PokemonApiResponse;
  }

  const detail = await fetchPokemonByName(key);

  const payload = detail as unknown as JsonCompatible;
  await runPrisma((client) =>
    client.pokemonCache.upsert({
      where: { name: key },
      update: { payload: payload as unknown as never },
      create: { name: key, payload: payload as unknown as never },
    }),
  );

  return detail;
}

export async function getPokemonProfile(nameOrId: string): Promise<PokemonProfile> {
  const pokemon = await getPokemonDetail(nameOrId);
  const [species, encounters] = await Promise.all([
    fetchPokemonSpecies(pokemon.name),
    fetchPokemonEncounters(pokemon.name),
  ]);

  return {
    pokemon,
    flavorText: selectFlavorText(species),
    spriteGallery: buildSpriteGallery(pokemon),
    encounterLocations: buildEncounterLocations(encounters),
  };
}

function isFresh(updatedAt: Date) {
  return Date.now() - new Date(updatedAt).getTime() < CACHE_TTL_MS;
}

function hasActiveFilters(filters?: PokemonFilters) {
  if (!filters) return false;
  return Boolean(filters.type || filters.generation || filters.evolution || filters.legendary);
}

async function resolveEvolutionMetadata(species: PokemonSpeciesResponse): Promise<EvolutionMetadata> {
  if (!species.evolution_chain?.url) {
    return {
      stage: "base" as EvolutionStage,
      label: EVOLUTION_STAGE_OPTIONS[0].label,
      evolvesFrom: species.evolves_from_species?.name ?? null,
    };
  }

  try {
    const chain = await fetchEvolutionChainByUrl(species.evolution_chain.url);
    const depth = findSpeciesDepth(chain.chain, species.name, 0);
    const stage = depth <= 0 ? "base" : depth === 1 ? "stage-1" : "stage-2";
    const label =
      stage === "base"
        ? EVOLUTION_STAGE_OPTIONS[0].label
        : stage === "stage-1"
          ? EVOLUTION_STAGE_OPTIONS[1].label
          : EVOLUTION_STAGE_OPTIONS[2].label;
    return {
      stage,
      label,
      evolvesFrom: species.evolves_from_species?.name ?? null,
    };
  } catch (error) {
    console.warn("No se pudo obtener la cadena evolutiva", error);
    return {
      stage: "base" as EvolutionStage,
      label: EVOLUTION_STAGE_OPTIONS[0].label,
      evolvesFrom: species.evolves_from_species?.name ?? null,
    };
  }
}

function findSpeciesDepth(
  node: EvolutionChainResponse["chain"],
  targetName: string,
  depth: number,
): number {
  if (node.species.name === targetName) {
    return depth;
  }

  for (const child of node.evolves_to) {
    const result = findSpeciesDepth(child, targetName, depth + 1);
    if (result !== -1) {
      return result;
    }
  }

  return -1;
}

function matchesFilters(pokemon: PokemonListItem, filters: PokemonFilters) {
  if (filters.type && !pokemon.types.includes(filters.type)) {
    return false;
  }

  if (filters.generation && pokemon.generation !== filters.generation) {
    return false;
  }

  if (filters.evolution && pokemon.evolutionStage !== filters.evolution) {
    return false;
  }

  if (filters.legendary === "legendary" && !pokemon.isLegendary) {
    return false;
  }

  if (filters.legendary === "standard" && pokemon.isLegendary) {
    return false;
  }

  return true;
}

async function collectFilteredPokemon(filters: PokemonFilters) {
  try {
    const index = await getFullPokemonIndex();
    const filtered = index.filter((pokemon: PokemonListItem) => matchesFilters(pokemon, filters));
    return sortPokemonList(filtered);
  } catch (error) {
    console.warn("No se pudo usar el índice completo, aplicando método alternativo", error);
    return collectFilteredPokemonLegacy(filters);
  }
}

async function collectFilteredPokemonLegacy(filters: PokemonFilters) {
  const candidateNames = await resolveCandidateNames(filters);
  const uniqueNames = Array.from(new Set(candidateNames)).slice(0, MAX_POKEMON_COUNT);

  const speciesEntries = await mapWithBatches(uniqueNames, 12, async (name) => {
    try {
      const species = await fetchPokemonSpecies(name);
      const evolution = await resolveEvolutionMetadata(species);
      const metadata = {
        generation: species.generation?.name ?? null,
        isLegendary: Boolean(species.is_legendary || species.is_mythical),
        evolutionStage: evolution.stage,
      } as const;

      return { name, species, evolution, metadata };
    } catch (error) {
      console.warn(`No se pudo obtener metadata para ${name}`, error);
      return null;
    }
  });

  const matchingEntries = speciesEntries.filter(
    (entry): entry is NonNullable<typeof entry> => Boolean(entry && matchesMetadata(filters, entry.metadata)),
  );

  const detailed = await mapWithBatches(matchingEntries, 8, async (entry) => {
    try {
      const detail = await fetchPokemonByName(entry.name);
      const enriched = await buildDetailedListItem(detail, {
        species: entry.species,
        evolution: entry.evolution,
        isLegendaryOverride: entry.metadata.isLegendary,
      });

      if (filters.type && !enriched.types.includes(filters.type)) {
        return null;
      }

      return enriched;
    } catch (error) {
      console.warn(`No se pudo enriquecer ${entry.name}`, error);
      return null;
    }
  });

  return detailed.filter((item): item is PokemonListItem => Boolean(item));
}

async function getFullPokemonIndex(): Promise<PokemonListItem[]> {
  if (pokemonIndexCache && Date.now() - pokemonIndexCache.timestamp < FULL_INDEX_TTL_MS) {
    return pokemonIndexCache.items;
  }

  const cached = await loadPokemonIndexFromDatabase();
  if (cached) {
    pokemonIndexCache = cached;
    return cached.items;
  }

  if (pokemonIndexPromise) {
    return pokemonIndexPromise;
  }

  pokemonIndexPromise = buildPokemonIndex()
    .then(async (items) => {
      pokemonIndexCache = { items, timestamp: Date.now() };
      await persistPokemonIndex(items);
      return items;
    })
    .finally(() => {
      pokemonIndexPromise = null;
    });

  return pokemonIndexPromise;
}

async function buildPokemonIndex(): Promise<PokemonListItem[]> {
  const names = await fetchAllPokemonNames();
  const seenSpecies = new Set<string>();

  const detailed = await mapWithBatches(names, INDEX_BUILD_CONCURRENCY, async (name) => {
    try {
      const detail = await fetchPokemonByName(name);
      const speciesName = detail.species?.name ?? detail.name;
      if (seenSpecies.has(speciesName)) {
        return null;
      }
      seenSpecies.add(speciesName);

      const species = await fetchPokemonSpecies(speciesName);
      const evolution = await resolveEvolutionMetadata(species);

      return await buildDetailedListItem(detail, {
        species,
        evolution,
        isLegendaryOverride: Boolean(species.is_legendary || species.is_mythical),
      });
    } catch (error) {
      console.warn(`No se pudo indexar ${name}`, error);
      return null;
    }
  });

  const enriched = detailed.filter((item): item is PokemonListItem => Boolean(item));
  return sortPokemonList(enriched);
}

async function loadPokemonIndexFromDatabase(): Promise<PokemonIndexCache | null> {
  try {
    const record = (await runPrisma((client) =>
      client.pokemonCache.findUnique({ where: { name: POKEMON_INDEX_CACHE_KEY } }),
    )) as PokemonCacheRecord | null;

    if (!record) {
      return null;
    }

    if (Date.now() - new Date(record.updatedAt).getTime() > FULL_INDEX_TTL_MS) {
      return null;
    }

  const hydrated = ((record.payload ?? []) as PokemonListItem[]).filter(Boolean);
  const items = sortPokemonList(hydrated);
  return { items, timestamp: new Date(record.updatedAt).getTime() };
  } catch (error) {
    console.warn(
      "[cache] No se pudo cargar el índice desde Supabase, usando únicamente cache en memoria",
      error,
    );
    return null;
  }
}

async function persistPokemonIndex(items: PokemonListItem[]) {
  try {
    await runPrisma((client) =>
      client.pokemonCache.upsert({
        where: { name: POKEMON_INDEX_CACHE_KEY },
        update: { payload: items as unknown as never },
        create: { name: POKEMON_INDEX_CACHE_KEY, payload: items as unknown as never },
      }),
    );
  } catch (error) {
    console.warn("No se pudo guardar el índice en Supabase", error);
  }
}

function selectFlavorText(species: PokemonSpeciesResponse) {
  if (!species.flavor_text_entries?.length) {
    return null;
  }

  const preferredLanguages = ["es", "en"];
  for (const lang of preferredLanguages) {
    const entry = species.flavor_text_entries.find((item) => item.language.name === lang);
    if (entry) {
      return normalizeFlavorText(entry.flavor_text);
    }
  }

  return normalizeFlavorText(species.flavor_text_entries[0].flavor_text);
}

function normalizeFlavorText(text: string) {
  return text.replace(/[\n\f]+/g, " ").replace(/\s+/g, " ").trim();
}

function buildSpriteGallery(pokemon: PokemonApiResponse): PokemonSpriteVariant[] {
  const variants = [
    {
      key: "official",
      label: "Arte oficial",
      url: pokemon.sprites.other?.["official-artwork"]?.front_default ?? null,
    },
    {
      key: "front-default",
      label: "Frente clásico",
      url: pokemon.sprites.front_default,
    },
    {
      key: "back-default",
      label: "Espalda clásica",
      url: pokemon.sprites.back_default,
    },
    {
      key: "front-shiny",
      label: "Frente shiny",
      url:
        pokemon.sprites.front_shiny ??
        pokemon.sprites.other?.["official-artwork"]?.front_shiny ??
        null,
    },
    {
      key: "back-shiny",
      label: "Espalda shiny",
      url: pokemon.sprites.back_shiny,
    },
    {
      key: "home",
      label: "Modelo moderno",
      url: pokemon.sprites.other?.home?.front_default ?? null,
    },
  ];

  const deduped: PokemonSpriteVariant[] = [];
  variants.forEach((variant) => {
    if (variant.url && !deduped.some((entry) => entry.url === variant.url)) {
      deduped.push({ key: variant.key, label: variant.label, url: variant.url });
    }
  });

  return deduped;
}

function buildEncounterLocations(encounters: PokemonEncounterResponse[]) {
  if (!encounters?.length) {
    return [];
  }

  const labels = encounters.map((encounter) => {
    const location = formatSlug(encounter.location_area.name);
    const versions = Array.from(
      new Set(encounter.version_details.map((detail) => formatSlug(detail.version.name))),
    ).slice(0, 3);
    const versionLabel = versions.length ? ` (${versions.join(", ")})` : "";
    return `${location}${versionLabel}`;
  });

  const unique: string[] = [];
  labels.forEach((label) => {
    if (!unique.includes(label)) {
      unique.push(label);
    }
  });

  return unique.slice(0, 4);
}

function formatSlug(value: string) {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ")
    .replace(/\bDe\b/gi, "de")
    .replace(/\bLa\b/gi, "la")
    .trim();
}

async function resolveCandidateNames(filters: PokemonFilters): Promise<string[]> {
  let candidate: string[] | null = null;

  if (filters.type) {
    candidate = await fetchPokemonNamesByType(filters.type);
  }

  if (filters.generation) {
    const generationNames = await fetchGenerationSpeciesNames(filters.generation);
    candidate = candidate ? intersectNameLists(candidate, generationNames) : generationNames;
  }

  if (!candidate || candidate.length === 0) {
    return fetchAllPokemonNames();
  }

  return candidate;
}

function intersectNameLists(primary: string[], secondary: string[]) {
  const set = new Set(secondary);
  return primary.filter((name) => set.has(name));
}

function matchesMetadata(
  filters: PokemonFilters,
  metadata: { generation: string | null; isLegendary: boolean; evolutionStage: EvolutionStage },
) {
  if (filters.generation && metadata.generation !== filters.generation) {
    return false;
  }

  if (filters.legendary === "legendary" && !metadata.isLegendary) {
    return false;
  }

  if (filters.legendary === "standard" && metadata.isLegendary) {
    return false;
  }

  if (filters.evolution && metadata.evolutionStage !== filters.evolution) {
    return false;
  }

  return true;
}

async function mapWithBatches<T, R>(items: T[], batchSize: number, mapper: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize);
    const chunkResults = await Promise.all(chunk.map((item, chunkIndex) => mapper(item, i + chunkIndex)));
    results.push(...chunkResults);
  }
  return results;
}

