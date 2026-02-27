export const DEFAULT_PAGE_SIZE = 20;
export const MAX_POKEMON_COUNT = 1017;

export const POKEAPI_BASE_URL =
  process.env.POKEAPI_BASE_URL ?? "https://pokeapi.co/api/v2";

export const CACHE_TTL_HOURS = Number(process.env.CACHE_TTL_HOURS ?? 24);

export const POKEMON_TYPE_OPTIONS = [
  "bug",
  "dark",
  "dragon",
  "electric",
  "fairy",
  "fighting",
  "fire",
  "flying",
  "ghost",
  "grass",
  "ground",
  "ice",
  "normal",
  "poison",
  "psychic",
  "rock",
  "steel",
  "water",
] as const;

export const POKEMON_GENERATIONS = [
  { value: "generation-i", label: "Generación I" },
  { value: "generation-ii", label: "Generación II" },
  { value: "generation-iii", label: "Generación III" },
  { value: "generation-iv", label: "Generación IV" },
  { value: "generation-v", label: "Generación V" },
  { value: "generation-vi", label: "Generación VI" },
  { value: "generation-vii", label: "Generación VII" },
  { value: "generation-viii", label: "Generación VIII" },
  { value: "generation-ix", label: "Generación IX" },
] as const;

export const EVOLUTION_STAGE_OPTIONS = [
  { value: "base", label: "Forma base" },
  { value: "stage-1", label: "Primera evolución" },
  { value: "stage-2", label: "Evolución final" },
] as const;

export const LEGENDARY_FILTER_OPTIONS = [
  { value: "legendary", label: "Legendarios" },
  { value: "standard", label: "No legendarios" },
] as const;

export type WallpaperOption = {
  src: string;
};

export const BACKGROUND_WALLPAPERS: WallpaperOption[] = [
  { src: "/backgrounds/foto2.webp" },
  { src: "/backgrounds/foto3.webp" },
  { src: "/backgrounds/foto4.webp" },
  { src: "/backgrounds/foto5.webp" },
  { src: "/backgrounds/foto6.webp" },
];

export function getGenerationLabel(value: string | null | undefined) {
  if (!value) return "Generación desconocida";
  const option = POKEMON_GENERATIONS.find((entry) => entry.value === value);
  if (option) return option.label;
  return value
    .replace("generation-", "Generación ")
    .replace(/\b([ivx]+)/i, (match) => match.toUpperCase());
}
