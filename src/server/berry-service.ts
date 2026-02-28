import { formatSlug } from "@/lib/format";
import {
  BerryApiResponse,
  fetchBerryByName,
  fetchBerryFirmnessByName,
  fetchBerryFirmnessListing,
  fetchBerryListing,
} from "@/lib/pokeapi";

export type BerryListItem = {
  id: number;
  name: string;
  displayName: string;
  growthTime: number;
  maxHarvest: number;
  size: number;
  firmness: string | null;
  spriteUrl: string | null;
};

export type BerryListPayload = {
  items: BerryListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type BerryFilters = {
  firmness: string | null;
};

export type BerryFirmnessOption = {
  value: string;
  label: string;
};

function extractId(url: string) {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

function mapBerryToListItem(berry: BerryApiResponse): BerryListItem {
  return {
    id: berry.id,
    name: berry.name,
    displayName: formatSlug(berry.name),
    growthTime: berry.growth_time,
    maxHarvest: berry.max_harvest,
    size: berry.size,
    firmness: berry.firmness?.name ?? null,
    spriteUrl: berry.item?.name ? getBerrySpriteUrl(berry.item.name) : null,
  };
}

export function getBerrySpriteUrl(itemName: string) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${itemName}.png`;
}

export async function getBerryList(
  page = 1,
  pageSize = 20,
  query?: string,
  filters?: BerryFilters,
): Promise<BerryListPayload> {
  const sanitized = query?.trim().toLowerCase();
  const firmness = filters?.firmness?.trim().toLowerCase() ?? null;
  if (sanitized) {
    try {
      const berry = await fetchBerryByName(sanitized);
      if (firmness && berry.firmness?.name !== firmness) {
        return {
          items: [],
          total: 0,
          page: 1,
          pageSize: 1,
          totalPages: 1,
        };
      }
      const item = mapBerryToListItem(berry);
      return {
        items: [item],
        total: 1,
        page: 1,
        pageSize: 1,
        totalPages: 1,
      };
    } catch {
      return {
        items: [],
        total: 0,
        page: 1,
        pageSize: 1,
        totalPages: 1,
      };
    }
  }

  if (firmness) {
    const firmnessData = await fetchBerryFirmnessByName(firmness);
    const names = firmnessData.berries.map((entry) => entry.name).sort((a, b) => a.localeCompare(b));
    const total = names.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = Math.max(0, (page - 1) * pageSize);
    const pageNames = names.slice(start, start + pageSize);
    const items = await Promise.all(
      pageNames.map(async (name) => {
        try {
          const berry = await fetchBerryByName(name);
          return mapBerryToListItem(berry);
        } catch {
          return {
            id: 0,
            name,
            displayName: formatSlug(name),
            growthTime: 0,
            maxHarvest: 0,
            size: 0,
            firmness: formatSlug(firmness),
            spriteUrl: null,
          };
        }
      }),
    );

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  const listing = await fetchBerryListing(page, pageSize);
  const items = await Promise.all(
    listing.results.map(async (result) => {
      try {
        const berry = await fetchBerryByName(result.name);
        return mapBerryToListItem(berry);
      } catch {
        return {
          id: extractId(result.url) ?? 0,
          name: result.name,
          displayName: formatSlug(result.name),
          growthTime: 0,
          maxHarvest: 0,
          size: 0,
          firmness: null,
          spriteUrl: null,
        };
      }
    }),
  );

  const total = listing.count;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getBerryFirmnessOptions(): Promise<BerryFirmnessOption[]> {
  const listing = await fetchBerryFirmnessListing(1, 200);
  const options = listing.results.map((entry) => ({
    value: entry.name,
    label: formatSlug(entry.name),
  }));
  return options.sort((a, b) => a.label.localeCompare(b.label));
}

export async function getBerryDetail(name: string) {
  return fetchBerryByName(name);
}
