import { DEFAULT_PAGE_SIZE, MAX_POKEMON_COUNT, POKEAPI_BASE_URL } from "./constants";

const BASE_URL = POKEAPI_BASE_URL.replace(/\/$/, "");
const DEFAULT_PAGINATION_LIMIT = 250;

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
  species: { name: string; url: string };
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

export interface BerryApiResponse {
  id: number;
  name: string;
  growth_time: number;
  max_harvest: number;
  size: number;
  smoothness: number;
  soil_dryness: number;
  firmness: { name: string; url: string } | null;
  flavors: Array<{
    potency: number;
    flavor: { name: string; url: string };
  }>;
  item: { name: string; url: string } | null;
  natural_gift_power: number | null;
  natural_gift_type: { name: string; url: string } | null;
}

export interface BerryFirmnessApiResponse {
  id: number;
  name: string;
  berries: Array<{ name: string; url: string }>;
}

export interface ItemApiResponse {
  id: number;
  name: string;
  cost: number;
  fling_power: number | null;
  fling_effect: { name: string; url: string } | null;
  attributes: Array<{ name: string; url: string }>;
  category: { name: string; url: string } | null;
  effect_entries: Array<{ effect: string; short_effect: string; language: { name: string } }>;
  flavor_text_entries: Array<{ text: string; language: { name: string } }>;
  sprites: { default: string | null };
}

export interface ItemCategoryApiResponse {
  id: number;
  name: string;
  items: Array<{ name: string; url: string }>;
}

export interface LocationApiResponse {
  id: number;
  name: string;
  region: { name: string; url: string } | null;
  areas: Array<{ name: string; url: string }>;
}

export interface MoveApiResponse {
  id: number;
  name: string;
  accuracy: number | null;
  power: number | null;
  pp: number | null;
  priority: number;
  type: { name: string; url: string } | null;
  damage_class: { name: string; url: string } | null;
  effect_entries: Array<{ effect: string; short_effect: string; language: { name: string } }>;
  flavor_text_entries: Array<{ flavor_text: string; language: { name: string } }>;
  learned_by_pokemon: Array<{ name: string; url: string }>;
}

export interface MoveDamageClassApiResponse {
  id: number;
  name: string;
  moves: Array<{ name: string; url: string }>;
}

export interface MachineApiResponse {
  id: number;
  item: { name: string; url: string } | null;
  move: { name: string; url: string } | null;
  version_group: { name: string; url: string } | null;
}

export interface TypeWithMovesApiResponse {
  id: number;
  name: string;
  moves: Array<{ name: string; url: string }>;
}

const speciesCache = new Map<string, PokemonSpeciesResponse>();
const evolutionCache = new Map<string, EvolutionChainResponse>();

type NamedResource = { name: string; url: string };

async function fetchPaginatedList(
  endpoint: string,
  options?: { limit?: number; maxItems?: number },
): Promise<{ count: number; results: NamedResource[] }> {
  const limit = Math.max(1, options?.limit ?? DEFAULT_PAGINATION_LIMIT);
  const maxItems = options?.maxItems ?? Number.POSITIVE_INFINITY;
  let offset = 0;
  let totalCount = 0;
  const results: NamedResource[] = [];

  while (results.length < maxItems) {
    const page = await getJson<PokemonListResponse>(`/${endpoint}?limit=${limit}&offset=${offset}`);
    if (!totalCount) {
      totalCount = page.count;
    }

    results.push(...page.results);

    if (!page.next || page.results.length === 0) {
      break;
    }

    offset += limit;
  }

  return {
    count: totalCount || results.length,
    results: results.slice(0, maxItems),
  };
}

export async function fetchResourceListing(endpoint: string, page: number, limit = DEFAULT_PAGE_SIZE) {
  const offset = Math.max(0, page - 1) * limit;
  return getJson<PokemonListResponse>(`/${endpoint}?limit=${limit}&offset=${offset}`);
}

export async function fetchPokemonListing(page: number, limit = DEFAULT_PAGE_SIZE) {
  const offset = Math.max(0, page - 1) * limit;
  return getJson<PokemonListResponse>(`/pokemon?limit=${limit}&offset=${offset}`);
}

export async function fetchBerryListing(page: number, limit = DEFAULT_PAGE_SIZE) {
  return fetchResourceListing("berry", page, limit);
}

export async function fetchBerryFirmnessListing(page: number, limit = DEFAULT_PAGE_SIZE) {
  return fetchResourceListing("berry-firmness", page, limit);
}

export async function fetchItemListing(page: number, limit = DEFAULT_PAGE_SIZE) {
  return fetchResourceListing("item", page, limit);
}

export async function fetchAllItemListing() {
  return fetchPaginatedList("item", { limit: DEFAULT_PAGINATION_LIMIT, maxItems: 5000 });
}

export async function fetchItemCategoryListing(page: number, limit = DEFAULT_PAGE_SIZE) {
  return fetchResourceListing("item-category", page, limit);
}

export async function fetchLocationListing(page: number, limit = DEFAULT_PAGE_SIZE) {
  return fetchResourceListing("location", page, limit);
}

export async function fetchMoveListing(page: number, limit = DEFAULT_PAGE_SIZE) {
  return fetchResourceListing("move", page, limit);
}

export async function fetchMoveDamageClassListing(page: number, limit = DEFAULT_PAGE_SIZE) {
  return fetchResourceListing("move-damage-class", page, limit);
}

export async function fetchMachineListing(page: number, limit = DEFAULT_PAGE_SIZE) {
  return fetchResourceListing("machine", page, limit);
}

export async function fetchVersionGroupListing(page: number, limit = DEFAULT_PAGE_SIZE) {
  return fetchResourceListing("version-group", page, limit);
}

export async function fetchAllMachineListing() {
  return fetchPaginatedList("machine", { limit: DEFAULT_PAGINATION_LIMIT, maxItems: 5000 });
}

export async function fetchPokemonByName(nameOrId: string) {
  const sanitized = nameOrId.trim().toLowerCase();
  return getJson<PokemonApiResponse>(`/pokemon/${sanitized}`);
}

export async function fetchBerryByName(nameOrId: string) {
  const sanitized = nameOrId.trim().toLowerCase();
  return getJson<BerryApiResponse>(`/berry/${sanitized}`);
}

export async function fetchBerryFirmnessByName(nameOrId: string) {
  const sanitized = nameOrId.trim().toLowerCase();
  return getJson<BerryFirmnessApiResponse>(`/berry-firmness/${sanitized}`);
}

export async function fetchItemByName(nameOrId: string) {
  const sanitized = nameOrId.trim().toLowerCase();
  return getJson<ItemApiResponse>(`/item/${sanitized}`);
}

export async function fetchItemCategoryByName(nameOrId: string) {
  const sanitized = nameOrId.trim().toLowerCase();
  return getJson<ItemCategoryApiResponse>(`/item-category/${sanitized}`);
}

export async function fetchLocationByName(nameOrId: string) {
  const sanitized = nameOrId.trim().toLowerCase();
  return getJson<LocationApiResponse>(`/location/${sanitized}`);
}

export async function fetchMoveByName(nameOrId: string) {
  const sanitized = nameOrId.trim().toLowerCase();
  return getJson<MoveApiResponse>(`/move/${sanitized}`);
}

export async function fetchMoveDamageClassByName(nameOrId: string) {
  const sanitized = nameOrId.trim().toLowerCase();
  return getJson<MoveDamageClassApiResponse>(`/move-damage-class/${sanitized}`);
}

export async function fetchMachineById(id: number | string) {
  return getJson<MachineApiResponse>(`/machine/${id}`);
}

export async function fetchTypeWithMoves(nameOrId: string) {
  const sanitized = nameOrId.trim().toLowerCase();
  return getJson<TypeWithMovesApiResponse>(`/type/${sanitized}`);
}

export async function fetchAllTypes() {
  const list = await fetchPaginatedList("type", { limit: 100, maxItems: 1000 });
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
  const list = await fetchPaginatedList("pokemon", {
    limit: DEFAULT_PAGINATION_LIMIT,
    maxItems: MAX_POKEMON_COUNT,
  });
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
