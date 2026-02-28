import { formatSlug } from "@/lib/format";
import { fetchLocationByName, fetchLocationListing, LocationApiResponse } from "@/lib/pokeapi";

export type LocationListItem = {
  id: number;
  name: string;
  displayName: string;
  region: string | null;
  areaCount: number;
};

export type LocationListPayload = {
  items: LocationListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function extractId(url: string) {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

function mapLocationToListItem(location: LocationApiResponse): LocationListItem {
  return {
    id: location.id,
    name: location.name,
    displayName: formatSlug(location.name),
    region: location.region?.name ? formatSlug(location.region.name) : null,
    areaCount: location.areas?.length ?? 0,
  };
}

export async function getLocationList(
  page = 1,
  pageSize = 20,
  query?: string,
): Promise<LocationListPayload> {
  const sanitized = query?.trim().toLowerCase();
  if (sanitized) {
    try {
      const location = await fetchLocationByName(sanitized);
      const entry = mapLocationToListItem(location);
      return {
        items: [entry],
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

  const listing = await fetchLocationListing(page, pageSize);
  const items = await Promise.all(
    listing.results.map(async (result) => {
      try {
        const location = await fetchLocationByName(result.name);
        return mapLocationToListItem(location);
      } catch {
        return {
          id: extractId(result.url) ?? 0,
          name: result.name,
          displayName: formatSlug(result.name),
          region: null,
          areaCount: 0,
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

export async function getLocationDetail(name: string) {
  return fetchLocationByName(name);
}
