import { DEFAULT_PAGE_SIZE, MAX_POKEMON_COUNT, POKEAPI_BASE_URL } from "./constants";

const BASE_URL = POKEAPI_BASE_URL.replace(/\/$/, "");

async function getJson<T>(endpoint: string) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    cache: "no-store",
    headers: {
      "User-Agent": "mini-pokedex",
    },
  });

  if (!response.ok) {
    throw new Error(`PokeAPI request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    name: string;
    url: string;
  }>;
}

export interface PokemonApiResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
    back_default: string | null;
    front_shiny: string | null;
    back_shiny: string | null;
    other?: Record<string, {
      front_default?: string | null;
      back_default?: string | null;
      front_shiny?: string | null;
      back_shiny?: string | null;
      [key: string]: unknown;
    }>;
  };
  stats: Array<{
    base_stat: number;
    stat: { name: string };
  }>;
  abilities: Array<{
    ability: { name: string };
    is_hidden: boolean;
  }>;
  types: Array<{
    slot: number;
    type: { name: string; url: string };
  }>;
  location_area_encounters: string;
}

export interface PokemonTypeApiResponse {
  id: number;
  name: string;
  damage_relations: Record<string, Array<{ name: string; url: string }>>;
  pokemon: Array<{
    pokemon: { name: string; url: string };
    slot: number;
  }>;
}

export interface PokemonSpeciesResponse {
  id: number;
  name: string;
  generation: { name: string; url: string } | null;
  is_legendary: boolean;
  is_mythical: boolean;
  evolves_from_species: { name: string; url: string } | null;
  evolution_chain: { url: string } | null;
  flavor_text_entries: Array<{
    flavor_text: string;
    language: { name: string };
    version: { name: string; url: string };
  }>;
}

export interface EvolutionChainResponse {
  id: number;
  chain: {
    species: { name: string; url: string };
    evolves_to: EvolutionChainResponse["chain"][];
  };
}

export interface PokemonEncounterResponse {
  location_area: { name: string; url: string };
  version_details: Array<{
    version: { name: string; url: string };
    max_chance: number;
    encounter_details: Array<{
      min_level: number;
      max_level: number;
      chance: number;
      method: { name: string; url: string };
      condition_values: Array<{ name: string; url: string }>;
    }>;
  }>;
}

const speciesCache = new Map<string, PokemonSpeciesResponse>();
const evolutionCache = new Map<string, EvolutionChainResponse>();

export async function fetchPokemonListing(page: number, limit = DEFAULT_PAGE_SIZE) {
  const offset = Math.max(0, page - 1) * limit;
  return getJson<PokemonListResponse>(`/pokemon?limit=${limit}&offset=${offset}`);
}

export async function fetchPokemonByName(nameOrId: string) {
  const sanitized = nameOrId.trim().toLowerCase();
  return getJson<PokemonApiResponse>(`/pokemon/${sanitized}`);
}

export async function fetchAllTypes() {
  const list = await getJson<{ results: Array<{ name: string; url: string }> }>("/type?limit=1000");
  const detailed = await Promise.all(
    list.results.map(async (entry) => getJson<PokemonTypeApiResponse>(`/type/${entry.name}`)),
  );
  return detailed;
}

export async function fetchPokemonNamesByType(type: string) {
  const data = await getJson<PokemonTypeApiResponse>(`/type/${type}`);
  return data.pokemon.map((entry) => entry.pokemon.name);
}

export async function fetchGenerationSpeciesNames(generation: string) {
  const data = await getJson<{ pokemon_species: Array<{ name: string; url: string }> }>(`/generation/${generation}`);
  return data.pokemon_species.map((entry) => entry.name);
}

export async function fetchAllPokemonNames() {
  const list = await getJson<PokemonListResponse>(`/pokemon?limit=${MAX_POKEMON_COUNT}&offset=0`);
  return list.results.map((entry) => entry.name);
}

export async function fetchPokemonSpecies(nameOrId: string) {
  const key = nameOrId.trim().toLowerCase();
  if (speciesCache.has(key)) {
    return speciesCache.get(key)!;
  }
  const species = await getJson<PokemonSpeciesResponse>(`/pokemon-species/${key}`);
  speciesCache.set(key, species);
  return species;
}

export async function fetchPokemonEncounters(nameOrId: string) {
  const key = nameOrId.trim().toLowerCase();
  return getJson<PokemonEncounterResponse[]>(`/pokemon/${key}/encounters`);
}

export async function fetchEvolutionChainByUrl(url: string) {
  const normalized = url.replace(/\/$/, "");
  if (evolutionCache.has(normalized)) {
    return evolutionCache.get(normalized)!;
  }

  const relative = normalized.startsWith("http") ? normalized.replace(BASE_URL, "") : normalized;
  const chain = await getJson<EvolutionChainResponse>(relative.startsWith("/") ? relative : `/${relative}`);
  evolutionCache.set(normalized, chain);
  return chain;
}
